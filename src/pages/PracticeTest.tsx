import React, { useState, useRef, useCallback, useEffect } from "react";
import { Zap, RotateCcw, Home, Clock, CheckCircle, XCircle, ArrowLeft, ArrowRight, Volume2, Trophy } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useStore } from "@/store/useStore";


type Question = {
    id: number;
    type: "multiple-choice" | "fill-blank" | "audio" | "image-description";
    category: string;
    difficulty: string;
    question: string;
    options?: string[];
    correctAnswer: string;
    audioText?: string;
    imageUrl?: string;
    blanks?: string[];
    explanation: string;
};

const allQuestions: Question[] = [
    // ── Beginner ──
    {
        id: 1,
        type: "multiple-choice",
        category: "Grammar",
        difficulty: "Beginner",
        question: 'Choose the correct form: "She _____ to school every day."',
        options: ["go", "goes", "going", "gone"],
        correctAnswer: "goes",
        explanation: "Third-person singular present tense requires 'goes'.",
    },
    {
        id: 2,
        type: "fill-blank",
        category: "Vocabulary",
        difficulty: "Beginner",
        question: '"The opposite of hot is _____."',
        correctAnswer: "cold",
        blanks: ["cold", "warm", "cool"],
        explanation: "'Cold' is the direct antonym of 'hot'.",
    },
    {
        id: 3,
        type: "multiple-choice",
        category: "Reading",
        difficulty: "Beginner",
        question: 'What does the word "happy" mean?',
        options: ["Sad", "Feeling pleasure", "Angry", "Tired"],
        correctAnswer: "Feeling pleasure",
        explanation: "'Happy' means feeling or showing pleasure or contentment.",
    },
    {
        id: 4,
        type: "audio",
        category: "Listening",
        difficulty: "Beginner",
        question: "Listen and choose what the speaker is talking about:",
        audioText: "I wake up at seven o'clock every morning. I eat breakfast, brush my teeth, and then I walk to school. My favorite subject is science.",
        options: ["A weekend trip", "A daily morning routine", "A cooking recipe", "A sports event"],
        correctAnswer: "A daily morning routine",
        explanation: "The speaker describes waking up, eating breakfast, and going to school — a daily routine.",
    },
    {
        id: 5,
        type: "fill-blank",
        category: "Grammar",
        difficulty: "Beginner",
        question: '"They _____ playing football in the park right now."',
        correctAnswer: "are",
        blanks: ["are", "is", "was"],
        explanation: "'They' takes the plural auxiliary 'are' in present continuous.",
    },

    // ── Intermediate ──
    {
        id: 6,
        type: "multiple-choice",
        category: "Grammar",
        difficulty: "Intermediate",
        question: "Choose the correct sentence:",
        options: [
            "She don't like coffee in the morning.",
            "She doesn't likes coffee in the morning.",
            "She doesn't like coffee in the morning.",
            "She not like coffee in the morning.",
        ],
        correctAnswer: "She doesn't like coffee in the morning.",
        explanation: "With third-person singular subjects, we use 'doesn't' + base form of the verb.",
    },
    {
        id: 7,
        type: "fill-blank",
        category: "Grammar",
        difficulty: "Intermediate",
        question: '"If I _____ known about the meeting, I would have attended."',
        correctAnswer: "had",
        blanks: ["had", "have", "has"],
        explanation: "Third conditional (past unreal condition) requires 'had' + past participle.",
    },
    {
        id: 8,
        type: "audio",
        category: "Listening",
        difficulty: "Intermediate",
        question: "Listen to the passage and select the main idea:",
        audioText: "Climate change is one of the most pressing issues facing our planet today. Rising temperatures are causing ice caps to melt, sea levels to rise, and extreme weather events to become more frequent. Scientists agree that immediate action is needed to reduce greenhouse gas emissions.",
        options: [
            "Scientists disagree about climate change.",
            "Climate change requires urgent action to address its effects.",
            "Sea levels have always been rising naturally.",
            "Extreme weather events are decreasing over time.",
        ],
        correctAnswer: "Climate change requires urgent action to address its effects.",
        explanation: "The passage emphasizes the urgency of climate change and the need for immediate action.",
    },
    {
        id: 9,
        type: "multiple-choice",
        category: "Vocabulary",
        difficulty: "Intermediate",
        question: '"The new policy was met with widespread _____." Choose the best word:',
        options: ["Approval", "Ignorance", "Hostility", "Confusion"],
        correctAnswer: "Approval",
        explanation: "'Widespread approval' is a common collocation meaning general acceptance.",
    },
    {
        id: 10,
        type: "fill-blank",
        category: "Reading",
        difficulty: "Intermediate",
        question: '"Despite the heavy rain, the team _____ to complete the project on time."',
        correctAnswer: "managed",
        blanks: ["managed", "failed", "refused"],
        explanation: "'Managed to' indicates successfully doing something difficult.",
    },

    // ── Advanced ──
    {
        id: 11,
        type: "fill-blank",
        category: "Vocabulary",
        difficulty: "Advanced",
        question: '"The scientist\'s groundbreaking research had a profound _____ on the field of genetics."',
        correctAnswer: "impact",
        blanks: ["impact", "effect", "influence"],
        explanation: "'Impact' collocates naturally with 'profound' and 'on the field' in academic contexts.",
    },
    {
        id: 12,
        type: "audio",
        category: "Listening",
        difficulty: "Advanced",
        question: "Listen and identify the speaker's tone:",
        audioText: "I find it absolutely remarkable that after decades of research and billions of dollars in funding, we still can't seem to agree on the most basic solutions. Perhaps it's time we reconsidered our entire approach.",
        options: ["Enthusiastic and hopeful", "Sarcastic and frustrated", "Neutral and informative", "Cheerful and optimistic"],
        correctAnswer: "Sarcastic and frustrated",
        explanation: "The use of 'absolutely remarkable' paired with criticism indicates sarcasm and frustration.",
    },
    {
        id: 13,
        type: "multiple-choice",
        category: "Reading",
        difficulty: "Advanced",
        question: '"The author\'s use of juxtaposition in the passage primarily serves to:"',
        options: [
            "Introduce a new character",
            "Highlight contrasting ideas for emphasis",
            "Provide comic relief",
            "Summarize the main argument",
        ],
        correctAnswer: "Highlight contrasting ideas for emphasis",
        explanation: "Juxtaposition is a literary device used to place contrasting elements side by side for emphasis.",
    },
    {
        id: 14,
        type: "fill-blank",
        category: "Grammar",
        difficulty: "Advanced",
        question: '"Had the committee _____ the proposal earlier, the outcome might have been different."',
        correctAnswer: "reviewed",
        blanks: ["reviewed", "reviewing", "review"],
        explanation: "Inverted third conditional: 'Had + subject + past participle' replaces 'If + had'.",
    },
    {
        id: 15,
        type: "multiple-choice",
        category: "Vocabulary",
        difficulty: "Advanced",
        question: 'Which word means "to make something less severe"?',
        options: ["Exacerbate", "Mitigate", "Proliferate", "Corroborate"],
        correctAnswer: "Mitigate",
        explanation: "'Mitigate' means to make less severe, serious, or painful.",
    },

    // ── Expert ──
    {
        id: 16,
        type: "multiple-choice",
        category: "Vocabulary",
        difficulty: "Expert",
        question: '"The politician\'s _____ remarks alienated even her closest allies."',
        options: ["Eloquent", "Incendiary", "Mundane", "Benevolent"],
        correctAnswer: "Incendiary",
        explanation: "'Incendiary' means inflammatory or provocative — fitting for remarks that alienate allies.",
    },
    {
        id: 17,
        type: "fill-blank",
        category: "Grammar",
        difficulty: "Expert",
        question: '"Not only _____ the exam, but she also received the highest score in her class."',
        correctAnswer: "did she pass",
        blanks: ["did she pass", "she passed", "she did pass"],
        explanation: "'Not only' at the start of a sentence triggers subject-auxiliary inversion.",
    },
    {
        id: 18,
        type: "audio",
        category: "Listening",
        difficulty: "Expert",
        question: "Listen carefully and determine the logical flaw in the argument:",
        audioText: "Every successful entrepreneur I've met wakes up before five AM. Therefore, waking up early is the key to entrepreneurial success. If you want to build a great company, you must adopt this habit immediately.",
        options: [
            "Appeal to authority",
            "Correlation mistaken for causation",
            "Straw man argument",
            "Ad hominem attack",
        ],
        correctAnswer: "Correlation mistaken for causation",
        explanation: "The speaker assumes that because successful entrepreneurs wake up early, early rising causes success — a classic correlation/causation fallacy.",
    },
    {
        id: 19,
        type: "multiple-choice",
        category: "Reading",
        difficulty: "Expert",
        question: '"In the context of postcolonial literature, the concept of \'hybridity\' primarily refers to:"',
        options: [
            "The blending of genetic traits in organisms",
            "The mixing of cultural identities and practices",
            "The combination of different literary genres",
            "The merging of historical timelines in narratives",
        ],
        correctAnswer: "The mixing of cultural identities and practices",
        explanation: "In postcolonial theory, 'hybridity' (Homi Bhabha) refers to the creation of new cultural forms through the mixing of colonizer and colonized cultures.",
    },
    {
        id: 20,
        type: "fill-blank",
        category: "Vocabulary",
        difficulty: "Expert",
        question: '"The philosopher\'s _____ argument left even seasoned academics struggling to find counterpoints."',
        correctAnswer: "cogent",
        blanks: ["cogent", "specious", "tepid"],
        explanation: "'Cogent' means clear, logical, and convincing — appropriate for an argument that is hard to counter.",
    },
];

const difficultyColor: Record<string, string> = {
    Beginner: "text-glow-cyan",
    Intermediate: "text-glow-blue",
    Advanced: "text-glow-violet",
    Expert: "text-glow-violet",
};

const levelLabels: Record<string, string> = {
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
    expert: "Expert",
};

const PracticeTest = () => {
    const navigate = useNavigate();
    const { level } = useParams<{ level: string }>();

    const levelLabel = level ? levelLabels[level] || "Beginner" : "Beginner";
    const questions = allQuestions.filter((q) => q.difficulty === levelLabel);

    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [showResult, setShowResult] = useState<Record<number, boolean>>({});
    const [fillInput, setFillInput] = useState("");
    const [isPlaying, setIsPlaying] = useState(false);
    const [timeLeft, setTimeLeft] = useState(900); // 15 minutes timer
    const synthRef = useRef(window.speechSynthesis);

    // Timer logic
    useEffect(() => {
        if (timeLeft <= 0) return;
        const timerId = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timerId);
    }, [timeLeft]);

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    const q = questions[currentIdx];
    const totalAnswered = Object.keys(answers).length;
    const correctCount = Object.entries(answers).filter(
        ([id, ans]) => questions.find((qq) => qq.id === Number(id))?.correctAnswer === ans
    ).length;

    const submitAnswer = useCallback(
        (ans: string) => {
            if (!q || showResult[q.id]) return;
            setAnswers((prev) => ({ ...prev, [q.id]: ans }));
            setShowResult((prev) => ({ ...prev, [q.id]: true }));
        },
        [q, showResult]
    );

    const playAudio = useCallback(() => {
        if (!q?.audioText) return;
        synthRef.current.cancel();
        const u = new SpeechSynthesisUtterance(q.audioText);
        u.rate = 0.9;
        u.onend = () => setIsPlaying(false);
        setIsPlaying(true);
        synthRef.current.speak(u);
    }, [q]);

    const goNext = () => {
        if (currentIdx < questions.length - 1) {
            setCurrentIdx((p) => p + 1);
            setFillInput("");
        }
    };
    const goPrev = () => {
        if (currentIdx > 0) {
            setCurrentIdx((p) => p - 1);
            setFillInput("");
        }
    };

    if (!q) {
        return (
            <div className="min-h-screen animated-bg flex items-center justify-center text-foreground">
                <div className="glass rounded-2xl p-10 text-center glow-border-cyan">
                    <h2 className="font-display text-2xl font-bold mb-3">No questions available</h2>
                    <p className="text-muted-foreground mb-6">No tasks found for this level.</p>
                    <button onClick={() => navigate("/task")} className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const isCorrect = answers[q.id] === q.correctAnswer;
    const answered = showResult[q.id];

    return (
        <div className="min-h-screen animated-bg relative text-foreground">
            {/* Orbs */}
            <div className="orb orb-cyan w-[350px] h-[350px] -top-20 right-20 float" />
            <div className="orb orb-violet w-[250px] h-[250px] bottom-40 -left-10 float-delayed" />

            {/* Header */}
            <header className="glass-strong sticky top-0 z-50 border-b border-border/50">
                <div className="container mx-auto flex items-center justify-between px-6 py-4">
                    <button
                        onClick={() => navigate("/task")}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </button>
                    <div className="flex items-center gap-4">
                        <div className={`glass rounded-full px-4 py-1.5 ${difficultyColor[levelLabel]} font-medium shadow-[0_0_15px_rgba(139,92,246,0.15)]`}>
                            <span className="text-xs font-semibold">{levelLabel}</span>
                        </div>
                        <div className="flex items-center gap-2 glass rounded-full px-4 py-1.5 shadow-[0_0_15px_rgba(139,92,246,0.15)]">
                            <Clock className={`h-4 w-4 ${timeLeft < 60 ? "text-red-500 animate-pulse" : "text-violet-400"}`} />
                            <span className={`text-sm font-semibold ${timeLeft < 60 ? "text-red-500" : "text-violet-300"}`}>
                                {formatTime(timeLeft)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 glass rounded-full px-4 py-1.5 shadow-[0_0_15px_rgba(139,92,246,0.15)]">
                            <span className="text-sm font-bold text-violet-300">
                                {currentIdx + 1} / {questions.length}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 glass rounded-full px-3 py-1.5">
                            <Trophy className="h-3.5 w-3.5 text-primary" />
                            <span className="text-xs font-medium text-primary">
                                {correctCount} correct
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-10 max-w-3xl relative z-10">
                {/* Progress bar */}
                <div className="mb-8">
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-glow-cyan to-glow-violet transition-all duration-500"
                            style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Question card */}
                <div className="glass rounded-2xl p-8 glow-border-cyan liquid-hover animate-fade-in" key={q.id}>
                    {/* Meta */}
                    <div className="flex items-center gap-3 mb-6">
                        <span className="glass rounded-full px-3 py-1 text-xs font-medium text-foreground">
                            {q.category}
                        </span>
                        <span className={`text-xs font-medium ${difficultyColor[q.difficulty]}`}>
                            {q.difficulty}
                        </span>
                        <span className="text-xs text-muted-foreground capitalize ml-auto">
                            {q.type.replace("-", " ")}
                        </span>
                    </div>

                    {/* Question text */}
                    <h2 className="font-display text-xl md:text-2xl font-semibold mb-8 leading-relaxed">
                        {q.question}
                    </h2>

                    {/* Image Description */}
                    {q.type === "image-description" && q.imageUrl && (
                        <div className="mb-8 rounded-xl overflow-hidden border border-border/50 glass">
                            <img src={q.imageUrl} alt="Question" className="w-full h-auto object-cover max-h-[300px]" />
                        </div>
                    )}

                    {/* Audio player */}
                    {q.type === "audio" && (
                        <div className="flex items-center gap-4 mb-8">
                            <button
                                onClick={playAudio}
                                disabled={isPlaying}
                                className="flex items-center gap-2 glass glow-border-blue rounded-xl px-6 py-3.5 font-semibold transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] bg-blue-500/10 text-blue-300"
                            >
                                <Volume2 className={`h-5 w-5 ${isPlaying ? "animate-pulse" : ""}`} />
                                {isPlaying ? "Playing…" : "Play Audio"}
                            </button>
                            {isPlaying && (
                                <div className="flex gap-1 items-end h-6">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div
                                            key={i}
                                            className="w-1.5 bg-blue-400 rounded-full animate-pulse waveform-bar"
                                            style={{
                                                height: `${12 + Math.random() * 12}px`,
                                                animationDelay: `${i * 0.1}s`,
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Multiple choice */}
                    {(q.type === "multiple-choice" || q.type === "audio") && q.options && (
                        <div className="space-y-3">
                            {q.options.map((opt) => {
                                const selected = answers[q.id] === opt;
                                const correct = opt === q.correctAnswer;
                                let style = "glass glow-border-cyan hover:scale-[1.01]";
                                if (answered && correct) style = "border border-primary bg-primary/10 glow-cyan";
                                else if (answered && selected && !correct) style = "border border-destructive bg-destructive/10";
                                else if (answered) style = "glass opacity-50";

                                return (
                                    <button
                                        key={opt}
                                        onClick={() => submitAnswer(opt)}
                                        disabled={answered}
                                        className={`w-full text-left rounded-xl px-5 py-4 text-sm font-medium transition-all duration-300 ${style} flex items-center justify-between`}
                                    >
                                        <span>{opt}</span>
                                        {answered && correct && <CheckCircle className="h-5 w-5 text-primary shrink-0" />}
                                        {answered && selected && !correct && <XCircle className="h-5 w-5 text-destructive shrink-0" />}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Fill in the blank / Type */}
                    {(q.type === "fill-blank" || q.type === "image-description") && (
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <input
                                    value={answered ? answers[q.id] : fillInput}
                                    onChange={(e) => setFillInput(e.target.value)}
                                    disabled={answered}
                                    placeholder="Type your answer here..."
                                    className="flex-1 rounded-xl bg-black/40 border border-violet-500/30 px-5 py-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all shadow-inner"
                                    onKeyDown={(e) => e.key === "Enter" && fillInput.trim() && submitAnswer(fillInput.trim().toLowerCase())}
                                />
                                {!answered && (
                                    <button
                                        onClick={() => fillInput.trim() && submitAnswer(fillInput.trim().toLowerCase())}
                                        className="rounded-xl bg-violet-600 hover:bg-violet-500 px-8 py-4 text-sm font-bold text-white transition-all shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] hover:-translate-y-1"
                                    >
                                        Submit
                                    </button>
                                )}
                            </div>
                            {q.blanks && !answered && (
                                <div className="flex flex-wrap gap-2 items-center mt-3">
                                    <span className="text-xs font-medium text-violet-300/70 mr-2 uppercase tracking-wider">Word Bank:</span>
                                    {q.blanks.map((b) => (
                                        <button
                                            key={b}
                                            onClick={() => setFillInput(b)}
                                            className="glass rounded-lg px-4 py-1.5 text-sm font-medium text-violet-200 hover:bg-violet-500/20 hover:text-white hover:border-violet-400/50 transition-all"
                                        >
                                            {b}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Result feedback */}
                    {answered && (
                        <div
                            className={`mt-6 rounded-xl p-4 ${isCorrect ? "bg-primary/5 border border-primary/20" : "bg-destructive/5 border border-destructive/20"
                                } animate-fade-in`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                {isCorrect ? (
                                    <CheckCircle className="h-4 w-4 text-primary" />
                                ) : (
                                    <XCircle className="h-4 w-4 text-destructive" />
                                )}
                                <span className={`text-sm font-semibold ${isCorrect ? "text-primary" : "text-destructive"}`}>
                                    {isCorrect ? "Correct!" : "Incorrect"}
                                </span>
                            </div>
                            {!isCorrect && (
                                <p className="text-sm text-muted-foreground mb-1">
                                    Correct answer: <span className="text-foreground font-medium">{q.correctAnswer}</span>
                                </p>
                            )}
                            <p className="text-sm text-muted-foreground">{q.explanation}</p>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8 relative z-10">
                    <button
                        onClick={goPrev}
                        disabled={currentIdx === 0}
                        className="flex items-center gap-2 border border-violet-500/20 bg-black/40 backdrop-blur-md rounded-xl px-6 py-3.5 text-sm font-semibold text-violet-300 transition-all hover:bg-violet-500/10 hover:border-violet-500/40 disabled:opacity-30 disabled:hover:bg-black/40 disabled:hover:border-violet-500/20"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Previous
                    </button>

                    {/* Dot indicators */}
                    <div className="hidden sm:flex gap-2">
                        {questions.map((_, i) => {
                            const done = showResult[questions[i].id];
                            const isActive = i === currentIdx;
                            return (
                                <button
                                    key={i}
                                    onClick={() => { setCurrentIdx(i); setFillInput(""); }}
                                    className={`h-2.5 rounded-full transition-all duration-300 ${isActive
                                        ? "w-8 bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.6)]"
                                        : done
                                            ? answers[questions[i].id] === questions[i].correctAnswer
                                                ? "w-2.5 bg-green-500/80 shadow-[0_0_8px_rgba(34,197,94,0.4)]"
                                                : "w-2.5 bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                                            : "w-2.5 bg-white/10 hover:bg-white/20"
                                        }`}
                                />
                            );
                        })}
                    </div>

                    <button
                        onClick={goNext}
                        disabled={currentIdx === questions.length - 1}
                        className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl px-6 py-3.5 text-sm font-bold transition-all shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] hover:-translate-y-1 disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                    >
                        Next
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </div>

                {/* Score summary when all done */}
                {totalAnswered === questions.length && (
                    <div className="mt-10 glass rounded-2xl p-8 glow-border-violet text-center animate-fade-in">
                        {(() => {
                           const user = useStore.getState().user;
                           // Award 10 XP per correct answer
                           const xpAwarded = correctCount * 10;
                           if (user?.id) {
                               // XP update logic removed
                           }
                           return null;
                        })()}
                        <Zap className="h-10 w-10 text-primary mx-auto mb-4" />
                        <h3 className="font-display text-2xl font-bold mb-2">Test Complete!</h3>
                        <p className="text-4xl font-display font-bold text-glow mb-2">
                            {correctCount} / {questions.length}
                        </p>
                        <p className="text-muted-foreground mb-6">
                            {correctCount >= Math.ceil(questions.length * 0.8) ? "Excellent work!" : correctCount >= Math.ceil(questions.length * 0.5) ? "Good effort, keep practicing!" : "Keep going — practice makes perfect!"}
                        </p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => {
                                    setAnswers({});
                                    setShowResult({});
                                    setCurrentIdx(0);
                                    setFillInput("");
                                }}
                                className="flex items-center gap-2 glass glow-border-cyan rounded-xl px-5 py-3 text-sm font-medium transition-all hover:scale-105"
                            >
                                <RotateCcw className="h-4 w-4" />
                                Retry
                            </button>
                            <button
                                onClick={() => navigate("/task")}
                                className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-all hover:shadow-[0_0_20px_hsla(185,100%,50%,0.3)] hover:scale-105"
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default PracticeTest;
