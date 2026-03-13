import { Mic, Headphones, BookOpen, PenTool, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const sections = [
    {
        icon: BookOpen,
        title: "Grammar",
        description: "Master grammar rules and sentence structures with interactive exercises",
        color: "#7f5af0",
        tasks: 45,
        progress: 80,
        path: "/task/grammar",
        glow: "hsla(262, 83%, 58%, 0.4)",
    },
    {
        icon: PenTool,
        title: "Writing",
        description: "Get AI feedback on essays and writing responses",
        color: "#8b5cf6",
        tasks: 50,
        progress: 60,
        path: "/task/writing",
        glow: "hsla(262, 83%, 58%, 0.4)",
    },
    {
        icon: BookOpen,
        title: "Reading",
        description: "Build comprehension with passage exercises and fill-in-the-blank tasks",
        color: "#7f5af0",
        tasks: 28,
        progress: 65,
        path: "/task/reading",
        glow: "hsla(262, 83%, 58%, 0.4)",
    },
    {
        icon: Headphones,
        title: "Listening",
        description: "Sharpen comprehension with diverse audio exercises and waveform analysis",
        color: "#8b5cf6",
        tasks: 32,
        progress: 40,
        path: "/task/listening",
        glow: "hsla(262, 83%, 58%, 0.4)",
    },
    {
        icon: Mic,
        title: "Speaking",
        description: "Practice pronunciation and fluency with AI-powered voice analysis",
        color: "#a78bfa",
        tasks: 24,
        progress: 55,
        path: "/task/speaking",
        glow: "hsla(262, 83%, 58%, 0.4)",
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

const LearningSection = () => {
    const navigate = useNavigate();

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
                            onClick={() => navigate(section.path)}
                            className="relative rounded-2xl p-6 cursor-pointer group overflow-hidden transition-all duration-400"
                            style={{
                                background: "hsla(270, 20%, 8%, 0.7)",
                                backdropFilter: "blur(20px)",
                                border: "1px solid hsla(270, 60%, 60%, 0.12)",
                            }}
                            whileHover={{
                                scale: 1.03,
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

                            {/* Icon */}
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 relative z-10"
                                style={{ background: `${section.color}18` }}
                            >
                                <section.icon className="w-6 h-6" style={{ color: section.color }} />
                            </div>

                            {/* Content */}
                            <h3 className="font-poppins text-lg font-bold mb-2 relative z-10">{section.title}</h3>
                            <p className="text-xs text-muted-foreground mb-5 leading-relaxed relative z-10 flex-1">
                                {section.description}
                            </p>

                            {/* Progress bar inside the card */}
                            <div className="mb-6 relative z-10">
                                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                    <span>{section.tasks} tasks completed</span>
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
                            <div className="mt-auto pt-4 relative z-10">
                                <button className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 group-hover:bg-violet-600/20 group-hover:text-violet-300 border border-transparent group-hover:border-violet-500/30 group-hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] bg-white/5 text-white/80">
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
