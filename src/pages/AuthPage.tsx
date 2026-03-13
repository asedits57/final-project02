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
import { setUser, getUser, type UserLevel } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

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
// Level selection data
// ------------------------------------------------------------------
const levelOptions: { slug: UserLevel; label: string; emoji: string; description: string; color: string; glow: string }[] = [
    {
        slug: "beginner",
        label: "Beginner",
        emoji: "🟢",
        description: "Just starting out — basic vocabulary & simple sentences",
        color: "from-emerald-500/20 to-teal-500/20",
        glow: "rgba(16,185,129,0.5)",
    },
    {
        slug: "intermediate",
        label: "Intermediate",
        emoji: "🔵",
        description: "Comfortable with everyday English — ready to level up",
        color: "from-blue-500/20 to-cyan-500/20",
        glow: "rgba(59,130,246,0.5)",
    },
    {
        slug: "advanced",
        label: "Advanced",
        emoji: "🟣",
        description: "Strong foundation — working on fluency & nuance",
        color: "from-violet-500/20 to-purple-500/20",
        glow: "rgba(139,92,246,0.5)",
    },
    {
        slug: "expert",
        label: "Expert",
        emoji: "🔴",
        description: "Near-native — mastering academic & professional English",
        color: "from-rose-500/20 to-red-500/20",
        glow: "rgba(244,63,94,0.5)",
    },
];

// ------------------------------------------------------------------
// Level Selection Screen
// ------------------------------------------------------------------
function LevelSelectionScreen({ onSelect }: { onSelect: (level: UserLevel) => void }) {
    const [selected, setSelected] = useState<UserLevel | null>(null);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="w-full"
        >
            <div className="mb-7">
                <h1 className="text-3xl font-bold text-white mb-1">Choose Your Level</h1>
                <p className="text-white/60 text-sm">Select where you are right now — you can always change it later</p>
            </div>

            <div className="grid grid-cols-1 gap-3 mb-6">
                {levelOptions.map((opt) => (
                    <button
                        key={opt.slug}
                        type="button"
                        onClick={() => setSelected(opt.slug)}
                        className={`relative w-full text-left rounded-2xl px-5 py-4 transition-all duration-300 hover:scale-[1.02] border`}
                        style={{
                            background: selected === opt.slug
                                ? `linear-gradient(135deg, ${opt.color.split(" ")[0].replace("from-", "").replace("/20", "")}, transparent)`
                                : "rgba(255,255,255,0.04)",
                            border: selected === opt.slug
                                ? `1.5px solid ${opt.glow.replace("0.5", "0.8")}`
                                : "1px solid rgba(255,255,255,0.1)",
                            boxShadow: selected === opt.slug ? `0 0 24px ${opt.glow.replace("0.5", "0.25")}` : undefined,
                            backdropFilter: "blur(12px)",
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{opt.emoji}</span>
                            <div>
                                <p className="text-white font-semibold text-sm flex items-center gap-2">
                                    {opt.label}
                                    {selected === opt.slug && (
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="inline-block w-4 h-4 rounded-full bg-white/90"
                                            style={{ boxShadow: `0 0 8px ${opt.glow}` }}
                                        />
                                    )}
                                </p>
                                <p className="text-white/50 text-xs mt-0.5">{opt.description}</p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            <Button
                type="button"
                disabled={!selected}
                onClick={() => selected && onSelect(selected)}
                className="w-full h-12 rounded-xl text-white font-medium border-0 transition-all duration-300 hover:scale-[1.02] relative overflow-hidden disabled:opacity-40"
                style={{
                    background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
                    boxShadow: "0 4px 24px rgba(96,165,250,0.25)",
                }}
            >
                <span className="relative z-10 flex items-center justify-center gap-2">
                    Continue <ArrowRight size={16} />
                </span>
            </Button>
        </motion.div>
    );
}

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------
function maskContact(contact: string): string {
    if (contact.includes("@")) {
        const [user, domain] = contact.split("@");
        const masked = user.length > 2 ? user[0] + "***" + user[user.length - 1] : "***";
        return `${masked}@${domain}`;
    }
    const digits = contact.replace(/\D/g, "");
    return `${"*".repeat(Math.max(0, digits.length - 4))}${digits.slice(-4)}`;
}

function generateOTP(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

// ------------------------------------------------------------------
// Schemas
// ------------------------------------------------------------------
const step1Schema = z.object({
    contact: z.string().min(5, "Email or phone number required"),
});

const step3Schema = z.object({
    fullName: z.string().min(2, "Full name required"),
    username: z.string().min(3, "Username required"),
    dept: z.string().min(2, "Department required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
    userId: z.string().min(3, "User ID (Email/Phone) required"),
    password: z.string().min(6, "Password required"),
});

type AuthStep = "credentials" | "otp" | "account" | "level";

// ------------------------------------------------------------------
// 4-box OTP input
// ------------------------------------------------------------------
function OtpBoxInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const inputs = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (index: number, char: string) => {
        const digit = char.replace(/\D/g, "").slice(-1);
        const arr = (value + "    ").split("").slice(0, 4);
        arr[index] = digit || " ";
        const next = arr.join("").trimEnd();
        onChange(next.replace(/ /g, ""));
        if (digit && index < 3) inputs.current[index + 1]?.focus();
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace") {
            if (!value[index] && index > 0) {
                inputs.current[index - 1]?.focus();
                const arr = value.split("");
                arr[index - 1] = "";
                onChange(arr.join(""));
            } else {
                const arr = value.split("");
                arr[index] = "";
                onChange(arr.join(""));
            }
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
        onChange(pasted);
        inputs.current[Math.min(pasted.length, 3)]?.focus();
        e.preventDefault();
    };

    return (
        <div className="flex gap-4 justify-center my-6" onPaste={handlePaste}>
            {[0, 1, 2, 3].map((i) => (
                <input
                    key={i}
                    ref={(el) => { inputs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={value[i] || ""}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onFocus={(e) => e.target.select()}
                    className="w-16 h-16 text-center text-3xl font-bold text-white rounded-2xl focus:outline-none transition-all caret-transparent"
                    style={{
                        background: "rgba(0,0,0,0.25)",
                        border: value[i] ? "2px solid rgba(96,165,250,0.7)" : "2px solid rgba(255,255,255,0.12)",
                        boxShadow: value[i] ? "0 0 20px rgba(96,165,250,0.35)" : undefined,
                        backdropFilter: "blur(12px)",
                    }}
                />
            ))}
        </div>
    );
}

// ------------------------------------------------------------------
// Resend countdown hook
// ------------------------------------------------------------------
function useResendCountdown(initial = 30) {
    const [seconds, setSeconds] = useState(initial);
    const [active, setActive] = useState(false);
    const timer = useRef<ReturnType<typeof setInterval> | null>(null);

    const start = useCallback(() => {
        if (timer.current) clearInterval(timer.current);
        setSeconds(initial);
        setActive(true);
    }, [initial]);

    useEffect(() => {
        if (!active) return;
        timer.current = setInterval(() => {
            setSeconds((s) => {
                if (s <= 1) { clearInterval(timer.current!); setActive(false); return 0; }
                return s - 1;
            });
        }, 1000);
        return () => clearInterval(timer.current!);
    }, [active]);

    return { seconds, canResend: !active, start };
}

// ------------------------------------------------------------------
export default function AuthPage() {
    const navigate = useNavigate();
    const [notifs, setNotifs] = useState(true);
    const [pronounce, setPronounce] = useState(true);
    const [grammar, setGrammar] = useState(false);

    /* ── toast ── */
    const { toast } = useToast();

    // Non-blocking session check — show form immediately, redirect in background
    useEffect(() => {
        const check = async () => {
            const { data } = await supabase.auth.getSession();
            if (data.session) {
                // If the user already has a level saved, go to home; otherwise let them pick
                const user = getUser();
                if (user?.level) {
                    navigate("/", { replace: true });
                }
                // else: let the form remain so they pick a level
            }
        };
        // Defer by one frame so the form renders first
        const id = requestAnimationFrame(() => { check(); });
        return () => cancelAnimationFrame(id);
    }, [navigate]);

    const [isLogin, setIsLogin] = useState(true);
    const [step, setStep] = useState<AuthStep>("credentials");
    const [isLoading, setIsLoading] = useState(false);
    const [otpValue, setOtpValue] = useState("");
    const [generatedOtp, setGeneratedOtp] = useState("");
    const [contact, setContact] = useState("");
    const [dept, setDept] = useState("");
    const [fullName, setFullName] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    // Pending user data for signup — saved after account creation, before level pick
    const [pendingUser, setPendingUser] = useState<AuthUser | null>(null);
    const { seconds, canResend, start: startCountdown } = useResendCountdown(30);

    const stepRef = useRef(step);
    const isLoginRef = useRef(isLogin);
    stepRef.current = step;
    isLoginRef.current = isLogin;

    const form = useForm<any>({
        resolver: (values, context, options) => {
            const schema = isLoginRef.current
                ? loginSchema
                : stepRef.current === "account" ? step3Schema : step1Schema;
            return zodResolver(schema)(values, context, options);
        },
        defaultValues: { fullName: "", contact: "", username: "", password: "" },
    });

    // ── Send OTP ────────────────────────────────────────────────────
    const sendOtp = useCallback((contactVal: string) => {
        const otp = generateOTP();
        setGeneratedOtp(otp);
        startCountdown();

        const isEmail = contactVal.includes("@");
        toast({
            title: `📨 OTP Sent to ${isEmail ? "Email" : "Mobile"}`,
            description: `Your OTP is: ${otp}  (sent to ${maskContact(contactVal)})`,
            duration: 15000,
        });
    }, [startCountdown, toast]);

    // ── Level selected (called from LevelSelectionScreen) ───────────
    const handleLevelSelected = useCallback((level: UserLevel) => {
        if (pendingUser) {
            // Signup path: save user with level then navigate
            setUser({ ...pendingUser, level });
        } else {
            // Login path: update existing stored user with level
            const existing = getUser();
            if (existing) setUser({ ...existing, level });
        }
        toast({ title: "✅ Level saved!", description: `You're starting at ${level.charAt(0).toUpperCase() + level.slice(1)} level.` });
        setTimeout(() => navigate("/"), 300);
    }, [pendingUser, navigate, toast]);

    // ── SUBMIT ─────────────────────────────────────────────────────
    const onSubmit = async (values: any) => {
        setIsLoading(true);
        try {
            // ── LOGIN ──
            if (isLogin) {
                const isEmail = values.userId.includes("@");
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: isEmail ? values.userId : `${values.userId}@app.local`,
                    password: values.password,
                });
                if (error) {
                    toast({ title: "Login Failed", description: error.message, variant: "destructive" });
                } else if (data.session) {
                    const meta = data.user?.user_metadata;
                    const savedLevel = meta?.level as UserLevel | undefined;
                    setUser({
                        username: values.userId, // Use the user ID entered
                        fullName: meta?.fullName ?? null,
                        dept: meta?.dept ?? null,
                        email: data.user?.email ?? null,
                        level: savedLevel ?? null,
                    });
                    toast({ title: "✅ Welcome back!", description: `Hello, ${meta?.fullName || values.userId}!` });
                    if (savedLevel) {
                        setTimeout(() => navigate("/"), 400);
                    } else {
                        setPendingUser(null);
                        setStep("level");
                    }
                }

                // ── SIGNUP Step 1: Send OTP ──
            } else if (step === "credentials") {
                const contactVal = values.contact.trim();
                setContact(contactVal);
                sendOtp(contactVal);
                setStep("otp");

                // ── SIGNUP Step 2: Verify OTP ──
            } else if (step === "otp") {
                if (otpValue.length !== 4) {
                    toast({ title: "Error", description: "Please enter all 4 digits", variant: "destructive" });
                    setIsLoading(false);
                    return;
                }
                if (otpValue !== generatedOtp) {
                    toast({ title: "Invalid OTP", description: "The code you entered is incorrect. Please try again.", variant: "destructive" });
                    setIsLoading(false);
                    return;
                }
                setStep("account");
                setOtpValue("");

                // ── SIGNUP Step 3: Create account ──
            } else if (step === "account") {
                const isEmail = contact.includes("@");
                const email = isEmail ? contact : `${values.username.toLowerCase()}@app.local`;

                const { data, error } = await supabase.auth.signUp({
                    email,
                    password: values.password,
                    options: {
                        data: { 
                            username: values.username, 
                            fullName: values.fullName,
                            dept: values.dept 
                        },
                        emailRedirectTo: undefined,
                    },
                });

                if (error) {
                    toast({ title: "Error", description: error.message, variant: "destructive" });
                } else {
                    toast({ title: "🎉 Account Created!", description: "Now choose your level." });
                    setPendingUser({
                        username: values.username,
                        fullName: values.fullName,
                        dept: values.dept,
                        email: isEmail ? contact : null,
                        phoneNumber: !isEmail ? contact : null,
                    });
                    setStep("level");
                }
            }
        } catch (err) {
            console.error(err);
            toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = () => {
        setOtpValue("");
        sendOtp(contact);
        toast({ title: "OTP Resent!", description: "A new 4-digit code has been generated." });
    };

    const handleSocialLogin = (provider: string) => {
        toast({ title: `${provider} Login`, description: "Social login is not configured yet.", variant: "destructive" });
    };

    const words = [
        { text: "Learn", className: "top-[10%] left-[10%] text-6xl" },
        { text: "Speak", className: "top-[20%] right-[15%] text-7xl" },
        { text: "Fluent", className: "bottom-[15%] left-[20%] text-5xl" },
        { text: "Practice", className: "bottom-[25%] right-[10%] text-6xl" },
    ];

    const getStepTitle = () => {
        if (isLogin) return step === "level" ? "Choose Your Level" : "Welcome Back";
        if (step === "otp") return "Verify OTP";
        if (step === "account") return "Profile Details";
        if (step === "level") return "Choose Your Level";
        return "Join Us";
    };

    const getStepDesc = () => {
        if (isLogin) return step === "level" ? "Select your English proficiency level" : "Continue your language journey";
        if (step === "otp") return `Enter the 4-digit code sent to ${maskContact(contact)}`;
        if (step === "account") return "Tell us a bit about yourself";
        if (step === "level") return "Select your English proficiency level";
        return "Start your AI-powered learning journey";
    };

    // ── RENDER ─────────────────────────────────────────────────────
    return (
        <div className="min-h-screen w-full relative overflow-hidden flex items-center justify-center animated-bg p-4 font-sans text-foreground">

            {/* Particle bg: lazy-loaded so it doesn't block first paint */}
            <Suspense fallback={null}>
                <AnimatedBackground />
            </Suspense>

            {/* Liquid overlay: lazy CSS background, no render blocking */}
            <div className="absolute inset-0 z-0 opacity-10" style={{
                backgroundImage: "url('/liquid-bg.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
            }} />

            <div className="absolute inset-0 z-0 pointer-events-none">
                {words.map((word, i) => (
                    <FloatingWord key={i} word={word.text} className={word.className} delay={i * 0.5} />
                ))}
            </div>

            {/* Glass Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.97, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="relative z-10 w-full max-w-4xl min-h-[580px] rounded-3xl overflow-hidden flex"
                style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    boxShadow: "0 8px 64px 0 rgba(31,38,135,0.45), inset 0 1px 0 rgba(255,255,255,0.1)",
                    backdropFilter: "blur(20px)",
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-white/5 pointer-events-none z-0" />

                {/* Sliding purple panel — hidden during level step for full-width layout */}
                {step !== "level" && (
                    <motion.div
                        animate={{ x: isLogin ? "0%" : "100%", skewX: isLogin ? -20 : 20 }}
                        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                        className="absolute inset-0 z-20 w-1/2 h-full pointer-events-none origin-bottom"
                        style={{
                            left: isLogin ? "50%" : "-50%",
                            background: "linear-gradient(135deg, rgba(88,28,135,0.95) 0%, rgba(109,40,217,0.9) 50%, rgba(67,56,202,0.95) 100%)",
                            boxShadow: isLogin ? "-30px 0 60px rgba(0,0,0,0.4)" : "30px 0 60px rgba(0,0,0,0.4)",
                            backdropFilter: "blur(20px)",
                            borderLeft: isLogin ? "1px solid rgba(255,255,255,0.1)" : "none",
                            borderRight: isLogin ? "none" : "1px solid rgba(255,255,255,0.1)",
                        }}
                    />
                )}

                {/* ── Level Selection (full-width) ── */}
                {step === "level" && (
                    <div className="w-full h-full p-10 flex flex-col justify-center relative z-10 max-w-xl mx-auto">
                        {/* Logo dot */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="inline-block mb-5 p-3 rounded-2xl self-start"
                            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(12px)" }}
                        >
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-500" />
                        </motion.div>
                        <AnimatePresence mode="wait">
                            <LevelSelectionScreen key="level-screen" onSelect={handleLevelSelected} />
                        </AnimatePresence>
                    </div>
                )}

                {/* ── Form Panel (non-level steps) ── */}
                {step !== "level" && (
                    <div className={`w-1/2 h-full p-10 flex flex-col justify-center relative z-10 transition-all duration-700 ${isLogin ? "order-1" : "order-2"}`}>

                        {/* Logo dot */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-block mb-5 p-3 rounded-2xl self-start"
                            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(12px)" }}
                        >
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-500" />
                        </motion.div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`${isLogin ? "login" : "signup"}-${step}`}
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.4 }}
                                className="mb-7"
                            >
                                <h1 className="text-3xl font-bold text-white mb-1">{getStepTitle()}</h1>
                                <p className="text-white/60 text-sm">{getStepDesc()}</p>
                            </motion.div>
                        </AnimatePresence>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

                                {/* ── LOGIN ── */}
                                {isLogin && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        <FormField control={form.control} name="userId" render={({ field }) => (
                                            <FormItem className="mb-5">
                                                <FormLabel className="text-white/80 text-sm">User ID</FormLabel>
                                                <FormControl>
                                                    <div className="relative group/input">
                                                        <Input {...field} placeholder="Email or Mobile Number"
                                                            className="h-12 rounded-xl text-white placeholder:text-white/30 transition-all duration-300 border-white/10 focus-visible:border-blue-400/50 focus-visible:ring-blue-400/20"
                                                            style={{ background: "rgba(0,0,0,0.2)" }}
                                                        />
                                                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover/input:opacity-100 transition-opacity pointer-events-none" />
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="text-red-300" />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="password" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-white/80 text-sm">Password</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input type={showPassword ? "text" : "password"} {...field} placeholder="••••••••"
                                                            className="h-12 rounded-xl text-white placeholder:text-white/30 pr-10 transition-all duration-300 border-white/10 focus-visible:border-blue-400/50 focus-visible:ring-blue-400/20"
                                                            style={{ background: "rgba(0,0,0,0.2)" }}
                                                        />
                                                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                                                            className="absolute right-3 top-3 text-white/50 hover:text-white transition-colors">
                                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                        </button>
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="text-red-300" />
                                            </FormItem>
                                        )} />
                                        <div className="flex justify-end mt-2">
                                            <button type="button" className="text-xs text-blue-300 hover:text-blue-200 transition-colors">
                                                Forgot password?
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* ── SIGNUP Step 1: Contact ── */}
                                {!isLogin && step === "credentials" && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        <FormField control={form.control} name="contact" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-white/80 text-sm">Email or Mobile Number</FormLabel>
                                                <FormControl>
                                                    <div className="relative group/input">
                                                        <Mail className="absolute left-3 top-3.5 text-white/30" size={16} />
                                                        <Input {...field} placeholder="email@example.com or +91..."
                                                            className="h-12 rounded-xl text-white placeholder:text-white/30 pl-9 transition-all duration-300 border-white/10 focus-visible:border-blue-400/50 focus-visible:ring-blue-400/20"
                                                            style={{ background: "rgba(0,0,0,0.2)" }}
                                                        />
                                                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover/input:opacity-100 transition-opacity pointer-events-none" />
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="text-red-300" />
                                            </FormItem>
                                        )} />
                                    </motion.div>
                                )}

                                {/* ── SIGNUP Step 2: OTP ── */}
                                {!isLogin && step === "otp" && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                        <div className="flex items-center gap-2 mb-2 rounded-xl px-4 py-3"
                                            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                                            {contact.includes("@")
                                                ? <Mail className="text-blue-400 shrink-0" size={18} />
                                                : <Phone className="text-blue-400 shrink-0" size={18} />}
                                            <div>
                                                <p className="text-xs text-white/40 uppercase tracking-widest">OTP sent to</p>
                                                <p className="text-sm text-white font-medium">{maskContact(contact)}</p>
                                            </div>
                                        </div>
                                        <OtpBoxInput value={otpValue} onChange={setOtpValue} />
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs text-white/40">⏱ Code expires in 5 min</p>
                                            {canResend ? (
                                                <button type="button" onClick={handleResend} disabled={isLoading}
                                                    className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors disabled:opacity-50">
                                                    <RefreshCw size={12} /> Resend OTP
                                                </button>
                                            ) : (
                                                <p className="text-xs text-white/40">Resend in <span className="text-blue-400 font-semibold">{seconds}s</span></p>
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                {/* ── SIGNUP Step 3: Profile Details ── */}
                                {!isLogin && step === "account" && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <FormField control={form.control} name="fullName" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-white/80 text-xs">Full Name</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <User className="absolute left-3 top-3 text-white/30" size={14} />
                                                            <Input {...field} placeholder="John Doe"
                                                                className="h-10 rounded-xl text-white pl-9 text-sm transition-all duration-300 border-white/10"
                                                                style={{ background: "rgba(0,0,0,0.2)" }}
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage className="text-red-300 text-[10px]" />
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="username" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-white/80 text-xs">Username</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="john123"
                                                            className="h-10 rounded-xl text-white text-sm transition-all duration-300 border-white/10"
                                                            style={{ background: "rgba(0,0,0,0.2)" }}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-red-300 text-[10px]" />
                                                </FormItem>
                                            )} />
                                        </div>
                                        <FormField control={form.control} name="dept" render={({ field }) => (
                                            <FormItem className="mb-4">
                                                <FormLabel className="text-white/80 text-xs">Department</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="e.g. Computer Science"
                                                        className="h-10 rounded-xl text-white text-sm transition-all duration-300 border-white/10"
                                                        style={{ background: "rgba(0,0,0,0.2)" }}
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-red-300 text-[10px]" />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="password" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-white/80 text-xs">Password</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input type={showPassword ? "text" : "password"} {...field} placeholder="••••••••"
                                                            className="h-10 rounded-xl text-white placeholder:text-white/30 pr-10 text-sm transition-all duration-300 border-white/10"
                                                            style={{ background: "rgba(0,0,0,0.2)" }}
                                                        />
                                                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                                                            className="absolute right-3 top-2.5 text-white/50 hover:text-white transition-colors">
                                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                        </button>
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="text-red-300 text-[10px]" />
                                            </FormItem>
                                        )} />
                                    </motion.div>
                                )}

                                {/* Submit — only shown for non-level steps */}
                                <Button type="submit" disabled={isLoading}
                                    className="w-full h-12 rounded-xl text-white font-medium border-0 transition-all duration-300 hover:scale-[1.02] relative overflow-hidden"
                                    style={{
                                        background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
                                        boxShadow: "0 4px 24px rgba(96,165,250,0.25)",
                                    }}
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        {isLoading ? "Processing..." : (
                                            isLogin ? <>Sign In <ArrowRight size={16} /></> :
                                                step === "credentials" ? <>Send OTP <ArrowRight size={16} /></> :
                                                    step === "otp" ? <>Verify <ArrowRight size={16} /></> :
                                                        <>Create Account <ArrowRight size={16} /></>
                                        )}
                                    </span>
                                </Button>
                            </form>
                        </Form>

                        {/* Social logins */}
                        {isLogin ? (
                            <>
                                <div className="relative my-5">
                                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10" /></div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="px-3 text-white/40 font-medium tracking-wider bg-transparent">Or continue with</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <button type="button" onClick={() => handleSocialLogin("Google")}
                                        className="flex items-center justify-center gap-2 h-11 rounded-xl text-white/80 text-sm font-medium transition-all duration-300 hover:text-white hover:scale-[1.02]"
                                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                                        <GoogleIcon className="h-4 w-4" /> Google
                                    </button>
                                    <button type="button" onClick={() => handleSocialLogin("GitHub")}
                                        className="flex items-center justify-center gap-2 h-11 rounded-xl text-white/80 text-sm font-medium transition-all duration-300 hover:text-white hover:scale-[1.02]"
                                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                                        <Github className="h-4 w-4" /> Github
                                    </button>
                                </div>
                            </>
                        ) : step === "credentials" && (
                            <>
                                <div className="relative my-5">
                                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10" /></div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="px-3 text-white/40 font-medium tracking-wider bg-transparent">Or join with</span>
                                    </div>
                                </div>
                                <button type="button" onClick={() => handleSocialLogin("Google")}
                                    className="w-full flex items-center justify-center gap-2 h-12 rounded-xl text-white/80 text-sm font-medium transition-all duration-300 hover:text-white hover:scale-[1.02]"
                                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                                    <GoogleIcon className="h-4 w-4" /> Sign up with Google
                                </button>
                            </>
                        )}

                        {/* Switch mode */}
                        <div className="mt-6 text-center">
                            <button onClick={() => { setIsLogin(!isLogin); setStep("credentials"); setOtpValue(""); setGeneratedOtp(""); form.reset(); }}
                                className="text-white/40 text-sm hover:text-white transition-colors">
                                {isLogin ? "Don't have an account? " : "Already have an account? "}
                                <span className="text-white font-medium hover:text-blue-300 transition-colors">{isLogin ? "Sign up" : "Login"}</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Right Welcome Panel (hidden during level step) ── */}
                {step !== "level" && (
                    <div className={`w-1/2 h-full p-12 flex flex-col items-center justify-center text-center relative z-10 transition-all duration-700 ${isLogin ? "order-2" : "order-1"}`}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={isLogin ? "welcome-back" : "welcome-new"}
                                initial={{ opacity: 0, x: isLogin ? 50 : -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: isLogin ? -50 : 50 }}
                                transition={{ duration: 0.6 }}
                            >
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="w-20 h-20 rounded-3xl mx-auto mb-8 flex items-center justify-center"
                                    style={{
                                        background: "linear-gradient(135deg, rgba(96,165,250,0.3) 0%, rgba(167,139,250,0.3) 100%)",
                                        border: "1px solid rgba(255,255,255,0.15)",
                                        backdropFilter: "blur(12px)",
                                        boxShadow: "0 8px 32px rgba(96,165,250,0.2)",
                                    }}
                                >
                                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500" />
                                </motion.div>
                                <h2 className="text-4xl font-bold text-white mb-4">
                                    {isLogin ? "HELLO FRIEND!" : "WELCOME BACK!"}
                                </h2>
                                <p className="text-white/70 text-base leading-relaxed max-w-[260px] mx-auto mb-8">
                                    {isLogin
                                        ? "Enter your personal details and start your journey with us"
                                        : "To keep connected with us please login with your personal info"}
                                </p>
                                <button
                                    onClick={() => { setIsLogin(!isLogin); setStep("credentials"); setOtpValue(""); setGeneratedOtp(""); form.reset(); }}
                                    className="px-10 py-3 rounded-full border border-white/30 text-white font-bold text-sm uppercase tracking-widest hover:bg-white hover:text-purple-600 transition-all duration-300"
                                >
                                    {isLogin ? "Sign Up" : "Login"}
                                </button>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
