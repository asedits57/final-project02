import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, PenTool, ChevronRight, Trophy, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useStore } from "../store/useStore";
import Spinner from "@/components/ui/Spinner";
import ErrorMessage from "@/components/ui/ErrorMessage";

import { toast } from "sonner";

const TASK_TIME = 300; // 5 minutes per task
const MIN_WORD_COUNT = 10;

interface WritingFeedback {
    score: number;
    grammar: number;
    vocabulary: number;
    clarity: number;
    suggestions: string[];
}

const WritingModule = () => {
    const navigate = useNavigate();
    const [writingTasks, setWritingTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [text, setText] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [timeLeft, setTimeLeft] = useState(TASK_TIME);
    const [feedback, setFeedback] = useState<WritingFeedback | null>(null);
    const [isEvaluating, setIsEvaluating] = useState(false);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const loadQuestions = async () => {
            try {
                const data = await api.fetchQuestions();
                if (data && data.writing) {
                    setWritingTasks(data.writing);
                    
                    const saved = localStorage.getItem("writing_current_index");
                    if (saved) setCurrentIndex(Math.min(parseInt(saved), data.writing.length - 1));
                }
            } catch (err) {
                console.error("Failed to load writing questions:", err);
            } finally {
                setLoading(false);
            }
        };
        loadQuestions();
    }, []);

    const currentTask = writingTasks[currentIndex];
    const totalTasks = writingTasks.length;

    const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;

    // handleSubmit defined before useEffect to avoid TDZ
    const handleSubmit = useCallback(async (timedOut = false) => {
        if (timerRef.current) clearInterval(timerRef.current);
        setSubmitted(true);
        
        if (timedOut && text.trim() === "") {
            setFeedback({
                score: 0,
                grammar: 0,
                vocabulary: 0,
                clarity: 0,
                suggestions: ["Time expired before response was started."],
            });
            return;
        }

        if (!currentTask) return;

        setIsEvaluating(true);
        try {
            const aiResponse = await api.processAI("evaluate", JSON.stringify({
                type: "writing",
                prompt: currentTask.prompt,
                studentSubmission: text
            }));

            const parsedFeedback = typeof aiResponse === 'string' ? JSON.parse(aiResponse) : aiResponse;
            setFeedback(parsedFeedback);

            if (parsedFeedback?.score) {
                await api.updateProgress(parsedFeedback.score);
            }
        } catch (error) {
            console.error("AI Evaluation Error:", error);
            // Fallback to random score if AI fails
            const words = wordCount;
            const score = Math.min(100, Math.max(20, words * 3));
            setFeedback({
                score,
                grammar: Math.min(100, score + Math.floor(Math.random() * 10 - 5)),
                vocabulary: Math.min(100, score - 5 + Math.floor(Math.random() * 15)),
                clarity: Math.min(100, score + 5),
                suggestions: [
                    "Our AI evaluator is currently busy. Here is an automated estimate.",
                    "Try again later for a more detailed analysis.",
                ],
            });
            await api.updateProgress(score);
        } finally {
            setIsEvaluating(false);
        }
    }, [currentTask?.prompt, text, wordCount]);

    // Persist progress
    useEffect(() => {
        localStorage.setItem("writing_current_index", currentIndex.toString());
        localStorage.setItem("writing_progress_count", currentIndex.toString());
    }, [currentIndex]);

    // Timer
    useEffect(() => {
        if (submitted) return;
        setTimeLeft(TASK_TIME);
        timerRef.current = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    clearInterval(timerRef.current!);
                    handleSubmit(true);
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current!);
    }, [currentIndex, handleSubmit, submitted]);

    const formatTime = (s: number) =>
        `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

    const handleNext = () => {
        if (currentIndex < totalTasks - 1) {
            setCurrentIndex(prev => prev + 1);
            setText("");
            setSubmitted(false);
            setFeedback(null);
        } else {
            setIsFinished(true);
            localStorage.setItem("writing_progress_count", totalTasks.toString());
        }
    };

    const resetModule = () => {
        setCurrentIndex(0);
        setText("");
        setSubmitted(false);
        setFeedback(null);
        setIsFinished(false);
        localStorage.removeItem("writing_current_index");
        localStorage.removeItem("writing_progress_count");
    };

    if (loading) {
        return (
            <div className="min-h-screen animated-bg flex items-center justify-center p-6 text-white text-center">
                <Spinner />
            </div>
        );
    }

    if (!currentTask) {
        return (
            <div className="min-h-screen animated-bg flex items-center justify-center p-6 text-white text-center">
                <ErrorMessage 
                    message="The writing task database appears to be empty." 
                    onRetry={() => window.location.reload()} 
                />
            </div>
        );
    }

    const timerPercent = Math.round((timeLeft / TASK_TIME) * 100);
    const circumference = 2 * Math.PI * 16;
    const timerOffset = circumference - (timerPercent / 100) * circumference;
    const charLimit = 800;
    const charPercent = Math.round((text.length / charLimit) * 100);
    const charCircumference = 2 * Math.PI * 16;
    const charOffset = charCircumference - (charPercent / 100) * charCircumference;

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
                    <h2 className="font-poppins font-bold text-2xl mb-2">Writing Complete!</h2>
                    <p className="text-muted-foreground text-sm font-poppins mb-8">You've completed all 50 writing tasks. Excellent effort!</p>
                    <div className="flex gap-3">
                        <button onClick={() => navigate("/task")} className="flex-1 rounded-2xl py-3.5 font-poppins font-semibold text-sm transition-all hover:scale-[1.02]" style={{ background: "hsla(270, 20%, 14%, 0.7)", border: "1px solid hsla(270, 30%, 25%, 0.3)" }}>Dashboard</button>
                        <button onClick={resetModule} className="flex-1 rounded-2xl py-3.5 font-poppins font-semibold text-sm text-white transition-all hover:scale-[1.02]" style={{ background: "linear-gradient(135deg, #7f5af0, #8b5cf6)" }}>Restart</button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen animated-bg relative overflow-hidden text-foreground">
            <div className="orb orb-violet w-[400px] h-[400px] top-20 -right-24 float opacity-15 pointer-events-none" />
            <div className="orb orb-cyan w-[200px] h-[200px] bottom-10 -left-10 float-delayed opacity-10 pointer-events-none" />

            {/* Header */}
            <div className="sticky top-0 z-40 flex items-center justify-between px-6 py-4" style={{ background: "hsla(270, 25%, 6%, 0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid hsla(270, 40%, 35%, 0.15)" }}>
                <button onClick={() => navigate("/task")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-violet-300 transition-colors">
                    <ArrowLeft className="w-4 h-4" />Back
                </button>
                <div className="flex flex-col items-center gap-1">
                    <div className="font-poppins font-semibold text-foreground flex items-center gap-2">
                        <PenTool className="w-4 h-4 text-violet-400" />Writing Module
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
                            <motion.div className="h-full bg-violet-500 rounded-full" animate={{ width: `${((currentIndex) / totalTasks) * 100}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground font-poppins">{currentIndex + 1}/{totalTasks}</span>
                    </div>
                </div>
                {/* Timer */}
                <div className="relative flex items-center justify-center">
                    <svg width="42" height="42" className="-rotate-90">
                        <circle cx="21" cy="21" r="16" fill="none" strokeWidth="2.5" stroke="hsla(270, 30%, 25%, 0.5)" />
                        <circle cx="21" cy="21" r="16" fill="none" strokeWidth="2.5"
                            stroke={timeLeft < 60 ? "hsl(0, 80%, 60%)" : "hsl(270, 80%, 65%)"}
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={timerOffset}
                            style={{ filter: `drop-shadow(0 0 4px ${timeLeft < 60 ? "hsl(0,80%,55%)" : "hsl(270,80%,55%)"})`, transition: "stroke-dashoffset 1s linear, stroke 0.5s ease" }}
                        />
                    </svg>
                    <div className="absolute text-[9px] font-bold font-poppins" style={{ color: timeLeft < 60 ? "hsl(0, 80%, 65%)" : "hsl(270, 80%, 80%)" }}>
                        {formatTime(timeLeft)}
                    </div>
                </div>
            </div>

            <div className="flex h-[calc(100vh-73px)]">
                {/* Main writing area */}
                <div className="flex-1 flex flex-col px-6 py-8 max-w-2xl mx-auto w-full pb-10 overflow-y-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex flex-col h-full"
                        >
                            {/* Prompt Card */}
                            <div className="rounded-2xl p-6 mb-6" style={{ background: "hsla(270, 20%, 8%, 0.8)", border: "1px solid hsla(270, 60%, 55%, 0.15)", boxShadow: "0 0 30px hsla(270, 80%, 55%, 0.06)" }}>
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-3xl">{currentTask.emoji}</span>
                                    <div>
                                        <div className="text-xs text-violet-400 font-poppins font-semibold uppercase tracking-wider mb-1">Task {currentIndex + 1} of {totalTasks}</div>
                                        <div className="flex gap-3 text-xs text-muted-foreground font-poppins">
                                            <span>⏱ {currentTask.timeLimit}</span>
                                            <span>📝 {currentTask.wordLimit}</span>
                                        </div>
                                    </div>
                                </div>
                                <h2 className="font-poppins font-bold text-lg text-foreground">{currentTask.prompt}</h2>
                            </div>

                            {/* Textarea */}
                            <div className="relative mb-4 flex-1">
                                <textarea
                                    value={text}
                                    onChange={e => setText(e.target.value.slice(0, charLimit))}
                                    disabled={submitted}
                                    placeholder="Start writing your response here..."
                                    rows={9}
                                    className="w-full h-full rounded-2xl px-5 py-4 text-sm font-poppins outline-none resize-none transition-all duration-300"
                                    style={{
                                        background: "hsla(270, 30%, 10%, 0.7)",
                                        border: "1.5px solid hsla(270, 60%, 55%, 0.2)",
                                        color: "hsl(270, 20%, 90%)",
                                        caretColor: "hsl(270, 80%, 70%)",
                                    }}
                                    onFocus={e => { e.currentTarget.style.border = "1.5px solid hsla(270, 80%, 55%, 0.5)"; e.currentTarget.style.boxShadow = "0 0 20px hsla(270, 80%, 55%, 0.12)"; }}
                                    onBlur={e => { e.currentTarget.style.border = "1.5px solid hsla(270, 60%, 55%, 0.2)"; e.currentTarget.style.boxShadow = "none"; }}
                                />
                                {/* Char counter ring */}
                                <div className="absolute bottom-4 right-4 flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground font-poppins">{wordCount} words</span>
                                    <svg width="38" height="38" className="-rotate-90">
                                        <circle cx="19" cy="19" r="16" fill="none" strokeWidth="2.5" stroke="hsla(270, 30%, 25%, 0.5)" />
                                        <circle cx="19" cy="19" r="16" fill="none" strokeWidth="2.5"
                                            stroke={charPercent >= 90 ? "hsl(0, 80%, 60%)" : "hsl(270, 80%, 65%)"}
                                            strokeLinecap="round"
                                            strokeDasharray={charCircumference}
                                            strokeDashoffset={charOffset}
                                            style={{ filter: `drop-shadow(0 0 4px ${charPercent >= 90 ? "hsl(0,80%,55%)" : "hsl(270,80%,55%)"})`, transition: "stroke-dashoffset 0.3s ease, stroke 0.3s ease" }}
                                        />
                                    </svg>
                                </div>
                            </div>

                            {/* Action Button */}
                            {!submitted ? (
                                <button
                                    onClick={() => handleSubmit()}
                                    disabled={wordCount < MIN_WORD_COUNT}
                                    className="flex items-center gap-2 w-full justify-center rounded-2xl py-4 font-poppins font-semibold text-white transition-all duration-300 hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed"
                                    style={{ background: "linear-gradient(135deg, #7f5af0, #8b5cf6)", boxShadow: "0 0 30px hsla(262, 83%, 58%, 0.35)" }}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                    Submit Writing
                                </button>
                            ) : (
                                <button
                                    onClick={handleNext}
                                    disabled={isEvaluating}
                                    className="flex items-center gap-2 w-full justify-center rounded-2xl py-4 font-poppins font-semibold text-white transition-all hover:scale-[1.02] disabled:opacity-50"
                                    style={{ background: "linear-gradient(135deg, #7f5af0, #8b5cf6)", boxShadow: "0 0 30px hsla(262, 83%, 58%, 0.35)" }}
                                >
                                    {currentIndex < totalTasks - 1 ? "Next Task" : "Finish Module"}
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* AI Feedback Panel */}
                <AnimatePresence>
                    {submitted && feedback && (
                        <motion.div
                            initial={{ x: "100%", opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: "100%", opacity: 0 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="hidden md:flex w-80 flex-col overflow-y-auto py-8 px-6"
                            style={{ background: "hsla(270, 20%, 7%, 0.7)", backdropFilter: "blur(20px)", borderLeft: "1px solid hsla(270, 40%, 30%, 0.2)" }}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <span className="font-poppins font-bold text-sm text-violet-300">🤖 AI Feedback</span>
                            </div>

                            {isEvaluating ? (
                                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                                    <div className="w-12 h-12 rounded-full border-4 border-violet-500/20 border-t-violet-500 animate-spin" />
                                    <p className="text-xs text-muted-foreground font-poppins animate-pulse">Analyzing your response...</p>
                                </div>
                            ) : feedback && (
                                <>
                                    {/* Score */}
                                    <div className="text-center mb-6">
                                        <div className="font-poppins text-5xl font-extrabold mb-1" style={{ background: "linear-gradient(135deg, #a78bfa, #7f5af0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                                            {feedback.score}
                                        </div>
                                        <div className="text-xs text-muted-foreground font-poppins">Overall Score / 100</div>
                                    </div>

                                    {/* Score Bars */}
                                    {[
                                        { label: "Grammar", value: feedback.grammar },
                                        { label: "Vocabulary", value: feedback.vocabulary },
                                        { label: "Clarity", value: feedback.clarity },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="mb-4">
                                            <div className="flex justify-between text-xs font-poppins mb-1">
                                                <span className="text-muted-foreground">{label}</span>
                                                <span style={{ color: "hsl(270, 80%, 75%)" }}>{value}</span>
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
                                    ))}

                                    <div className="mt-4 pt-4" style={{ borderTop: "1px solid hsla(270, 40%, 30%, 0.2)" }}>
                                        <div className="text-xs font-semibold text-violet-300 font-poppins mb-3">💡 Suggestions</div>
                                        {feedback.suggestions.map((s, i) => (
                                            <div key={i} className="flex items-start gap-2 mb-3">
                                                <span className="text-violet-500 mt-0.5 text-xs shrink-0">•</span>
                                                <p className="text-xs text-muted-foreground font-poppins leading-relaxed">{s}</p>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default WritingModule;
