import { lazy, Suspense } from "react";
import { FloatingWord } from "@/components/FloatingWord";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, User, Mail, Phone, Github, RefreshCw, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { type UserLevel, type AuthUser } from "@/lib/auth";
import { useStore } from "../store/useStore";
import { api } from "../services/api";

// Deferred: load particle canvas only after card is visible
const AnimatedBackground = lazy(() => import("@/components/AnimatedBackground"));

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
    contact: z.string().min(1, "Contact details are required"),
});

const step3Schema = z.object({
    fullName: z.string().min(2, "Full Name is required"),
    username: z.string().min(3, "Username must be at least 3 characters"),
    dept: z.string().min(2, "Dept name is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

type AuthStep = "credentials" | "otp" | "account" | "level";

const AuthPage = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const setStoreUser = useStore(state => state.setUser);
    const storeUser = useStore(state => state.user);

    const [isLogin, setIsLogin] = useState(true);
    const [step, setStep] = useState<AuthStep>("credentials");
    const [isLoading, setIsLoading] = useState(false);
    const [otpValue, setOtpValue] = useState("");
    const [generatedOtp, setGeneratedOtp] = useState("");
    const [contact, setContact] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Custom useResendCountdown logic since it's missing
    const [seconds, setSeconds] = useState(0);
    useEffect(() => {
        if (seconds > 0) {
            const timer = setTimeout(() => setSeconds(seconds - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [seconds]);
    const startCountdown = () => setSeconds(30);
    const canResend = seconds === 0;

    const stepRef = useRef(step);
    const isLoginRef = useRef(isLogin);
    stepRef.current = step;
    isLoginRef.current = isLogin;

    const form = useForm<z.infer<typeof loginSchema> | z.infer<typeof step1Schema> | z.infer<typeof step3Schema>>({
        resolver: (values, context, options) => {
            const schema = isLoginRef.current
                ? loginSchema
                : stepRef.current === "account" ? step3Schema : step1Schema;
            return zodResolver(schema)(values, context, options) as never;
        },
        defaultValues: { fullName: "", contact: "", username: "", password: "" },
    });

    const sendOtp = useCallback((contactVal: string) => {
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        setGeneratedOtp(otp);
        setContact(contactVal);
        console.log(`[AUTH] Sent OTP ${otp} to ${contactVal}`);
        toast({
            title: "OTP Sent",
            description: `Verification code sent to ${contactVal}. (Development: ${otp})`,
        });
        startCountdown();
    }, [toast]);

    const onSubmit = async (values: Record<string, unknown>) => {
        setIsLoading(true);
        setError(null);
        try {
            // ── LOGIN ──
            if (isLogin) {
                const userId = values.userId as string;
                const password = values.password as string;
                
                const data = await api.login(userId, password);
                localStorage.setItem("token", data.token);
                setStoreUser(data.user);

                toast({ title: "✅ Welcome back!", description: `Hello, ${userId}!` });
                setTimeout(() => navigate("/dashboard"), 400);

                // ── SIGNUP Step 1: Send OTP ──
            } else if (step === "credentials") {
                const contactVal = (values.contact as string).trim();
                setContact(contactVal);
                sendOtp(contactVal);
                setStep("otp");

                // ── SIGNUP Step 2: Verify OTP ──
            } else if (step === "otp") {
                if (otpValue.length !== 4) {
                    setError("Please enter all 4 digits");
                    setIsLoading(false);
                    return;
                }
                if (otpValue !== generatedOtp) {
                    setError("The code you entered is incorrect. Please try again.");
                    setIsLoading(false);
                    return;
                }
                setStep("account");
                setOtpValue("");

                // ── SIGNUP Step 3: Create account ──
            } else if (step === "account") {
                const username = values.username as string;
                const passwordVal = values.password as string;

                const data = await api.register(username, passwordVal);
                localStorage.setItem("token", data.token);
                setStoreUser(data.user);

                toast({ title: "🎉 Account Created!", description: "Account setup successful." });
                setStep("level");
            }
        } catch (err: any) {
            const errorMessage = err.message || "An unexpected error occurred";
            console.error("Auth error:", err);
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLevelPick = async (level: string) => {
        setIsLoading(true);
        if (!storeUser) return;

        try {
            const levelNum = level === "beginner" ? 1 : level === "intermediate" ? 2 : level === "advanced" ? 3 : 4;
            setStoreUser({ ...storeUser, level: levelNum });
            
            toast({ title: "Level Set", description: `You're now at ${level} level.` });
            setTimeout(() => navigate("/"), 400);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
            toast({ title: "Error", description: errorMessage, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setStep("credentials");
        form.reset();
    };

    const resendOtp = () => {
        if (canResend) {
            sendOtp(contact);
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
                        {step === "level" ? (
                            <motion.div
                                key="level"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="text-center">
                                    <h2 className="text-xl font-bold font-poppins mb-2">Select Your Level</h2>
                                    <p className="text-sm text-muted-foreground font-poppins">We'll tailor your experience accordingly</p>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {["beginner", "intermediate", "advanced", "expert"].map((lvl) => (
                                        <button
                                            key={lvl}
                                            onClick={() => handleLevelPick(lvl)}
                                            className="p-4 rounded-2xl border border-white/5 bg-white/5 hover:bg-violet-600/20 hover:border-violet-600/50 transition-all font-poppins text-sm capitalize"
                                        >
                                            {lvl}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        ) : step === "otp" ? (
                            <motion.div
                                key="otp"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="text-center">
                                    <h2 className="text-xl font-bold font-poppins mb-2">Verify Contact</h2>
                                    <p className="text-sm text-muted-foreground font-poppins">Enter the 4-digit code sent to {contact}</p>
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
                                                    setOtpValue(newVal.join(""));
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
                                                                        onClick={() => setShowPassword(!showPassword)}
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
                                                        name="contact"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Email or Phone</FormLabel>
                                                                <FormControl>
                                                                    <div className="relative group">
                                                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400/50 group-focus-within:text-violet-400 transition-colors" />
                                                                        <Input
                                                                            placeholder="For verification code"
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
                                            className="w-full h-12 rounded-2xl font-poppins font-semibold bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-600/20 mt-4"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : (isLogin ? "Sign In" : "Continue")}
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
                                                <Button type="button" variant="outline" className="rounded-2xl border-white/10 hover:bg-white/5 gap-2 font-poppins">
                                                    <GoogleIcon className="w-4 h-4" /> Google
                                                </Button>
                                                <Button type="button" variant="outline" className="rounded-2xl border-white/10 hover:bg-white/5 gap-2 font-poppins">
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
