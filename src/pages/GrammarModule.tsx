import { useState } from "react";
import { ArrowLeft, Send, PenTool } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { grammarQuestions } from "../data/grammarQuestions";

const GrammarModule = () => {
    const navigate = useNavigate();
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
    const [submitted, setSubmitted] = useState(false);
    const [feedback, setFeedback] = useState<{ score: number; message: string } | null>(null);

    const handleOptionSelect = (qId: number, optionIdx: number) => {
        if (submitted) return;
        setSelectedAnswers(prev => ({
            ...prev,
            [qId]: optionIdx
        }));
    };

    const handleSubmit = () => {
        let correctCount = 0;
        grammarQuestions.forEach(q => {
            if (selectedAnswers[q.id] === q.correctAnswer) {
                correctCount++;
            }
        });
        
        const totalQs = grammarQuestions.length;
        const score = Math.round((correctCount / totalQs) * 100);
        
        const msg =
            score >= 80
                ? "Excellent grammar skills!"
                : score >= 50
                    ? "Good effort! Review the rules for the questions you missed."
                    : "Keep practicing! Don't forget that failure plays an important role in success!";
                    
        setFeedback({ score, message: msg });
        setSubmitted(true);
    };

    const handleNext = () => {
        navigate("/task");
    };

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
                    Task 1/1
                </div>
            </div>

            <div className="container mx-auto px-6 py-10 max-w-2xl">
                <motion.div
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
                    <h2 className="font-poppins font-bold text-xl mb-1 mt-2">Grammar Exercise 1</h2>
                    <p className="text-sm text-muted-foreground mb-8 font-poppins">Choose the correct answer for the following questions.</p>

                    {/* MCQs Section */}
                    <div className="space-y-8 mt-8">
                        {grammarQuestions.map((q) => {
                            return (
                                <div key={q.id} className="space-y-4">
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-4 shadow-sm">
                                        <p className="font-poppins text-[0.95rem] text-foreground mb-4 font-medium whitespace-pre-wrap">
                                            {q.id}. {q.question}
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
                        disabled={Object.keys(selectedAnswers).length < grammarQuestions.length}
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
                        Return to Task Dashboard
                    </button>
                )}
            </div>
        </div>
    );
};

export default GrammarModule;
