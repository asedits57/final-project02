import { useState, useEffect } from "react";
import { Mic, Headphones, BookOpen, PenTool, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const LearningSection = () => {
    const navigate = useNavigate();
    const [grammarProgress, setGrammarProgress] = useState({ completed: 0, percentage: 0 });
    const [readingProgress, setReadingProgress] = useState({ completed: 0, percentage: 0 });
    const [writingProgress, setWritingProgress] = useState({ completed: 0, percentage: 0 });
    const [speakingProgress, setSpeakingProgress] = useState({ completed: 0, percentage: 0 });

    useEffect(() => {
        // Load grammar progress
        const gSaved = JSON.parse(localStorage.getItem("grammar_progress") || '{"completed": 0}');
        const gTotal = 57;
        const gPercent = Math.round((gSaved.completed / gTotal) * 100);
        setGrammarProgress({ completed: gSaved.completed, percentage: gPercent });

        // Load reading progress
        const rSaved = parseInt(localStorage.getItem("reading_progress_count") || "0");
        const rTotal = 50;
        const rPercent = Math.round((rSaved / rTotal) * 100);
        setReadingProgress({ completed: rSaved, percentage: rPercent });

        // Load writing progress
        const wSaved = parseInt(localStorage.getItem("writing_progress_count") || "0");
        const wTotal = 50;
        const wPercent = Math.round((wSaved / wTotal) * 100);
        setWritingProgress({ completed: wSaved, percentage: wPercent });

        // Load speaking progress
        const sSaved = parseInt(localStorage.getItem("speaking_progress_count") || "0");
        const sTotal = 60;
        const sPercent = Math.round((sSaved / sTotal) * 100);
        setSpeakingProgress({ completed: sSaved, percentage: sPercent });
    }, []);

    const [expandedGuide, setExpandedGuide] = useState<string | null>(null);

    const sections = [
        {
            icon: BookOpen,
            title: "Grammar",
            description: "Master grammar rules and sentence structures with interactive exercises",
            color: "#7f5af0",
            totalTasks: 57,
            completedTasks: grammarProgress.completed,
            progress: grammarProgress.percentage,
            path: "/task/grammar",
            glow: "hsla(262, 83%, 58%, 0.4)",
            guide: [
                "📌 Focus on tenses — past, present, and future are frequently tested.",
                "📌 Learn subject-verb agreement to avoid common errors.",
                "📌 Practice identifying adjectives, prepositions, and modal verbs daily.",
            ],
        },
        {
            icon: PenTool,
            title: "Writing",
            description: "Get AI feedback on essays and writing responses",
            color: "#8b5cf6",
            totalTasks: 50,
            completedTasks: writingProgress.completed,
            progress: writingProgress.percentage,
            path: "/task/writing",
            glow: "hsla(262, 83%, 58%, 0.4)",
            guide: [
                "📌 Always write an introduction, body, and conclusion.",
                "📌 Aim for 100–150 words and stay within the word limit.",
                "📌 Use linking words like 'however', 'therefore', and 'in addition'.",
            ],
        },
        {
            icon: BookOpen,
            title: "Reading",
            description: "Build comprehension with passage exercises and interactive MCQs",
            color: "#7f5af0",
            totalTasks: 50,
            completedTasks: readingProgress.completed,
            progress: readingProgress.percentage,
            path: "/task/reading",
            glow: "hsla(262, 83%, 58%, 0.4)",
            guide: [
                "📌 Read the questions before reading the passage to know what to look for.",
                "📌 Underline key words in the passage when answering questions.",
                "📌 Eliminate obviously wrong answers first to narrow your choices.",
            ],
        },
        {
            icon: Headphones,
            title: "Listening",
            description: "Sharpen comprehension with diverse audio exercises and waveform analysis",
            color: "#8b5cf6",
            totalTasks: 32,
            completedTasks: 12,
            progress: 40,
            path: "/task/listening",
            glow: "hsla(262, 83%, 58%, 0.4)",
            guide: [
                "📌 Focus on the main idea first, then listen for specific details.",
                "📌 Pay attention to tone and emotion — they convey meaning.",
                "📌 Practice with varied accents to improve adaptability.",
            ],
        },
        {
            icon: Mic,
            title: "Speaking",
            description: "Practice pronunciation and fluency with AI-powered voice analysis",
            color: "#a78bfa",
            totalTasks: 60,
            completedTasks: speakingProgress.completed,
            progress: speakingProgress.percentage,
            path: "/task/speaking",
            glow: "hsla(262, 83%, 58%, 0.4)",
            guide: [
                "📌 Use the 10-second prep time to plan 2–3 key points.",
                "📌 Speak clearly and at a steady pace — avoid rushing.",
                "📌 Use connectors like 'firstly', 'moreover', and 'in conclusion'.",
            ],
        },
    ];


interface CircularProgressProps {
    value: number;
    color: string;
    size?: number;
}

const CircularProgress = ({ value, color, size = 56 }: CircularProgressProps) => {
    const radius = (size - 8) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    return (
        <svg width={size} height={size} className="-rotate-90">
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                strokeWidth="4"
                className="circular-progress-track"
            />
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                strokeWidth="4"
                stroke={color}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{
                    filter: `drop-shadow(0 0 6px ${color})`,
                    transition: "stroke-dashoffset 1.5s ease",
                }}
            />
            <text
                x={size / 2}
                y={size / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                className="rotate-90"
                style={{
                    fill: color,
                    fontSize: "11px",
                    fontWeight: "700",
                    fontFamily: "Poppins, sans-serif",
                    transformOrigin: "center",
                }}
                transform={`rotate(90 ${size / 2} ${size / 2})`}
            >
                {value}%
            </text>
        </svg>
    );
};



    return (
        <section className="py-8 relative w-full">
            <div className="w-full px-6 md:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="mb-10"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div
                            className="h-1 w-8 rounded-full"
                            style={{ background: "linear-gradient(90deg, #7f5af0, #8b5cf6)" }}
                        />
                        <span className="text-xs font-semibold text-violet-400 uppercase tracking-widest font-poppins">Skill Modules</span>
                    </div>
                    <h2 className="font-poppins text-3xl font-bold mb-2">Learning Sections</h2>
                    <p className="text-muted-foreground text-sm">Choose a skill to practice and improve your score</p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {sections.map((section, i) => (
                        <motion.div
                            key={section.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="relative rounded-2xl p-6 group overflow-hidden transition-all duration-400"
                            style={{
                                background: "hsla(270, 20%, 8%, 0.7)",
                                backdropFilter: "blur(20px)",
                                border: "1px solid hsla(270, 60%, 60%, 0.12)",
                            }}
                            whileHover={{
                                borderColor: section.color + "55",
                                boxShadow: `0 0 30px ${section.glow}`,
                                backgroundColor: "hsla(270, 20%, 10%, 0.8)",
                            }}
                        >
                            {/* Hover shimmer overlay */}
                            <div
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                                style={{
                                    background: `radial-gradient(circle at 50% 0%, ${section.color}15, transparent 70%)`,
                                }}
                            />

                            {/* Icon + Guide Toggle */}
                            <div className="flex items-start justify-between mb-4 relative z-10">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                                    style={{ background: `${section.color}18` }}
                                >
                                    <section.icon className="w-6 h-6" style={{ color: section.color }} />
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setExpandedGuide(expandedGuide === section.title ? null : section.title);
                                    }}
                                    className="text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-all duration-200 border font-poppins"
                                    style={{
                                        background: expandedGuide === section.title ? `${section.color}25` : "hsla(270, 20%, 12%, 0.6)",
                                        border: `1px solid ${expandedGuide === section.title ? section.color + "60" : "hsla(270, 30%, 25%, 0.4)"}`,
                                        color: expandedGuide === section.title ? section.color : "hsl(270, 10%, 65%)",
                                    }}
                                >
                                    {expandedGuide === section.title ? "✕ Guide" : "📖 Guide"}
                                </button>
                            </div>

                            {/* Content */}
                            <h3 className="font-poppins text-lg font-bold mb-2 relative z-10">{section.title}</h3>
                            <p className="text-xs text-muted-foreground mb-4 leading-relaxed relative z-10 flex-1">
                                {section.description}
                            </p>

                            {/* Learning Guide Panel */}
                            {expandedGuide === section.title && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mb-4 rounded-xl p-3 relative z-10"
                                    style={{
                                        background: `${section.color}0d`,
                                        border: `1px solid ${section.color}30`,
                                    }}
                                >
                                    <div className="text-[10px] font-bold uppercase tracking-widest mb-2 font-poppins" style={{ color: section.color }}>
                                        💡 Learning Tips
                                    </div>
                                    <ul className="space-y-1.5">
                                        {section.guide.map((tip, idx) => (
                                            <li key={idx} className="text-[11px] text-muted-foreground font-poppins leading-snug">
                                                {tip}
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>
                            )}

                            {/* Progress bar inside the card */}
                            <div className="mb-4 relative z-10">
                                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                    <span>{section.completedTasks}/{section.totalTasks} completed</span>
                                    <span>{section.progress}%</span>
                                </div>
                                <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-1000"
                                        style={{
                                            width: `${section.progress}%`,
                                            background: `linear-gradient(90deg, ${section.color}, ${section.color}aa)`,
                                            boxShadow: `0 0 10px ${section.color}88`,
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Start Learning Button */}
                            <div className="mt-auto pt-2 relative z-10">
                                <button
                                    onClick={() => navigate(section.path)}
                                    className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 group-hover:bg-violet-600/20 group-hover:text-violet-300 border border-transparent group-hover:border-violet-500/30 group-hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] bg-white/5 text-white/80"
                                >
                                    Start Learning
                                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default LearningSection;
