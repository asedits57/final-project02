import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Mic, MicOff, Star, ChevronRight, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiService as api } from "@shared/api";
import { useAuthStore as useStore } from "@core/useAuthStore";
import Spinner from "@components/ui/Spinner";
import ErrorMessage from "@components/ui/ErrorMessage";

import { toast } from "sonner";

// Type definitions for Web Speech API
interface SpeechRecognitionResult {
    [index: number]: {
        transcript: string;
    };
    isFinal: boolean;
}

interface SpeechRecognitionResultList {
    [index: number]: SpeechRecognitionResult;
    length: number;
}

interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message?: string;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: SpeechRecognitionErrorEvent) => void;
    onend: () => void;
}

interface SpeechRecognitionConstructor {
    new (): SpeechRecognition;
}

declare global {
    interface Window {
        SpeechRecognition?: SpeechRecognitionConstructor;
        webkitSpeechRecognition?: SpeechRecognitionConstructor;
    }
}

const PREP_TIME = 10;   // 10 seconds prep
const SPEAK_TIME = 60;  // max 60 seconds speaking

interface Feedback {
    overall: number;
    pronunciation: number;
    fluency: number;
    coherence: number;
    tips: string[];
}

import { useQuestions } from "@hooks/useQuestions";

const SpeakingModule = () => {
    const navigate = useNavigate();
    const { data: questionData, isLoading } = useQuestions();
    const speakingPrompts = questionData?.speaking || [];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [phase, setPhase] = useState<"idle" | "prep" | "recording" | "done">("idle");
    const [prepLeft, setPrepLeft] = useState(PREP_TIME);
    const [elapsed, setElapsed] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [transcript, setTranscript] = useState("");
    const [isEvaluating, setIsEvaluating] = useState(false);

    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (speakingPrompts.length > 0) {
            const saved = localStorage.getItem("speaking_current_index");
            if (saved) setCurrentIndex(Math.min(parseInt(saved), speakingPrompts.length - 1));
        }
    }, [speakingPrompts]);

    const currentPrompt = speakingPrompts[currentIndex];
    const totalPrompts = speakingPrompts.length;

    // Persist progress
    useEffect(() => {
        localStorage.setItem("speaking_current_index", currentIndex.toString());
        localStorage.setItem("speaking_progress_count", currentIndex.toString());
    }, [currentIndex]);

    const clearTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const startPrep = () => {
        setPhase("prep");
        setPrepLeft(PREP_TIME);
        timerRef.current = setInterval(() => {
            setPrepLeft(t => {
                if (t <= 1) {
                    clearInterval(timerRef.current!);
                    startRecording();
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
    };

    const startRecording = () => {
        setPhase("recording");
        setElapsed(0);
        setTranscript("");
        
        // Setup Speech Recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onresult = (event: SpeechRecognitionEvent) => {
                let currentTranscript = "";
                for (let i = 0; i < event.results.length; i++) {
                    currentTranscript += event.results[i][0].transcript;
                }
                setTranscript(currentTranscript);
            };

            recognition.onerror = (err: SpeechRecognitionErrorEvent) => {
                console.error("Speech Recognition Error:", err.error, err.message);
                toast.error("Microphone access or speech recognition error.");
            };

            recognition.start();
            recognitionRef.current = recognition;
        } else {
            toast.error("Speech Recognition is not supported in this browser.");
        }

        timerRef.current = setInterval(() => {
            setElapsed(e => {
                if (e >= SPEAK_TIME - 1) {
                    clearInterval(timerRef.current!);
                    stopRecording();
                    return SPEAK_TIME;
                }
                return e + 1;
            });
        }, 1000);
    };

    const stopRecording = async () => {
        clearTimer();
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setPhase("done");
        setIsEvaluating(true);

        try {
            const aiResponse = await api.processAI("evaluate", JSON.stringify({
                type: "speaking",
                prompt: currentPrompt.prompt,
                transcript: transcript || "No speech detected."
            }));

            const parsedFeedback = typeof aiResponse === 'string' ? JSON.parse(aiResponse) : aiResponse;
            setFeedback(parsedFeedback);

            if (parsedFeedback?.overall) {
                await api.updateProgress(parsedFeedback.overall);
            }
        } catch (error) {
            console.error("AI Evaluation Error:", error);
            // Fallback
            const overall = Math.floor(Math.random() * 20 + 70);
            setFeedback({
                overall,
                pronunciation: Math.min(100, overall + Math.floor(Math.random() * 10 - 5)),
                fluency: Math.min(100, overall + Math.floor(Math.random() * 10 - 5)),
                coherence: Math.min(100, overall + Math.floor(Math.random() * 10 - 5)),
                tips: [
                    "AI evaluation failed. This is a simulated result.",
                    "Check your internet connection and try again.",
                ],
            });
            await api.updateProgress(overall);
        } finally {
            setIsEvaluating(false);
        }
    };

    const handleMic = () => {
        if (phase === "idle") {
            startPrep();
        } else if (phase === "recording") {
            stopRecording();
        }
    };

    const handleNext = () => {
        clearTimer();
        if (currentIndex < totalPrompts - 1) {
            setCurrentIndex(prev => prev + 1);
            setPhase("idle");
            setFeedback(null);
            setTranscript("");
            setElapsed(0);
            setPrepLeft(PREP_TIME);
        } else {
            setIsFinished(true);
            localStorage.setItem("speaking_progress_count", totalPrompts.toString());
        }
    };

    const resetModule = () => {
        setCurrentIndex(0);
        setPhase("idle");
        setFeedback(null);
        setElapsed(0);
        setPrepLeft(PREP_TIME);
        setIsFinished(false);
        localStorage.removeItem("speaking_current_index");
        localStorage.removeItem("speaking_progress_count");
    };

    const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

    const ScoreBar = ({ label, value }: { label: string; value: number }) => (
        <div className="mb-3">
            <div className="flex justify-between text-xs font-poppins mb-1">
                <span className="text-muted-foreground">{label}</span>
                <span style={{ color: "hsl(270, 80%, 75%)" }}>{value}/100</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsla(270, 30%, 20%, 0.6)" }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ background: "linear-gradient(90deg, #7f5af0, #a78bfa)" }}
                />
            </div>
        </div>
    );

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-[#0F0A1E]"><Spinner /></div>;
    }

    if (!currentPrompt) {
        return (
            <div className="min-h-screen animated-bg flex items-center justify-center p-6">
                <ErrorMessage 
                    message="The speaking prompt database appears to be empty." 
                    onRetry={() => window.location.reload()} 
                />
            </div>
        );
    }

    if (isFinished) {
        return (
            <div className="min-h-screen animated-bg flex items-center justify-center p-6 text-foreground">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-3xl p-10 max-w-md w-full text-center"
                    style={{ background: "hsla(270, 20%, 8%, 0.9)", border: "1px solid hsla(270, 80%, 55%, 0.2)", boxShadow: "0 0 60px hsla(270, 80%, 55%, 0.12)" }}
                >
                    <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <h2 className="font-poppins font-bold text-2xl mb-2">Speaking Complete!</h2>
                    <p className="text-muted-foreground text-sm font-poppins mb-8">You've completed all 60 speaking prompts. Excellent practice!</p>
                    <div className="flex gap-3">
                        <button onClick={() => navigate("/task")} className="flex-1 rounded-2xl py-3.5 font-poppins font-semibold text-sm transition-all hover:scale-[1.02]" style={{ background: "hsla(270, 20%, 14%, 0.7)", border: "1px solid hsla(270, 30%, 25%, 0.3)" }}>Dashboard</button>
                        <button onClick={resetModule} className="flex-1 rounded-2xl py-3.5 font-poppins font-semibold text-sm text-white transition-all hover:scale-[1.02]" style={{ background: "linear-gradient(135deg, #7f5af0, #8b5cf6)" }}>Restart</button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen animated-bg relative pb-10 text-foreground">
            <div className="orb orb-violet w-[450px] h-[450px] -top-20 left-1/2 -translate-x-1/2 float opacity-15 pointer-events-none" />

            {/* Header */}
            <div className="sticky top-0 z-40 flex items-center justify-between px-6 py-4" style={{ background: "hsla(270, 25%, 6%, 0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid hsla(270, 40%, 35%, 0.15)" }}>
                <button onClick={() => navigate("/task")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-violet-300 transition-colors">
                    <ArrowLeft className="w-4 h-4" />Back
                </button>
                <div className="flex flex-col items-center gap-1">
                    <div className="font-poppins font-semibold text-foreground flex items-center gap-2">
                        <Mic className="w-4 h-4 text-violet-400" />Speaking Module
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
                            <motion.div className="h-full bg-violet-500 rounded-full" animate={{ width: `${(currentIndex / totalPrompts) * 100}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground font-poppins">{currentIndex + 1}/{totalPrompts}</span>
                    </div>
                </div>
                <div className="w-16" />
            </div>

            <div className="container mx-auto px-6 py-10 max-w-xl text-center">
                {/* Prompt Card */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="rounded-2xl p-7 mb-8"
                        style={{ background: "hsla(270, 20%, 8%, 0.8)", backdropFilter: "blur(20px)", border: "1px solid hsla(270, 60%, 55%, 0.15)" }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-semibold text-violet-400 uppercase tracking-widest font-poppins">{currentPrompt.category}</span>
                            <div className="flex gap-3 text-xs text-muted-foreground font-poppins">
                                <span>⏱ Prep: {currentPrompt.prepTime}</span>
                                <span>🎤 Speak: {currentPrompt.speakingTime}</span>
                            </div>
                        </div>
                        <div className="text-3xl mb-3">{currentPrompt.emoji}</div>
                        <p className="text-lg font-poppins font-semibold text-foreground leading-relaxed">{currentPrompt.prompt}</p>
                    </motion.div>
                </AnimatePresence>

                {/* Prep Countdown */}
                {phase === "prep" && (
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="mb-6">
                        <div className="text-5xl font-bold text-violet-400 font-poppins mb-1">{prepLeft}</div>
                        <p className="text-sm text-muted-foreground font-poppins">Get ready to speak...</p>
                    </motion.div>
                )}

                {/* Big Mic Button */}
                {phase !== "done" && (
                    <div className="relative flex items-center justify-center mb-8">
                        {/* Pulse rings when recording */}
                        {phase === "recording" && [1, 2, 3].map(n => (
                            <motion.div
                                key={n}
                                className="absolute rounded-full border"
                                initial={{ scale: 1, opacity: 0.6 }}
                                animate={{ scale: 1 + n * 0.4, opacity: 0 }}
                                transition={{ duration: 1.5, delay: n * 0.4, repeat: Infinity, ease: "easeOut" }}
                                style={{ width: 120, height: 120, borderColor: "hsla(270, 80%, 55%, 0.5)" }}
                            />
                        ))}
                        <button
                            onClick={handleMic}
                            disabled={phase === "prep"}
                            className="relative w-28 h-28 rounded-full flex flex-col items-center justify-center gap-1 transition-all duration-300 hover:scale-105 disabled:cursor-not-allowed"
                            style={phase === "recording" ? {
                                background: "linear-gradient(135deg, hsla(0, 80%, 50%, 0.9), hsla(0, 70%, 40%, 0.9))",
                                boxShadow: "0 0 50px hsla(0, 80%, 55%, 0.5), 0 0 100px hsla(0, 80%, 55%, 0.2)",
                            } : phase === "prep" ? {
                                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                                boxShadow: "0 0 40px hsla(45, 90%, 55%, 0.4)",
                            } : {
                                background: "linear-gradient(135deg, #7f5af0, #8b5cf6)",
                                boxShadow: "0 0 40px hsla(262, 83%, 58%, 0.5), 0 0 80px hsla(262, 83%, 58%, 0.2)",
                            }}
                        >
                            {phase === "recording" ? <MicOff className="w-8 h-8 text-white" /> : <Mic className="w-8 h-8 text-white" />}
                        </button>
                    </div>
                )}

                {/* Status Text */}
                <div className="mb-8">
                    {phase === "idle" && <p className="text-sm text-muted-foreground font-poppins">Tap the microphone to start your preparation time</p>}
                    {phase === "prep" && <p className="text-sm text-amber-400 font-poppins font-semibold">Preparing... Start speaking when the timer hits 0!</p>}
                    {phase === "recording" && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-2">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                <span className="font-poppins font-semibold text-red-400">Recording...</span>
                            </div>
                            <span className="font-poppins text-2xl font-bold" style={{ color: "hsl(270, 80%, 75%)" }}>{fmt(elapsed)}</span>
                            
                            {transcript && (
                                <p className="text-xs text-muted-foreground mt-2 italic line-clamp-2 max-w-sm">
                                    "{transcript}..."
                                </p>
                            )}
                            
                            <p className="text-xs text-muted-foreground">Tap again to stop</p>
                        </motion.div>
                    )}
                    {phase === "done" && isEvaluating && (
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-10 h-10 rounded-full border-4 border-violet-500/20 border-t-violet-500 animate-spin" />
                            <p className="text-sm text-muted-foreground font-poppins animate-pulse">Analyzing your pronunciation & fluency...</p>
                        </div>
                    )}
                    {phase === "done" && !isEvaluating && !feedback && (
                        <p className="text-sm text-muted-foreground font-poppins">Loading feedback...</p>
                    )}
                </div>

                {/* AI Feedback Card */}
                <AnimatePresence>
                    {feedback && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 30 }}
                            transition={{ duration: 0.5 }}
                            className="text-left rounded-2xl p-7 mb-6"
                            style={{ background: "hsla(270, 20%, 8%, 0.9)", border: "1px solid hsla(270, 60%, 55%, 0.2)", boxShadow: "0 0 40px hsla(270, 80%, 55%, 0.08)" }}
                        >
                            {/* Overall Score */}
                            <div className="flex items-center justify-between mb-5">
                                <div>
                                    <div className="text-xs text-muted-foreground font-poppins mb-1">AI Score</div>
                                    <div className="font-poppins text-4xl font-extrabold" style={{ background: "linear-gradient(135deg, #a78bfa, #7f5af0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                                        {feedback.overall}
                                    </div>
                                    <div className="text-xs text-muted-foreground font-poppins">out of 100</div>
                                </div>
                                <div className="flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <Star key={s} className="w-5 h-5"
                                            fill={s <= Math.round(feedback.overall / 20) ? "hsl(270, 80%, 70%)" : "transparent"}
                                            stroke={s <= Math.round(feedback.overall / 20) ? "hsl(270, 80%, 70%)" : "hsla(270, 20%, 40%, 0.5)"}
                                        />
                                    ))}
                                </div>
                            </div>
                            <ScoreBar label="Pronunciation" value={feedback.pronunciation} />
                            <ScoreBar label="Fluency" value={feedback.fluency} />
                            <ScoreBar label="Coherence" value={feedback.coherence} />
                            <div className="mt-4">
                                <div className="text-xs font-semibold text-violet-300 font-poppins mb-2">💡 Tips</div>
                                {feedback.tips.map((tip, i) => (
                                    <div key={i} className="flex items-start gap-2 mb-2">
                                        <span className="text-violet-500 mt-0.5 text-xs">•</span>
                                        <p className="text-xs text-muted-foreground font-poppins">{tip}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Next / Back */}
                {feedback && (
                    <div className="flex gap-3">
                        <button onClick={() => navigate("/task")} className="flex-1 rounded-2xl py-3.5 font-poppins font-semibold text-sm text-muted-foreground transition-all hover:scale-[1.02]" style={{ background: "hsla(270, 20%, 12%, 0.7)", border: "1px solid hsla(270, 30%, 25%, 0.3)" }}>
                            Dashboard
                        </button>
                        <button 
                            onClick={handleNext} 
                            disabled={isEvaluating}
                            className="flex-1 rounded-2xl py-3.5 font-poppins font-semibold text-sm text-white transition-all hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50" 
                            style={{ background: "linear-gradient(135deg, #7f5af0, #8b5cf6)", boxShadow: "0 0 20px hsla(262, 83%, 58%, 0.35)" }}
                        >
                            {currentIndex < totalPrompts - 1 ? "Next Prompt" : "Finish Module"}
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SpeakingModule;
