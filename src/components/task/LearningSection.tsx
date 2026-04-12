import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Headphones, Mic, PenTool } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LearningSection = () => {
    const navigate = useNavigate();
    const [grammarProgress, setGrammarProgress] = useState({ completed: 0, percentage: 0 });
    const [readingProgress, setReadingProgress] = useState({ completed: 0, percentage: 0 });
    const [writingProgress, setWritingProgress] = useState({ completed: 0, percentage: 0 });
    const [speakingProgress, setSpeakingProgress] = useState({ completed: 0, percentage: 0 });
    const [expandedGuide, setExpandedGuide] = useState<string | null>(null);

    useEffect(() => {
        const gSaved = JSON.parse(localStorage.getItem("grammar_progress") || '{"completed": 0}');
        const gTotal = 57;
        setGrammarProgress({
            completed: gSaved.completed,
            percentage: Math.round((gSaved.completed / gTotal) * 100),
        });

        const rSaved = parseInt(localStorage.getItem("reading_progress_count") || "0");
        const rTotal = 50;
        setReadingProgress({
            completed: rSaved,
            percentage: Math.round((rSaved / rTotal) * 100),
        });

        const wSaved = parseInt(localStorage.getItem("writing_progress_count") || "0");
        const wTotal = 50;
        setWritingProgress({
            completed: wSaved,
            percentage: Math.round((wSaved / wTotal) * 100),
        });

        const sSaved = parseInt(localStorage.getItem("speaking_progress_count") || "0");
        const sTotal = 60;
        setSpeakingProgress({
            completed: sSaved,
            percentage: Math.round((sSaved / sTotal) * 100),
        });
    }, []);

    const sections = [
        {
            icon: BookOpen,
            title: "Grammar",
            description: "Master grammar rules and sentence structures with guided exercises.",
            color: "#22d3ee",
            totalTasks: 57,
            completedTasks: grammarProgress.completed,
            progress: grammarProgress.percentage,
            path: "/task/grammar",
            guide: [
                "Focus on tenses because past, present, and future forms are tested often.",
                "Review subject-verb agreement to remove common sentence errors.",
                "Practice adjectives, prepositions, and modal verbs every day.",
            ],
        },
        {
            icon: PenTool,
            title: "Writing",
            description: "Build clearer structure and stronger responses with AI feedback.",
            color: "#38bdf8",
            totalTasks: 50,
            completedTasks: writingProgress.completed,
            progress: writingProgress.percentage,
            path: "/task/writing",
            guide: [
                "Use a clear introduction, body, and conclusion in every response.",
                "Aim for the target length and keep the answer focused on the prompt.",
                "Use linking phrases such as however, therefore, and in addition.",
            ],
        },
        {
            icon: BookOpen,
            title: "Reading",
            description: "Build comprehension with passage analysis and interactive questions.",
            color: "#67e8f9",
            totalTasks: 50,
            completedTasks: readingProgress.completed,
            progress: readingProgress.percentage,
            path: "/task/reading",
            guide: [
                "Read the questions first so you know what information to look for.",
                "Underline key words in the passage while you answer.",
                "Eliminate obviously wrong answers before choosing the final option.",
            ],
        },
        {
            icon: Headphones,
            title: "Listening",
            description: "Sharpen comprehension with audio tasks and focused listening drills.",
            color: "#22d3ee",
            totalTasks: 32,
            completedTasks: 12,
            progress: 40,
            path: "/task/listening",
            guide: [
                "Identify the main idea first, then listen again for specific details.",
                "Notice tone and emotion because they often change the meaning.",
                "Practice with different accents to improve flexibility.",
            ],
        },
        {
            icon: Mic,
            title: "Speaking",
            description: "Practice fluency and pronunciation with guided speaking tasks.",
            color: "#7dd3fc",
            totalTasks: 60,
            completedTasks: speakingProgress.completed,
            progress: speakingProgress.percentage,
            path: "/task/speaking",
            guide: [
                "Use the short prep time to map out two or three key points.",
                "Speak clearly at a steady pace instead of rushing.",
                "Use connectors such as firstly, moreover, and in conclusion.",
            ],
        },
    ];

    return (
        <section className="app-surface px-5 py-6 sm:px-6">
            <motion.div
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
            >
                <span className="app-kicker">Skill modules</span>
                <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">Choose one module and stay focused</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-300/76">
                    Pick the skill that needs attention today, review the short guide if needed, and continue directly into practice.
                </p>
            </motion.div>

            <div className="mt-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
                {sections.map((section, index) => (
                    <motion.div
                        key={section.title}
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.35, delay: index * 0.05 }}
                        className="app-surface-soft flex h-full flex-col p-4"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div
                                className="flex h-10 w-10 items-center justify-center rounded-2xl border"
                                style={{ background: `${section.color}18`, borderColor: `${section.color}33` }}
                            >
                                <section.icon className="h-5 w-5" style={{ color: section.color }} />
                            </div>

                            <button
                                type="button"
                                onClick={() => setExpandedGuide(expandedGuide === section.title ? null : section.title)}
                                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-300 transition hover:bg-white/10"
                            >
                                {expandedGuide === section.title ? "Hide guide" : "Show guide"}
                            </button>
                        </div>

                        <h3 className="mt-4 text-lg font-semibold text-white">{section.title}</h3>
                        <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-300/72">{section.description}</p>

                        {expandedGuide === section.title ? (
                            <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3.5">
                                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Guide notes</p>
                                <div className="mt-2.5 space-y-2">
                                    {section.guide.map((tip) => (
                                        <p key={tip} className="text-xs leading-relaxed text-slate-300/74">
                                            {tip}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        ) : null}

                        <div className="mt-3.5">
                            <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                                <span>{section.completedTasks}/{section.totalTasks} completed</span>
                                <span>{section.progress}%</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-white/10">
                                <div
                                    className="h-full rounded-full transition-all duration-700"
                                    style={{
                                        width: `${section.progress}%`,
                                        background: `linear-gradient(90deg, ${section.color}, ${section.color}cc)`,
                                    }}
                                />
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => navigate(section.path)}
                            className="brand-button-secondary mt-4 w-full justify-between"
                        >
                            Start module
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default LearningSection;
