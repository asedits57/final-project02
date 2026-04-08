import { lazy, Suspense, useState, useRef, useCallback, useEffect, useReducer } from "react";
import { FloatingWord } from "@components/shared/FloatingWord";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Eye, EyeOff, User, Mail, Phone, Github, RefreshCw, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@components/ui/form";
import { useToast } from "@hooks/use-toast";
import { type UserLevel, type AuthUser } from "@lib/auth";
import { useAuthStore as useStore } from "@store/useAuthStore";
import { apiService as api } from "@services/apiService";

// Deferred: load particle canvas only after card is visible
const AnimatedBackground = lazy(() => import("@components/shared/AnimatedBackground"));

// ------------------------------------------------------------------
// Google Icon
// ------------------------------------------------------------------
const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <title>Google</title>
        <path fill="currentColor" d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .533 5.333.533 12S5.867 24 12.48 24c3.44 0 6.013-1.147 8.027-3.267 2.053-2.08 2.627-5.12 2.627-7.467 0-.573-.053-1.093-.12-1.627h-10.53z" />
    </svg>
);

// ------------------------------------------------------------------
// Validation Schemas
// ------------------------------------------------------------------
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
    username: z.string().min(3, "Username must be at least 3 characters"),
    dept: z.string().min(2, "Dept name is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

// ------------------------------------------------------------------
// State Types & Reducer
// ------------------------------------------------------------------
interface AuthPageState {
    isLogin: boolean;
    step: AuthStep;
    isLoading: boolean;
    otpValue: string;
    generatedOtp: string;
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
    | { type: "SET_GENERATED_OTP"; payload: string }
    | { type: "SET_EMAIL"; payload: string }
    | { type: "TOGGLE_PASSWORD" }
    | { type: "SET_ERROR"; payload: string | null }
    | { type: "TICK" }
    | { type: "START_COUNTDOWN" }
    | { type: "RESET_FORM" };

const initialAuthState: AuthPageState = {
    isLogin: true,
    step: "credentials",
    isLoading: false,
    otpValue: "",
    generatedOtp: "",
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
        case "SET_GENERATED_OTP":
            return { ...state, generatedOtp: action.payload };
        case "SET_EMAIL":
            return { ...state, email: action.payload };
        case "TOGGLE_PASSWORD":
            return { ...state, showPassword: !state.showPassword };
        case "SET_ERROR":
            return { ...state, error: action.payload };
        case "TICK":
            return { ...state, seconds: Math.max(0, state.seconds - 1) };
        case "START_COUNTDOWN":
            return { ...state, seconds: 30 };
        case "RESET_FORM":
            return { ...initialAuthState, isLogin: state.isLogin };
        default:
            return state;
    }
}

const AuthPage = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const setStoreUser = useStore(state => state.setUser);

    const [state, dispatch] = useReducer(authReducer, initialAuthState);
    const { 
        isLogin, step, isLoading, otpValue, generatedOtp, 
        email, showPassword, error, seconds 
    } = state;

    const canResend = seconds === 0;

    useEffect(() => {
        if (seconds > 0) {
            const timer = setTimeout(() => dispatch({ type: "TICK" }), 1000);
            return () => clearTimeout(timer);
        }
    }, [seconds]);

    const stepRef = useRef(step);
    const isLoginRef = useRef(isLogin);
    stepRef.current = step;
    isLoginRef.current = isLogin;

    // ── REDIRECT IF ALREADY LOGGED IN ──
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token && token !== "undefined" && isLogin) {
            navigate("/");
        }
    }, [navigate, isLogin]);

    const form = useForm<z.infer<typeof loginSchema> | z.infer<typeof step1Schema> | z.infer<typeof step3Schema>>({
        resolver: (values, context, options) => {
            const schema = isLoginRef.current
                ? loginSchema
                : stepRef.current === "account" ? step3Schema : step1Schema;
            return zodResolver(schema)(values, context, options) as never;
        },
        defaultValues: { fullName: "", email: "", username: "", password: "" },
    });

    const sendOtp = useCallback((emailVal: string) => {
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        dispatch({ type: "SET_GENERATED_OTP", payload: otp });
        dispatch({ type: "SET_EMAIL", payload: emailVal });
        console.log(`[AUTH] Sent OTP ${otp} to ${emailVal}`);
        toast({
            title: "OTP Sent",
            description: `Verification code sent to ${emailVal}. (Development: ${otp})`,
        });
        dispatch({ type: "START_COUNTDOWN" });
    }, [toast]);

    const onSubmit = async (values: Record<string, unknown>) => {
        dispatch({ type: "SET_LOADING", payload: true });
        dispatch({ type: "SET_ERROR", payload: null });
        try {
            // ── LOGIN ──
            if (isLogin) {
                const userId = values.userId as string;
                const password = values.password as string;
                
                const res = await api.login(userId, password);
                if (res.success) {
                    const data = res;
                    localStorage.setItem("token", data.accessToken);
                    setStoreUser(data.user);

                    toast({ title: "✅ Welcome back!", description: `Hello, ${userId}!` });
                    setTimeout(() => navigate("/"), 400);
                } else {
                    throw new Error(res.message || "Invalid credentials");
                }

                // ── SIGNUP Step 1: Send OTP ──
            } else if (step === "credentials") {
                const emailVal = (values.email as string).trim();
                dispatch({ type: "SET_EMAIL", payload: emailVal });
                sendOtp(emailVal);
                dispatch({ type: "SET_STEP", payload: "otp" });

                // ── SIGNUP Step 2: Verify OTP ──
            } else if (step === "otp") {
                if (otpValue.length !== 4) {
                    dispatch({ type: "SET_ERROR", payload: "Please enter all 4 digits" });
                    dispatch({ type: "SET_LOADING", payload: false });
                    return;
                }
                if (otpValue !== generatedOtp) {
                    dispatch({ type: "SET_ERROR", payload: "The code you entered is incorrect. Please try again." });
                    dispatch({ type: "SET_LOADING", payload: false });
                    return;
                }
                dispatch({ type: "SET_STEP", payload: "account" });
                dispatch({ type: "SET_OTP", payload: "" });
                
                // Prefill form for Step 3 (account)
                form.setValue("email", email);

                // ── SIGNUP Step 3: Create account ──
            } else if (step === "account") {
                const emailVal = values.email as string;
                const passwordVal = values.password as string;
                const fullNameVal = values.fullName as string;
                const usernameVal = values.username as string;
                const deptVal = values.dept as string;

                const res = await api.register(emailVal, passwordVal, fullNameVal, usernameVal, deptVal);
                if (res.success) {
                    const data = res;
                    localStorage.setItem("token", data.accessToken);
                    setStoreUser(data.user);

                    toast({ title: "🎉 Account Created!", description: "Account setup successful." });
                    setTimeout(() => navigate("/"), 400);
                } else {
                    throw new Error(res.message || "Registration failed");
                }
            }
        } catch (err: any) {
            const errorMessage = err.message || "An unexpected error occurred";
            console.error("Auth error:", err);
            
            toast({
                title: isLogin ? "Sign In Failed" : "Registration Failed",
                description: errorMessage,
                variant: "destructive",
            });
            
            dispatch({ type: "SET_ERROR", payload: errorMessage });
        } finally {
            dispatch({ type: "SET_LOADING", payload: false });
        }
    };

    const toggleMode = () => {
        dispatch({ type: "TOGGLE_MODE" });
        form.reset();
    };

    const resendOtp = () => {
        if (canResend) {
            sendOtp(email);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            dispatch({ type: "SET_LOADING", payload: true });
            const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
            const redirectUri = `${window.location.origin}/auth/google/callback`;
            const scope = "openid email profile";
            const responseType = "code";
            const state = "provider=google";

            if (!clientId) {
                toast({
                    title: "Configuration Error",
                    description: "Google OAuth is not properly configured. Please contact support.",
                    variant: "destructive",
                });
                return;
            }

            const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=select_account&state=${encodeURIComponent(state)}`;
            window.location.href = googleAuthUrl;
        } catch (err: any) {
            setError(err.message || "Google login failed");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGithubLogin = async () => {
        try {
            setIsLoading(true);
            const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID || "";
            const redirectUri = `${window.location.origin}/auth/github/callback`;
            const scope = "user:email";
            const state = "provider=github";

            if (!clientId) {
                toast({
                    title: "Configuration Error",
                    description: "GitHub OAuth is not properly configured. Please contact support.",
                    variant: "destructive",
                });
                return;
            }

            const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&allow_signup=true&state=${encodeURIComponent(state)}`;
            window.location.href = githubAuthUrl;
        } catch (err: any) {
            dispatch({ type: "SET_ERROR", payload: err.message || "GitHub login failed" });
        } finally {
            dispatch({ type: "SET_LOADING", payload: false });
        }
    };

    return (
        <div className="min-h-screen animated-bg flex items-center justify-center p-6 text-foreground relative perspective-1000 overflow-hidden">
            <Suspense fallback={null}>
                <AnimatedBackground />
            </Suspense>

            {/* Ambient Background Orbs */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-violet-600/10 blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-fuchsia-600/10 blur-[120px] animate-pulse [animation-delay:2s]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-md relative z-10"
            >
                {/* Logo & Header */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.3 }}
                        className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 p-0.5 shadow-2xl shadow-violet-600/20"
                    >
                        <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                            <RefreshCw className="w-8 h-8 text-violet-400 animate-spin-slow" />
                        </div>
                    </motion.div>
                    <h1 className="font-poppins font-bold text-3xl tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                        MEC Learning
                    </h1>
                    <p className="text-muted-foreground text-sm font-poppins mt-2">
                        Your pathway to linguistic excellence
                    </p>
                </div>

                <motion.div
                    layout
                    className="glass rounded-3xl p-8 border border-white/10 shadow-2xl overflow-hidden"
                    style={{ background: "rgba(13, 15, 23, 0.8)", backdropFilter: "blur(20px)" }}
                >
                    <AnimatePresence mode="wait">
                        {step === "otp" ? (
                            <motion.div
                                key="otp"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="text-center">
                                    <h2 className="text-xl font-bold font-poppins mb-2">Verify Contact</h2>
                                    <p className="text-sm text-muted-foreground font-poppins">Enter the 4-digit code sent to {email}</p>
                                </div>
                                <div className="flex justify-center gap-3">
                                    {[0, 1, 2, 3].map((i) => (
                                        <input
                                            key={i}
                                            type="text"
                                            maxLength={1}
                                            className="w-12 h-14 text-center text-xl font-bold rounded-xl border border-white/10 bg-white/5 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none"
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val) {
                                                    const newVal = otpValue.split("");
                                                    newVal[i] = val;
                                                    dispatch({ type: "SET_OTP", payload: newVal.join("") });
                                                    if (i < 3) (e.target.nextElementSibling as HTMLInputElement)?.focus();
                                                }
                                            }}
                                            onKeyDown={(e) => {
                                                const target = e.target as HTMLInputElement;
                                                if (e.key === "Backspace" && !otpValue[i] && i > 0) {
                                                    (target.previousElementSibling as HTMLInputElement)?.focus();
                                                }
                                            }}
                                        />
                                    ))}
                                </div>
                                <Button
                                    onClick={() => onSubmit({})}
                                    className="w-full h-12 rounded-2xl font-poppins font-semibold bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-600/20"
                                    disabled={isLoading}
                                >
                                    {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Verify & Continue"}
                                </Button>
                                <div className="text-center">
                                    <button
                                        disabled={!canResend}
                                        onClick={resendOtp}
                                        className="text-sm font-poppins text-violet-400 hover:text-violet-300 disabled:text-muted-foreground disabled:cursor-not-allowed"
                                    >
                                        {canResend ? "Resend Code" : `Resend in ${seconds}s`}
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key={isLogin ? "login" : "signup"}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
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
                                                            <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">User ID or Email</FormLabel>
                                                            <FormControl>
                                                                <div className="relative group">
                                                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400/50 group-focus-within:text-violet-400 transition-colors" />
                                                                    <Input
                                                                        placeholder="Your MEC ID"
                                                                        className="h-12 pl-12 rounded-2xl border-white/5 bg-white/5 focus:bg-white/10 transition-all font-poppins"
                                                                        {...field}
                                                                        value={field.value as string || ""}
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
                                                            <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Password</FormLabel>
                                                            <FormControl>
                                                                <div className="relative group">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => dispatch({ type: "TOGGLE_PASSWORD" })}
                                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-violet-400/50 hover:text-violet-400 transition-colors"
                                                                    >
                                                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                                    </button>
                                                                    <Input
                                                                        type={showPassword ? "text" : "password"}
                                                                        placeholder="••••••••"
                                                                        className="h-12 pl-12 rounded-2xl border-white/5 bg-white/5 focus:bg-white/10 transition-all font-poppins"
                                                                        {...field}
                                                                        value={field.value as string || ""}
                                                                    />
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </>
                                        ) : (
                                            <>
                                                {step === "credentials" && (
                                                    <FormField
                                                        control={form.control}
                                                        name="email"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Email Address</FormLabel>
                                                                <FormControl>
                                                                    <div className="relative group">
                                                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400/50 group-focus-within:text-violet-400 transition-colors" />
                                                                        <Input
                                                                            type="email"
                                                                            placeholder="Your email for verification"
                                                                            className="h-12 pl-12 rounded-2xl border-white/5 bg-white/5 focus:bg-white/10 transition-all font-poppins"
                                                                            {...field}
                                                                            value={field.value as string || ""}
                                                                        />
                                                                    </div>
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                )}
                                                {step === "account" && (
                                                    <>
                                                        <FormField
                                                            control={form.control}
                                                            name="email"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Email</FormLabel>
                                                                    <FormControl>
                                                                        <Input {...field} value={field.value as string || ""} className="h-12 rounded-2xl border-white/5 bg-white/5 font-poppins" readOnly />
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
                                                                    <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Full Name</FormLabel>
                                                                    <FormControl>
                                                                        <Input {...field} value={field.value as string || ""} className="h-12 rounded-2xl border-white/5 bg-white/5 font-poppins" />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <FormField
                                                                control={form.control}
                                                                name="username"
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">MEC ID</FormLabel>
                                                                        <FormControl>
                                                                            <Input {...field} value={field.value as string || ""} className="h-12 rounded-2xl border-white/5 bg-white/5 font-poppins" />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                            <FormField
                                                                control={form.control}
                                                                name="dept"
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Dept</FormLabel>
                                                                        <FormControl>
                                                                            <Input {...field} value={field.value as string || ""} className="h-12 rounded-2xl border-white/5 bg-white/5 font-poppins" />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        </div>
                                                        <FormField
                                                            control={form.control}
                                                            name="password"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Password</FormLabel>
                                                                    <FormControl>
                                                                        <Input type="password" {...field} value={field.value as string || ""} className="h-12 rounded-2xl border-white/5 bg-white/5 font-poppins" />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </>
                                                )}
                                            </>
                                        )}

                                        <Button
                                            type="submit"
                                            className="w-full h-12 rounded-2xl font-poppins font-semibold bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-600/20 mt-4 transition-all"
                                            disabled={isLoading}
                                            asChild
                                        >
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : (isLogin ? "Sign In" : "Continue")}
                                            </motion.button>
                                        </Button>

                                        {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}

                                        {isLogin && (
                                            <div className="relative my-6">
                                                <div className="absolute inset-0 flex items-center">
                                                    <div className="w-full border-t border-white/5" />
                                                </div>
                                                <div className="relative flex justify-center text-xs uppercase">
                                                    <span className="bg-slate-900 px-2 text-muted-foreground">Or continue with</span>
                                                </div>
                                            </div>
                                        )}

                                        {isLogin && (
                                            <div className="grid grid-cols-2 gap-3">
                                                <Button 
                                                    type="button" 
                                                    variant="outline" 
                                                    className="rounded-2xl border-white/10 hover:bg-white/5 gap-2 font-poppins"
                                                    onClick={handleGoogleLogin}
                                                    disabled={isLoading}
                                                >
                                                    <GoogleIcon className="w-4 h-4" /> Google
                                                </Button>
                                                <Button 
                                                    type="button" 
                                                    variant="outline" 
                                                    className="rounded-2xl border-white/10 hover:bg-white/5 gap-2 font-poppins"
                                                    onClick={handleGithubLogin}
                                                    disabled={isLoading}
                                                >
                                                    <Github className="w-4 h-4" /> GitHub
                                                </Button>
                                            </div>
                                        )}
                                    </form>
                                </Form>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="mt-8 text-center">
                        <button
                            onClick={toggleMode}
                            className="text-sm font-poppins text-muted-foreground hover:text-violet-400 transition-colors"
                        >
                            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                        </button>
                    </div>
                </motion.div>

                {/* Floating Words for aesthetic */}
                <FloatingWord word="Grammar" className="top-10 -left-20 opacity-20" />
                <FloatingWord word="Vocabulary" className="bottom-20 -right-24 opacity-20" />
                <FloatingWord word="Fluency" className="top-1/2 -right-16 opacity-10" />
            </motion.div>
        </div>
    );
};

export default AuthPage;
