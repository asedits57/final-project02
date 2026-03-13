import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Play, Pause, RotateCcw, Send, Volume2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const WAVEFORM_BARS = 32;

const exercises = [
    {
        id: 1,
        title: "Extended Listening Passage – Technology in the Modern World",
        description: "Listen to the extended passage about technology and answer the multiple-choice questions.",
        text: "In the modern world, technology has become an essential part of our daily lives. From the moment we wake up in the morning until we go to sleep at night, we are surrounded by digital devices. Many people begin their day by checking their mobile phones to read messages, respond to emails, scroll through social media, or catch up on the latest news. Smart alarms, fitness trackers, and digital assistants have changed the way we organize our routines and manage our time. In the field of education, technology has completely transformed the learning experience. Students now use online platforms to attend virtual classes, submit assignments, watch educational videos, and communicate with teachers. Digital libraries give learners access to thousands of books and research materials within seconds. This has made education more flexible and accessible, especially for students living in remote areas. However, online learning also requires self-discipline, strong internet connectivity, and technical knowledge, which not everyone may have. One major advantage of technology is improved communication. In the past, people had to wait many days or even weeks to receive a letter from someone living far away. Today, we can send messages instantly through messaging applications and participate in video calls in real time. Families who live in different cities or countries can see and speak to each other face-to-face through screens. Businesses can conduct international meetings without the need for travel. As a result, the world feels smaller and more connected than ever before. Technology has also contributed significantly to the healthcare sector. Doctors use advanced machines to detect diseases early and provide better treatment. Online consultations allow patients to speak with medical professionals without visiting hospitals physically. Health apps help individuals monitor their heart rate, sleep patterns, and physical activity. These innovations have improved life expectancy and overall well-being in many countries. Despite its many benefits, technology also has disadvantages. Many people spend excessive amounts of time on their phones, computers, and televisions. Too much screen time can negatively affect physical health by causing eye strain, headaches, poor posture, lack of exercise, and sleep problems. Mental health can also be influenced, as constant exposure to social media may create pressure and unrealistic expectations. Young people, in particular, may compare their lives to carefully edited images online and feel stressed, anxious, or dissatisfied. Another serious concern is privacy and data security. When individuals share personal information online, it can sometimes be misused. Companies collect user data to understand consumer behavior, and cybercriminals may attempt to steal sensitive information such as passwords, banking details, or identity documents. Therefore, it is extremely important to create strong passwords, enable security features, avoid suspicious links, and think carefully before posting private details on the internet. Technology also impacts employment and the economy. Automation and artificial intelligence are changing the nature of work. Some traditional jobs are disappearing, while new careers in digital marketing, software development, and data analysis are growing rapidly. Workers must continuously update their skills to remain competitive in the job market. Lifelong learning has become more important than ever. Environmental impact is another topic related to technology. The production of electronic devices requires natural resources, and electronic waste can harm the environment if not recycled properly. At the same time, technology also provides solutions for environmental problems, such as renewable energy systems, smart transportation, and digital systems that reduce paper usage. In conclusion, technology is neither completely good nor completely bad. Its impact depends largely on how individuals and societies choose to use it. When used wisely and responsibly, technology can improve education, healthcare, communication, and productivity. However, when used without limits or awareness, it may create physical, emotional, social, and security problems. Finding a healthy balance between the digital world and real life is the key to living a successful and meaningful life in the modern digital age.",
        duration: 180,
        mcqs: [
            // Part A: Listening Comprehension
            {
                id: 1,
                part: "Part A: Listening Comprehension (MCQ)",
                question: "What is the main idea of the passage?",
                options: [
                    "A) Technology is dangerous",
                    "B) Technology affects daily life in many ways",
                    "C) Only students use technology",
                    "D) Technology should be stopped"
                ],
                correctAnswer: 1 // index 1 is B
            },
            {
                id: 2,
                part: "Part A: Listening Comprehension (MCQ)",
                question: "What is one advantage of technology mentioned in the passage?",
                options: [
                    "A) It reduces homework",
                    "B) It improves communication",
                    "C) It removes schools",
                    "D) It increases travel time"
                ],
                correctAnswer: 1 // index 1 is B
            },
            {
                id: 3,
                part: "Part A: Listening Comprehension (MCQ)",
                question: "Why do families feel more connected today?",
                options: [
                    "A) Because they travel more",
                    "B) Because they write letters",
                    "C) Because they can video call instantly",
                    "D) Because they live together"
                ],
                correctAnswer: 2 // index 2 is C
            },
            {
                id: 4,
                part: "Part A: Listening Comprehension (MCQ)",
                question: "What health problem is caused by excessive screen time?",
                options: [
                    "A) Strong muscles",
                    "B) Better eyesight",
                    "C) Eye strain",
                    "D) Faster growth"
                ],
                correctAnswer: 2 // index 2 is C
            },
            {
                id: 5,
                part: "Part A: Listening Comprehension (MCQ)",
                question: "What is the key message of the passage?",
                options: [
                    "A) Avoid all technology",
                    "B) Use technology without limits",
                    "C) Use technology responsibly and find balance",
                    "D) Only adults should use technology"
                ],
                correctAnswer: 2 // index 2 is C
            },
            // Part B: Grammar MCQs
            {
                id: 6,
                part: "Part B: Grammar MCQs",
                question: "Technology _____ changed the way people communicate.",
                options: ["A) have", "B) has", "C) had", "D) having"],
                correctAnswer: 1 // index 1 is B
            },
            {
                id: 7,
                part: "Part B: Grammar MCQs",
                question: "Many students _____ online classes every day.",
                options: ["A) attends", "B) attend", "C) attending", "D) attended"],
                correctAnswer: 1 // index 1 is B
            },
            {
                id: 8,
                part: "Part B: Grammar MCQs",
                question: "If people use technology wisely, it _____ help them succeed.",
                options: ["A) can", "B) should", "C) must", "D) has"],
                correctAnswer: 0 // index 0 is A
            },
            {
                id: 9,
                part: "Part B: Grammar MCQs",
                question: "Excessive use of phones can lead _____ health problems.",
                options: ["A) for", "B) in", "C) to", "D) with"],
                correctAnswer: 2 // index 2 is C
            },
            {
                id: 10,
                part: "Part B: Grammar MCQs",
                question: "It is important _____ personal information safe.",
                options: ["A) keep", "B) to keep", "C) keeping", "D) kept"],
                correctAnswer: 1 // index 1 is B
            },
            {
                id: 11,
                part: "Part B: Grammar MCQs",
                question: "Companies collect data about _____ customers.",
                options: ["A) they", "B) their", "C) them", "D) theirs"],
                correctAnswer: 1 // index 1 is B
            },
            {
                id: 12,
                part: "Part B: Grammar MCQs",
                question: "Social media can make people feel stressed _____ they compare themselves to others.",
                options: ["A) because", "B) but", "C) so", "D) although"],
                correctAnswer: 0 // index 0 is A
            },
            {
                id: 13,
                part: "Part B: Grammar MCQs",
                question: "Technology is useful, _____ it also has disadvantages.",
                options: ["A) and", "B) but", "C) so", "D) or"],
                correctAnswer: 1 // index 1 is B
            },
            {
                id: 14,
                part: "Part B: Grammar MCQs",
                question: "People should avoid _____ too much time online.",
                options: ["A) spend", "B) spent", "C) spending", "D) spends"],
                correctAnswer: 2 // index 2 is C
            },
            {
                id: 15,
                part: "Part B: Grammar MCQs",
                question: "The internet makes communication _____ than before.",
                options: ["A) easy", "B) easier", "C) easiest", "D) more easy"],
                correctAnswer: 1 // index 1 is B
            }
        ]
    }
];

const ListeningModule = () => {
    const navigate = useNavigate();
    const [currentIdx, setCurrentIdx] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
    const [submitted, setSubmitted] = useState(false);
    const [feedback, setFeedback] = useState<{ score: number; message: string } | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
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
