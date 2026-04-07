import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Play, Pause, RotateCcw, Send, Volume2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Spinner from "@components/ui/Spinner";
import ErrorMessage from "@components/ui/ErrorMessage";

const WAVEFORM_BARS = 32;

import { useQuestions } from "@hooks/useQuestions";

const ListeningModule = () => {
    const navigate = useNavigate();
    const { data: questionData, isLoading } = useQuestions();
    const exercises = questionData?.listening || [];

    const [currentIdx, setCurrentIdx] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
    const [submitted, setSubmitted] = useState(false);
    const [feedback, setFeedback] = useState<{ score: number; message: string } | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem("listening_current_index");
        if (saved && exercises.length > 0) {
            setCurrentIdx(Math.min(parseInt(saved), exercises.length - 1));
        }
    }, [exercises]);

    const current = exercises[currentIdx];

    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    const handlePlayPause = () => {
        if (isPlaying) {
            clearInterval(intervalRef.current!);
            setIsPlaying(false);
            window.speechSynthesis.pause();
        } else {
            setIsPlaying(true);
            
            // if we are resuming after a pause
            if (window.speechSynthesis.paused) {
                window.speechSynthesis.resume();
                const step = 100 / (current.duration * 10);
                intervalRef.current = setInterval(() => {
                    setProgress(p => {
                        if (p >= 100) return 100;
                        return p + step;
                    });
                }, 100);
            } else {
                setProgress(0);
                window.speechSynthesis.cancel();

                if (current.text) {
                    const utterance = new SpeechSynthesisUtterance(current.text);
                    
                    utterance.onend = () => {
                        clearInterval(intervalRef.current!);
                        setIsPlaying(false);
                        setProgress(100);
                    };
                    utterance.onerror = () => {
                        clearInterval(intervalRef.current!);
                        setIsPlaying(false);
                    };
                    window.speechSynthesis.speak(utterance);
                    
                    const step = 100 / (current.duration * 10);
                    intervalRef.current = setInterval(() => {
                        setProgress(p => {
                            if (p >= 100) return 100;
                            return p + step;
                        });
                    }, 100);
                } else {
                    const step = 100 / (current.duration * 10);
                    intervalRef.current = setInterval(() => {
                        setProgress(p => {
                            if (p >= 100) {
                                clearInterval(intervalRef.current!);
                                setIsPlaying(false);
                                return 100;
                            }
                            return p + step;
                        });
                    }, 100);
                }
            }
        }
    };

    const handleReset = () => {
        clearInterval(intervalRef.current!);
        setIsPlaying(false);
        setProgress(0);
        window.speechSynthesis.cancel();
    };

    const handleOptionSelect = (qId: number, optionIdx: number) => {
        if (submitted) return;
        setSelectedAnswers(prev => ({
            ...prev,
            [qId]: optionIdx
        }));
    };

    const handleSubmit = () => {
        window.speechSynthesis.cancel();
        
        let correctCount = 0;
        current.mcqs?.forEach(q => {
            if (selectedAnswers[q.id] === q.correctAnswer) {
                correctCount++;
            }
        });
        
        const totalQs = current.mcqs?.length || 1;
        const score = Math.round((correctCount / totalQs) * 100);
        
        const msg =
            score >= 80
                ? "Excellent listening comprehension and grammar skills!"
                : score >= 50
                    ? "Good effort! Review the questions you missed for better understanding."
                    : "Keep practicing! Listen carefully and take notes next time.";
                    
        setFeedback({ score, message: msg });
        setSubmitted(true);
    };

    const handleNext = () => {
        if (currentIdx < exercises.length - 1) {
            setCurrentIdx(i => i + 1);
            setSelectedAnswers({});
            setSubmitted(false);
            setFeedback(null);
            setProgress(0);
            setIsPlaying(false);
            window.speechSynthesis.cancel();
        } else {
            navigate("/task");
        }
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-[#0F0A1E]"><Spinner /></div>;
    }

    if (!current) {
        return (
            <div className="min-h-screen animated-bg flex items-center justify-center p-6">
                <ErrorMessage 
                    message="The listening material is currently unavailable." 
                    onRetry={() => window.location.reload()} 
                />
            </div>
        );
    }

    const heights = Array.from({ length: WAVEFORM_BARS }, (_, i) => {
        const base = Math.sin(i * 0.5) * 0.4 + 0.6;
        const env = Math.sin(i * 0.2) * 0.3 + 0.7;
        return Math.max(0.15, base * env);
    });

    return (
        <div className="min-h-screen animated-bg relative pb-10 text-foreground">
            <div className="orb orb-violet w-[400px] h-[400px] -top-24 -right-24 float opacity-15 pointer-events-none" />

            {/* Header */}
            <div
                className="sticky top-0 z-40 flex items-center justify-between px-6 py-4"
                style={{
                    background: "hsla(270, 25%, 6%, 0.85)",
                    backdropFilter: "blur(20px)",
                    borderBottom: "1px solid hsla(270, 40%, 35%, 0.15)",
                }}
            >
                <button
                    onClick={() => navigate("/task")}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-violet-300 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>
                <div className="font-poppins font-semibold text-foreground flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-violet-400" />
                    Listening Module
                </div>
                <div className="text-xs text-muted-foreground font-poppins">
                    {currentIdx + 1}/{exercises.length}
                </div>
            </div>

            <div className="container mx-auto px-6 py-10 max-w-2xl">
                <motion.div
                    key={currentIdx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="rounded-2xl p-8 mb-6"
                    style={{
                        background: "hsla(270, 20%, 8%, 0.8)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid hsla(270, 60%, 55%, 0.15)",
                    }}
                >
                    <h2 className="font-poppins font-bold text-xl mb-1">{current.title}</h2>
                    <p className="text-sm text-muted-foreground mb-8 font-poppins">{current.description}</p>

                    {/* Waveform Visualization */}
                    <div
                        className="rounded-2xl p-6 mb-6"
                        style={{
                            background: "hsla(270, 30%, 5%, 0.8)",
                            border: "1px solid hsla(270, 60%, 50%, 0.1)",
                        }}
                    >
                        {/* Waveform bars */}
                        <div className="flex items-center justify-center gap-1 h-20 mb-5">
                            {heights.map((h, i) => {
                                const isActive = isPlaying && (i / WAVEFORM_BARS) * 100 <= progress;
                                const delay = i * 0.04;
                                return (
                                    <div
                                        key={i}
                                        className="waveform-bar transition-all duration-150"
                                        style={{
                                            height: `${h * 100}%`,
                                            opacity: isActive ? 1 : 0.25,
                                            background: isActive
                                                ? "linear-gradient(180deg, #a78bfa, #7f5af0)"
                                                : "hsla(270, 30%, 50%, 0.4)",
                                            boxShadow: isActive ? "0 0 8px hsla(270, 80%, 55%, 0.6)" : "none",
                                            animation: isPlaying && isActive ? `waveform ${0.4 + Math.random() * 0.4}s ease-in-out ${delay}s infinite` : "none",
                                        }}
                                    />
                                );
                            })}
                        </div>

                        {/* Progress bar */}
                        <div className="relative h-1.5 rounded-full mb-5 overflow-hidden" style={{ background: "hsla(270, 30%, 20%, 0.5)" }}>
                            <motion.div
                                className="h-full rounded-full"
                                style={{
                                    width: `${progress}%`,
                                    background: "linear-gradient(90deg, #7f5af0, #a78bfa)",
                                    boxShadow: "0 0 10px hsla(270, 80%, 55%, 0.4)",
                                }}
                                transition={{ duration: 0.1 }}
                            />
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-center gap-4">
                            <button
                                onClick={handleReset}
                                className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-violet-300 transition-colors"
                                style={{ background: "hsla(270, 30%, 15%, 0.6)" }}
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>
                            <button
                                onClick={handlePlayPause}
                                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold transition-all duration-300 hover:scale-110"
                                style={{
                                    background: "linear-gradient(135deg, #7f5af0, #8b5cf6)",
                                    boxShadow: isPlaying
                                        ? "0 0 30px hsla(262, 83%, 58%, 0.6)"
                                        : "0 0 20px hsla(262, 83%, 58%, 0.35)",
                                }}
                            >
                                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                            </button>
                            <div className="text-xs text-muted-foreground font-poppins w-10 text-center">
                                {current.duration}s
                            </div>
                        </div>
                    </div>

                    {/* MCQs Section */}
                    {current.mcqs && (
                        <div className="space-y-8 mt-8">
                            {current.mcqs.map((q, idx) => {
                                // Add Part headings when it changes
                                const isFirstOfPart = idx === 0 || q.part !== current.mcqs[idx - 1].part;
                                
                                return (
                                    <div key={q.id} className="space-y-4">
                                        {isFirstOfPart && (
                                            <h3 className="font-poppins font-bold text-lg text-violet-300 border-b border-violet-500/20 pb-2 mb-4 mt-6">
                                                {q.part}
                                            </h3>
                                        )}
                                        <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-4 shadow-sm">
                                            <p className="font-poppins text-[0.95rem] text-foreground mb-4 font-medium">
                                                {q.id}. {q.question.replace(/^\d+\.\s*/, '')}
                                            </p>
                                            <div className="space-y-2">
                                                {q.options.map((option, optIdx) => {
                                                    const isSelected = selectedAnswers[q.id] === optIdx;
                                                    const isCorrect = submitted && q.correctAnswer === optIdx;
                                                    const isWrong = submitted && isSelected && q.correctAnswer !== optIdx;
                                                    
                                                    let optionStyle = {
                                                        background: "hsla(270, 30%, 10%, 0.7)",
                                                        border: "1.5px solid hsla(270, 60%, 55%, 0.2)",
                                                        color: "hsl(270, 20%, 90%)",
                                                    };
                                                    
                                                    if (submitted) {
                                                        if (isCorrect) {
                                                            optionStyle = {
                                                                background: "hsla(140, 50%, 15%, 0.8)",
                                                                border: "1.5px solid hsla(140, 60%, 50%, 0.5)",
                                                                color: "hsl(140, 80%, 90%)",
                                                            };
                                                        } else if (isWrong) {
                                                            optionStyle = {
                                                                background: "hsla(0, 50%, 15%, 0.8)",
                                                                border: "1.5px solid hsla(0, 60%, 50%, 0.5)",
                                                                color: "hsl(0, 80%, 90%)",
                                                            };
                                                        }
                                                    } else if (isSelected) {
                                                        optionStyle = {
                                                            background: "hsla(270, 40%, 20%, 0.9)",
                                                            border: "1.5px solid hsla(270, 80%, 65%, 0.8)",
                                                            color: "white",
                                                        };
                                                    }
                                                    
                                                    return (
                                                        <button
                                                            key={optIdx}
                                                            onClick={() => handleOptionSelect(q.id, optIdx)}
                                                            disabled={submitted}
                                                            className={`w-full text-left rounded-lg px-4 py-3 text-sm font-poppins transition-all duration-200 ${
                                                                !submitted ? "hover:border-violet-400 hover:bg-white/10" : ""
                                                            } ${isSelected ? "ring-2 ring-violet-500/30" : ""}`}
                                                            style={optionStyle}
                                                        >
                                                            {option}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>

                {/* AI Feedback */}
                <AnimatePresence>
                    {feedback && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.4 }}
                            className="rounded-2xl p-6 mb-8"
                            style={{
                                background: "hsla(270, 25%, 9%, 0.9)",
                                border: "1px solid hsla(270, 60%, 55%, 0.2)",
                                boxShadow: "0 0 30px hsla(270, 80%, 55%, 0.08)",
                            }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <span className="font-poppins font-semibold text-sm text-violet-300">🤖 Results Feedback</span>
                                <div className="flex items-center gap-2">
                                    <div
                                        className="text-2xl font-extrabold font-poppins"
                                        style={{
                                            background: "linear-gradient(135deg, #a78bfa, #7f5af0)",
                                            WebkitBackgroundClip: "text",
                                            WebkitTextFillColor: "transparent",
                                            backgroundClip: "text",
                                        }}
                                    >
                                        {feedback.score}
                                    </div>
                                    <span className="text-xs text-muted-foreground font-poppins">%</span>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground font-poppins">{feedback.message}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Action Button */}
                {!submitted ? (
                    <button
                        onClick={handleSubmit}
                        disabled={Object.keys(selectedAnswers).length < (current.mcqs?.length || 0)}
                        className="flex items-center gap-2 w-full justify-center rounded-2xl py-4 font-poppins font-semibold text-white transition-all duration-300 hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed mb-10"
                        style={{
                            background: "linear-gradient(135deg, #7f5af0, #8b5cf6)",
                            boxShadow: "0 0 30px hsla(262, 83%, 58%, 0.35)",
                        }}
                    >
                        <Send className="w-5 h-5" />
                        Submit Answers
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        className="flex items-center gap-2 w-full justify-center rounded-2xl py-4 font-poppins font-semibold text-violet-300 transition-all duration-300 hover:scale-[1.02] mb-10"
                        style={{
                            background: "hsla(270, 80%, 55%, 0.1)",
                            border: "1px solid hsla(270, 80%, 55%, 0.3)",
                        }}
                    >
                        {currentIdx < exercises.length - 1 ? "Next Exercise >" : "Return to Task Dashboard"}
                    </button>
                )}
            </div>
        </div>
    );
};

export default ListeningModule;
