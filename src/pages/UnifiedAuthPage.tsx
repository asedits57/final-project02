import { useRef, useCallback, useEffect, useReducer, type SVGProps } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, RefreshCw, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@components/ui/form";
import { useToast } from "@hooks/use-toast";
import AnimatedBackground from "@components/shared/AnimatedBackground";
import { useAuthStore as useStore } from "@store/useAuthStore";
import { apiService as api } from "@services/apiService";
import { getPostLoginPath, preloadPostLoginRoute } from "@lib/authRedirect";
import { buildGoogleAuthUrl, resolveGoogleOAuthConfig, storeGoogleRedirectUri } from "@lib/googleAuth";

const GoogleIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <title>Google</title>
    <path
      fill="currentColor"
      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .533 5.333.533 12S5.867 24 12.48 24c3.44 0 6.013-1.147 8.027-3.267 2.053-2.08 2.627-5.12 2.627-7.467 0-.573-.053-1.093-.12-1.627h-10.53z"
    />
  </svg>
);

const loginSchema = z.object({
  userId: z.string().min(1, "User ID or Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const step1Schema = z.object({
  email: z.string().email("Invalid email address"),
});

const step3Schema = z.object({
  email: z.string().email("Invalid email address"),
  fullName: z.string().min(2, "Full Name is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AuthStep = "credentials" | "otp" | "account";

interface AuthPageState {
  isLogin: boolean;
  step: AuthStep;
  isLoading: boolean;
  otpValue: string;
  otpRequestId: string;
  email: string;
  showPassword: boolean;
  error: string | null;
  seconds: number;
}

type AuthAction =
  | { type: "TOGGLE_MODE" }
  | { type: "SET_STEP"; payload: AuthStep }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_OTP"; payload: string }
  | { type: "SET_OTP_REQUEST_ID"; payload: string }
  | { type: "SET_EMAIL"; payload: string }
  | { type: "TOGGLE_PASSWORD" }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "TICK" }
  | { type: "START_COUNTDOWN"; payload: number };

const initialAuthState: AuthPageState = {
  isLogin: true,
  step: "credentials",
  isLoading: false,
  otpValue: "",
  otpRequestId: "",
  email: "",
  showPassword: false,
  error: null,
  seconds: 0,
};

function authReducer(state: AuthPageState, action: AuthAction): AuthPageState {
  switch (action.type) {
    case "TOGGLE_MODE":
      return { ...initialAuthState, isLogin: !state.isLogin };
    case "SET_STEP":
      return { ...state, step: action.payload, error: null };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_OTP":
      return { ...state, otpValue: action.payload };
    case "SET_OTP_REQUEST_ID":
      return { ...state, otpRequestId: action.payload };
    case "SET_EMAIL":
      return { ...state, email: action.payload };
    case "TOGGLE_PASSWORD":
      return { ...state, showPassword: !state.showPassword };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "TICK":
      return { ...state, seconds: Math.max(0, state.seconds - 1) };
    case "START_COUNTDOWN":
      return { ...state, seconds: Math.max(0, action.payload) };
    default:
      return state;
  }
}

const UnifiedAuthPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const currentUser = useStore((state) => state.user);
  const setStoreUser = useStore((state) => state.setUser);
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  const { isLogin, step, isLoading, otpValue, otpRequestId, email, showPassword, error, seconds } = state;
  const canResend = seconds === 0;

  useEffect(() => {
    if (seconds <= 0) {
      return;
    }

    const timer = window.setTimeout(() => dispatch({ type: "TICK" }), 1000);
    return () => window.clearTimeout(timer);
  }, [seconds]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && token !== "undefined" && isLogin) {
      navigate(getPostLoginPath(currentUser), { replace: true });
    }
  }, [currentUser, navigate, isLogin]);

  const stepRef = useRef(step);
  const isLoginRef = useRef(isLogin);
  const inviteModeInitializedRef = useRef(false);
  stepRef.current = step;
  isLoginRef.current = isLogin;

  const form = useForm<z.infer<typeof loginSchema> | z.infer<typeof step1Schema> | z.infer<typeof step3Schema>>({
    resolver: (values, context, options) => {
      const schema = isLoginRef.current
        ? loginSchema
        : stepRef.current === "account"
          ? step3Schema
          : step1Schema;
      return zodResolver(schema)(values, context, options) as never;
    },
    defaultValues: { fullName: "", email: "", password: "" },
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const requestedMode = params.get("mode");
    const invitedEmail = params.get("email")?.trim();

    if (requestedMode === "signup" && isLogin && !inviteModeInitializedRef.current) {
      inviteModeInitializedRef.current = true;
      dispatch({ type: "TOGGLE_MODE" });
      return;
    }

    if (!invitedEmail) {
      return;
    }

    if (isLogin) {
      form.setValue("userId" as never, invitedEmail as never);
    } else {
      form.setValue("email" as never, invitedEmail as never);
      dispatch({ type: "SET_EMAIL", payload: invitedEmail });
    }
  }, [form, isLogin]);

  const sendOtp = useCallback(
    async (emailValue: string, existingRequestId?: string) => {
      const response = existingRequestId
        ? await api.resendSignupOtp(existingRequestId)
        : await api.sendSignupOtp(emailValue);

      dispatch({ type: "SET_OTP_REQUEST_ID", payload: response.requestId });
      dispatch({ type: "SET_EMAIL", payload: response.email });
      dispatch({ type: "START_COUNTDOWN", payload: response.resendAvailableIn });

      toast({
        title: "Verification code sent",
        description: `A 6-digit OTP was sent to ${response.email}.`,
      });
    },
    [toast],
  );

  const onSubmit = async (values: Record<string, unknown>) => {
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });

    try {
      if (isLogin) {
        const res = await api.login(values.userId as string, values.password as string);
        localStorage.setItem("token", res.accessToken);
        setStoreUser(res.user);
        await preloadPostLoginRoute(res.user);
        toast({ title: "Welcome back", description: "You are now in the MEC Learning workspace." });
        navigate(getPostLoginPath(res.user), { replace: true });
      } else if (step === "credentials") {
        await sendOtp((values.email as string).trim());
        dispatch({ type: "SET_STEP", payload: "otp" });
      } else if (step === "otp") {
        if (!otpRequestId) {
          throw new Error("Your verification request is missing. Request a new code.");
        }

        if (otpValue.length !== 6) {
          throw new Error("Please enter the full 6-digit OTP.");
        }

        const verification = await api.verifySignupOtp(otpRequestId, otpValue);
        dispatch({ type: "SET_EMAIL", payload: verification.email });
        dispatch({ type: "SET_OTP", payload: "" });
        dispatch({ type: "SET_STEP", payload: "account" });
        form.setValue("email", verification.email);
      } else {
        const res = await api.register(
          values.email as string,
          values.password as string,
          values.fullName as string,
          undefined,
          undefined,
          otpRequestId,
        );
        localStorage.setItem("token", res.accessToken);
        setStoreUser(res.user);
        await preloadPostLoginRoute(res.user);
        toast({ title: "Account created", description: "Your MEC Learning account is ready." });
        navigate(getPostLoginPath(res.user), { replace: true });
      }
    } catch (submitError: any) {
      const message = submitError?.message || "Something went wrong.";
      dispatch({ type: "SET_ERROR", payload: message });
      toast({
        title: isLogin ? "Sign in failed" : "Registration failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const resendOtp = async () => {
    if (!canResend || !otpRequestId) {
      return;
    }

    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });

    try {
      await sendOtp(email, otpRequestId);
      dispatch({ type: "SET_OTP", payload: "" });
    } catch (resendError: any) {
      dispatch({ type: "SET_ERROR", payload: resendError?.message || "Failed to resend OTP" });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const googleConfig = await resolveGoogleOAuthConfig();
      storeGoogleRedirectUri(googleConfig.redirectUri);
      window.location.href = buildGoogleAuthUrl(googleConfig);
    } catch (googleError: any) {
      dispatch({ type: "SET_ERROR", payload: googleError?.message || "Google login failed" });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  return (
    <div className="relative min-h-screen animated-bg overflow-hidden text-foreground">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -left-28 top-[-8rem] h-[30rem] w-[30rem] rounded-full bg-violet-500/15 blur-3xl" />
        <div className="absolute bottom-[-10rem] right-[-8rem] h-[26rem] w-[26rem] rounded-full bg-cyan-400/10 blur-3xl" />
      </div>
      <AnimatedBackground />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-2xl items-center justify-center px-4 py-8 sm:px-6">
        <motion.section
          className="w-full"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
            <div className="app-surface mx-auto w-full max-w-lg px-6 py-7 sm:px-8">
              <div className="mb-6 flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/12 ring-1 ring-violet-300/20">
                  <RefreshCw className="h-5 w-5 text-violet-200" />
                </div>
                <div className="mt-3">
                  <p className="text-xs uppercase tracking-[0.26em] text-violet-200/70">
                    {isLogin ? "Access" : "Onboarding"}
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-white">
                    {isLogin ? "Sign in" : step === "otp" ? "Verify your email" : step === "account" ? "Complete account" : "Start signup"}
                  </h2>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {step === "otp" && !isLogin ? (
                  <motion.div
                    key="otp"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="space-y-5"
                  >
                    <div className="text-center">
                      <p className="text-sm text-white">Enter the 6-digit OTP</p>
                      <p className="mt-1 text-sm text-slate-300/72">
                        We sent a verification code to <span className="font-medium text-violet-200">{email}</span>.
                      </p>
                    </div>

                    <div className="grid grid-cols-6 gap-2">
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <input
                          key={index}
                          type="text"
                          maxLength={1}
                          inputMode="numeric"
                          className="h-14 rounded-2xl border border-white/10 bg-white/5 text-center text-lg font-semibold text-white outline-none transition focus:border-violet-400"
                          onChange={(event) => {
                            const nextValue = event.target.value.replace(/\D/g, "");
                            const current = otpValue.split("");
                            current[index] = nextValue;
                            dispatch({ type: "SET_OTP", payload: current.join("") });
                            if (nextValue && index < 5) {
                              (event.target.nextElementSibling as HTMLInputElement | null)?.focus();
                            }
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Backspace" && !otpValue[index] && index > 0) {
                              (event.currentTarget.previousElementSibling as HTMLInputElement | null)?.focus();
                            }
                          }}
                        />
                      ))}
                    </div>

                    <Button
                      type="button"
                      onClick={() => void onSubmit({})}
                      className="h-12 w-full rounded-2xl bg-violet-500 text-white hover:bg-violet-400"
                      disabled={isLoading}
                    >
                      {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Verify and continue"}
                    </Button>

                    <button
                      type="button"
                      onClick={() => void resendOtp()}
                      disabled={!canResend || isLoading}
                      className="block w-full text-center text-sm text-violet-200 transition hover:text-violet-100 disabled:cursor-not-allowed disabled:text-slate-400"
                    >
                      {canResend ? "Resend OTP" : `Resend OTP in ${seconds}s`}
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key={isLogin ? "login" : step}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                  >
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {isLogin ? (
                          <>
                            <FormField
                              control={form.control}
                              name="userId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs uppercase tracking-[0.24em] text-slate-400">User ID or Email</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-violet-200/65" />
                                      <Input
                                        {...field}
                                        value={(field.value as string) || ""}
                                        placeholder="Your email or username"
                                        className="h-12 rounded-2xl border-white/10 bg-white/5 pl-11 text-white"
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="password"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs uppercase tracking-[0.24em] text-slate-400">Password</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Input
                                        {...field}
                                        value={(field.value as string) || ""}
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        className="h-12 rounded-2xl border-white/10 bg-white/5 pr-11 text-white"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => dispatch({ type: "TOGGLE_PASSWORD" })}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-violet-200/65 transition hover:text-violet-100"
                                      >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                      </button>
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </>
                        ) : step === "credentials" ? (
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs uppercase tracking-[0.24em] text-slate-400">Email Address</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-violet-200/65" />
                                    <Input
                                      {...field}
                                      value={(field.value as string) || ""}
                                      type="email"
                                      placeholder="Where should we send your OTP?"
                                      className="h-12 rounded-2xl border-white/10 bg-white/5 pl-11 text-white"
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        ) : (
                          <>
                            <FormField
                              control={form.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs uppercase tracking-[0.24em] text-slate-400">Verified Email</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      value={(field.value as string) || ""}
                                      readOnly
                                      className="h-12 rounded-2xl border-white/10 bg-white/5 text-white"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="fullName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs uppercase tracking-[0.24em] text-slate-400">Full Name</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      value={(field.value as string) || ""}
                                      placeholder="Your full name"
                                      className="h-12 rounded-2xl border-white/10 bg-white/5 text-white"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="password"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs uppercase tracking-[0.24em] text-slate-400">Password</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      value={(field.value as string) || ""}
                                      type="password"
                                      placeholder="Choose a password"
                                      className="h-12 rounded-2xl border-white/10 bg-white/5 text-white"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </>
                        )}

                        <Button
                          type="submit"
                          className="h-12 w-full rounded-2xl bg-violet-500 text-white hover:bg-violet-400"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : isLogin ? (
                            "Sign in"
                          ) : step === "account" ? (
                            "Create account"
                          ) : (
                            "Continue"
                          )}
                        </Button>

                        {error && <p className="text-center text-sm text-red-300">{error}</p>}

                        {isLogin && (
                          <>
                            <div className="relative my-6">
                              <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10" />
                              </div>
                              <div className="relative flex justify-center text-xs uppercase tracking-[0.24em] text-slate-400">
                                <span className="bg-[rgba(14,12,28,0.95)] px-3">or continue with</span>
                              </div>
                            </div>

                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => void handleGoogleLogin()}
                              disabled={isLoading}
                              className="h-12 w-full rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10"
                            >
                              <GoogleIcon className="mr-2 h-4 w-4" />
                              Continue with Google
                            </Button>
                          </>
                        )}
                      </form>
                    </Form>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-6 border-t border-white/8 pt-5 text-center">
                <button
                  type="button"
                  onClick={() => {
                    dispatch({ type: "TOGGLE_MODE" });
                    form.reset();
                  }}
                  className="text-sm text-slate-300/78 transition hover:text-violet-100"
                >
                  {isLogin ? "Do not have an account? Sign up" : "Already have an account? Sign in"}
                </button>
              </div>
            </div>
        </motion.section>
      </div>
    </div>
  );
};

export default UnifiedAuthPage;
