import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle, XCircle, ChevronRight, BookOpen, Clock, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiService as api } from "@shared/api";
import Spinner from "@components/ui/Spinner";
import ErrorMessage from "@components/ui/ErrorMessage";


import { useQuestions } from "../hooks/useQuestions";

const ReadingModule = () => {
    const navigate = useNavigate();
    const { data: questionData, isLoading } = useQuestions();
    const readingPassages = questionData?.reading || [];

    // State management
    const [currentPassageIndex, setCurrentPassageIndex] = useState(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        if (readingPassages.length > 0) {
            const savedPassage = localStorage.getItem("reading_passage_index");
            const savedQuestion = localStorage.getItem("reading_question_index");
            if (savedPassage) setCurrentPassageIndex(Math.min(parseInt(savedPassage), readingPassages.length - 1));
            
            const passIdx = savedPassage ? parseInt(savedPassage) : 0;
            const currentPass = readingPassages[passIdx];
            if (savedQuestion && currentPass) {
                setCurrentQuestionIndex(Math.min(parseInt(savedQuestion), currentPass.questions.length - 1));
            }
        }
    }, [readingPassages]);

    const currentPassage = readingPassages[currentPassageIndex];
    const currentQuestion = currentPassage?.questions[currentQuestionIndex];
    const totalQuestions = readingPassages.reduce((acc, p) => acc + p.questions.length, 0);
    const overallProgress = readingPassages.slice(0, currentPassageIndex).reduce((acc, p) => acc + p.questions.length, 0) + currentQuestionIndex;

    // Persist progress
    useEffect(() => {
        if (!isLoading && readingPassages.length > 0) {
            localStorage.setItem("reading_passage_index", currentPassageIndex.toString());
            localStorage.setItem("reading_question_index", currentQuestionIndex.toString());
            localStorage.setItem("reading_progress_count", overallProgress.toString());
        }
    }, [currentPassageIndex, currentQuestionIndex, overallProgress, isLoading, readingPassages]);

    const handleCheck = () => {
        if (!selectedAnswer || !currentQuestion) return;
        setShowFeedback(true);
        if (selectedAnswer === currentQuestion.answer) {
            setScore(prev => prev + 1);
        }
    };

    const handleNext = () => {
        setShowFeedback(false);
        setSelectedAnswer(null);

        if (currentQuestionIndex < currentPassage.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else if (currentPassageIndex < readingPassages.length - 1) {
            setCurrentPassageIndex(prev => prev + 1);
            setCurrentQuestionIndex(0);
        } else {
            setIsFinished(true);
        }
    };

    const resetModule = () => {
        setCurrentPassageIndex(0);
        setCurrentQuestionIndex(0);
        setScore(0);
        setIsFinished(false);
        setSelectedAnswer(null);
        setShowFeedback(false);
        localStorage.removeItem("reading_passage_index");
        localStorage.removeItem("reading_question_index");
        localStorage.removeItem("reading_progress_count");
    };

    if (isLoading) {
        return (
            <div className="min-h-screen animated-bg flex items-center justify-center p-6">
                <Spinner />
            </div>
        );
    }

    if (!currentPassage) {
        return (
            <div className="min-h-screen animated-bg flex items-center justify-center p-6">
                <ErrorMessage 
                    message="The reading database appears to be empty." 
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
                    className="glass-card p-10 max-w-md w-full text-center relative z-10"
                    style={{ background: "hsla(270, 20%, 8%, 0.9)", border: "1px solid hsla(270, 80%, 55%, 0.2)" }}
                >
                    <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <h2 className="font-display text-2xl font-bold mb-2">Reading Completed!</h2>
                    <p className="text-muted-foreground mb-6">You've mastered all reading passages.</p>
                    <div className="text-5xl font-bold text-violet-400 mb-8">{Math.round((score / totalQuestions) * 100)}%</div>
                    <p className="text-sm text-muted-foreground mb-8">{score} / {totalQuestions} correct answers</p>
                    <div className="flex gap-4">
                        <button onClick={() => navigate("/task")} className="flex-1 py-3 rounded-xl bg-violet-500/10 border border-violet-500/20 font-semibold transition-all hover:bg-violet-500/20">Dashboard</button>
                        <button onClick={resetModule} className="flex-1 py-3 rounded-xl bg-primary text-white font-semibold transition-all hover:opacity-90">Restart</button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen animated-bg relative pb-32 text-foreground">
            {/* Header */}
            <header className="sticky top-0 z-50 glass-strong border-b border-border/50">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <button onClick={() => navigate("/task")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft className="w-4 h-4" /> Back</button>
                    <div className="flex flex-col items-center">
                        <span className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-1">Passage {currentPassageIndex + 1}/{readingPassages.length}</span>
                        <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
                            <motion.div className="h-full bg-violet-500" animate={{ width: `${(overallProgress / totalQuestions) * 100}%` }} />
                        </div>
                    </div>
                    <div className="w-20" /> {/* Spacer */}
                </div>
            </header>

            <main className="container mx-auto px-6 py-12 max-w-4xl">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`${currentPassageIndex}-${currentQuestionIndex}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >
                        {/* Passage text */}
                        <div className="glass-card p-8 leading-relaxed font-poppins text-lg" style={{ background: "hsla(270, 20%, 8%, 0.6)" }}>
                            <h2 className="font-display font-bold text-xl mb-4 text-violet-300">{currentPassage.title}</h2>
                            <p className="text-foreground/90">{currentPassage.content}</p>
                        </div>

                        {/* Question set */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-violet-500/20 text-violet-400 font-bold border border-violet-500/30">{currentQuestionIndex + 1}</div>
                                <h3 className="text-xl font-semibold">{currentQuestion.question}</h3>
                            </div>

                            <div className="grid gap-3">
                                {currentPassage.questions[currentQuestionIndex].options.map((opt, i) => {
                                    const letter = String.fromCharCode(65 + i);
                                    const isSelected = selectedAnswer === letter;
                                    const isCorrect = letter === currentQuestion.answer;
                                    
                                    let btnStyle = "bg-white/5 border-white/10";
                                    if (isSelected && !showFeedback) btnStyle = "bg-violet-500/20 border-violet-500/50 text-violet-300";
                                    if (showFeedback) {
                                        if (isCorrect) btnStyle = "bg-green-500/20 border-green-500/50 text-green-400";
                                        else if (isSelected) btnStyle = "bg-red-500/20 border-red-500/50 text-red-400";
                                    }

                                    return (
                                        <button
                                            key={i}
                                            disabled={showFeedback}
                                            onClick={() => setSelectedAnswer(letter)}
                                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl border text-left transition-all duration-300 ${btnStyle} ${!showFeedback && "hover:bg-white/10"}`}
                                        >
                                            <span className="font-bold opacity-50">{letter}.</span>
                                            <span className="flex-1">{opt}</span>
                                            {showFeedback && isCorrect && <CheckCircle className="w-5 h-5 text-green-400" />}
                                            {showFeedback && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-400" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Bottom Actions */}
            <footer className="fixed bottom-0 left-0 right-0 p-6 glass-strong border-t border-border/50 backdrop-blur-3xl">
                <div className="container mx-auto max-w-4xl flex items-center justify-between">
                    <div className="text-sm text-muted-foreground font-medium">Question {overallProgress + 1} of {totalQuestions}</div>
                    
                    {!showFeedback ? (
                        <button
                            onClick={handleCheck}
                            disabled={!selectedAnswer}
                            className="flex items-center gap-2 px-10 py-4 rounded-2xl bg-primary text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                        >
                            Check Answer
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            className="flex items-center gap-2 px-10 py-4 rounded-2xl bg-violet-600 text-white font-bold transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                        >
                            {currentQuestionIndex === currentPassage.questions.length - 1 && currentPassageIndex === readingPassages.length - 1 ? "Finish Results" : "Next Task"}
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </footer>
        </div>
    );
};

export default ReadingModule;
