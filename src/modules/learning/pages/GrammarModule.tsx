import { useState, useEffect } from "react";
import { ArrowLeft, Send, PenTool, CheckCircle2, ChevronRight, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import Spinner from "@components/ui/Spinner";
import ErrorMessage from "@components/ui/ErrorMessage";
import { GrammarQuestion, QuestionData } from "@shared/questionService";

const GrammarModule = () => {
    const navigate = useNavigate();
    const [grammarQuestions, setGrammarQuestions] = useState<GrammarQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [completed, setCompleted] = useState(false);

    useEffect(() => {
        const loadQuestions = async () => {
            try {
                const data = await api.getQuestions();
                if (data && data.grammar) {
                    setGrammarQuestions(data.grammar);
                    
                    const saved = JSON.parse(localStorage.getItem("grammar_progress") || '{"completed": 0}');
                    setCurrentIndex(Math.min(saved.completed, data.grammar.length - 1));
                }
            } catch (err) {
                console.error("Failed to load questions:", err);
            } finally {
                setLoading(false);
            }
        };
        loadQuestions();
    }, []);

    const totalQuestions = grammarQuestions.length;
    const currentQuestion = grammarQuestions[currentIndex];

    // Load progress from localStorage if desired, but user wants to "complete" tasks
    // Let's just track the current session for now
    
    const handleOptionSelect = (idx: number) => {
        if (isAnswered) return;
        setSelectedOption(idx);
    };

    const handleCheckAnswer = () => {
        if (selectedOption === null) return;
        
        const isCorrect = selectedOption === currentQuestion.correctAnswer;
        if (isCorrect) setScore(s => s + 1);
        
        setIsAnswered(true);

        // Update global progress in localStorage for the dashboard card
        const savedProgress = JSON.parse(localStorage.getItem("grammar_progress") || '{"completed": 0}');
        localStorage.setItem("grammar_progress", JSON.stringify({
            completed: Math.max(savedProgress.completed, currentIndex + 1)
        }));
    };

    const handleNext = () => {
        if (currentIndex < totalQuestions - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setCompleted(true);
        }
    };

    const handleRestart = () => {
        setCurrentIndex(0);
        setSelectedOption(null);
        setIsAnswered(false);
        setScore(0);
        setCompleted(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen animated-bg flex items-center justify-center p-6">
                <Spinner />
            </div>
        );
    }

    if (!currentQuestion) {
        return (
            <div className="min-h-screen animated-bg flex items-center justify-center p-6">
                <ErrorMessage 
                    message="The grammar database appears to be empty." 
                    onRetry={() => window.location.reload()} 
                />
            </div>
        );
    }

    const progressPercentage = totalQuestions > 0 ? ((currentIndex) / totalQuestions) * 100 : 0;

    if (completed) {
        return (
            <div className="min-h-screen animated-bg relative flex flex-col items-center justify-center p-6 text-foreground">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="glass-strong rounded-[2.5rem] p-10 max-w-lg w-full text-center glow-border-violet"
                >
                    <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-green-400" />
                    </div>
                    <h2 className="text-3xl font-bold mb-2 font-poppins">Module Completed!</h2>
                    <p className="text-violet-200/60 mb-8">You've finished all grammar tasks.</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                            <div className="text-2xl font-bold text-violet-400">{score}/{totalQuestions}</div>
                            <div className="text-xs text-muted-foreground uppercase tracking-wider font-poppins">Final Score</div>
                        </div>
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                            <div className="text-2xl font-bold text-violet-400">{Math.round((score/totalQuestions)*100)}%</div>
                            <div className="text-xs text-muted-foreground uppercase tracking-wider font-poppins">Accuracy</div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button 
                            onClick={() => navigate("/task")}
                            className="w-full py-4 rounded-2xl bg-violet-600 font-bold hover:bg-violet-500 transition-all"
                        >
                            Return to Dashboard
                        </button>
                        <button 
                            onClick={handleRestart}
                            className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                        >
                            <RotateCcw className="w-4 h-4" /> Restart Module
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

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
                    <PenTool className="w-4 h-4 text-violet-400" />
                    Grammar Module
                </div>
                <div className="text-xs text-muted-foreground font-poppins">
                    Question {currentIndex + 1}/{totalQuestions}
                </div>
            </div>

            <div className="container mx-auto px-6 py-10 max-w-2xl">
                {/* Progress Bar */}
                <div className="w-full h-2 bg-white/5 rounded-full mb-8 overflow-hidden border border-white/5">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercentage}%` }}
                        className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-500"
                    />
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="glass-strong rounded-[2.5rem] p-8 md:p-10 glow-border-violet"
                    >
                        <div className="flex items-center gap-2 mb-6 text-violet-400 font-bold tracking-wider text-xs uppercase">
                            <CheckCircle2 className="w-4 h-4" /> Task {currentIndex + 1}
                        </div>

                        <h2 className="text-xl md:text-2xl font-bold mb-8 font-poppins leading-relaxed whitespace-pre-wrap">
                            {currentQuestion.question}
                        </h2>

                        <div className="space-y-3 mb-10">
                            {currentQuestion.options.map((option, idx) => {
                                const isSelected = selectedOption === idx;
                                const isCorrect = isAnswered && idx === currentQuestion.correctAnswer;
                                const isWrong = isAnswered && isSelected && !isCorrect;

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleOptionSelect(idx)}
                                        disabled={isAnswered}
                                        className={`w-full text-left p-5 rounded-2xl transition-all border-2 font-poppins group relative overflow-hidden ${
                                            isCorrect 
                                                ? "border-green-500/50 bg-green-500/10 text-green-100" 
                                                : isWrong
                                                    ? "border-red-500/50 bg-red-500/10 text-red-100"
                                                    : isSelected
                                                        ? "border-violet-500 bg-violet-500/20 text-white"
                                                        : "border-white/5 bg-white/5 text-violet-200/70 hover:bg-white/10 hover:border-white/10"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between relative z-10">
                                            <span>{option}</span>
                                            {isCorrect && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                                        </div>
                                        {isSelected && !isAnswered && (
                                            <motion.div 
                                                layoutId="active-bg"
                                                className="absolute inset-0 bg-violet-600/10 -z-0"
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {!isAnswered ? (
                            <button
                                onClick={handleCheckAnswer}
                                disabled={selectedOption === null}
                                className="w-full py-5 rounded-[1.5rem] bg-violet-600 text-white font-bold transition-all hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Send className="w-5 h-5" /> Check Answer
                            </button>
                        ) : (
                            <button
                                onClick={handleNext}
                                className="w-full py-5 rounded-[1.5rem] bg-white/10 border border-violet-500/30 text-white font-bold transition-all hover:bg-white/20 flex items-center justify-center gap-2"
                            >
                                {currentIndex < totalQuestions - 1 ? "Next Task" : "See Results"} <ChevronRight className="w-5 h-5" />
                            </button>
                        )}
                    </motion.div>
                </AnimatePresence>
                
                {/* Visual score hint */}
                <div className="mt-8 flex justify-center gap-2">
                    {Array.from({ length: Math.min(totalQuestions, 10) }).map((_, i) => (
                        <div 
                            key={i} 
                            className={`w-2 h-2 rounded-full transition-all duration-500 ${
                                i < currentIndex ? "bg-violet-500" : i === currentIndex ? "bg-white animate-pulse shadow-[0_0_10px_white]" : "bg-white/10"
                            }`} 
                        />
                    ))}
                    {totalQuestions > 10 && <span className="text-[10px] text-muted-foreground self-center">...</span>}
                </div>
            </div>
        </div>
    );
};

export default GrammarModule;
