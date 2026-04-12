import { motion } from "framer-motion";
import { BookOpen, ArrowRight, Brain, Lightbulb, GraduationCap, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const resources = [
    {
        title: "Grammar Masterclass",
        description: "Study the foundational rules of English grammar with clear examples and expert tips.",
        icon: Brain,
        color: "hsl(270, 80%, 75%)",
        items: ["Parts of Speech", "Tense Usage", "Passive Voice", "Conditionals"]
    },
    {
        title: "Vocabulary Builder",
        description: "Expand your word bank with context-based learning and synonyms for academic excellence.",
        icon: Lightbulb,
        color: "hsl(230, 80%, 75%)",
        items: ["Academic Word List", "Phrasal Verbs", "Idioms & Phrases", "Collocations"]
    },
    {
        title: "Exam Strategies",
        description: "Learn how to approach different task types in the Duolingo English Test for maximum scores.",
        icon: GraduationCap,
        color: "hsl(140, 80%, 75%)",
        items: ["Reading Tips", "Listening Shortcuts", "Speaking Fluency", "Writing Structure"]
    },
    {
        title: "Daily Tips",
        description: "Quick 2-minute lessons to improve your English bit by bit every single day.",
        icon: Sparkles,
        color: "hsl(40, 90%, 70%)",
        items: ["Common Mistakes", "Pronunciation Hacks", "Spelling Rules", "Punctuation Guide"]
    }
];

const LearningPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen animated-bg relative overflow-hidden text-foreground">
            {/* Background Orbs */}
            <div className="orb orb-violet w-[500px] h-[500px] -top-48 -left-48 float opacity-20 pointer-events-none" />
            <div className="orb orb-blue w-[400px] h-[400px] top-1/2 -right-24 float opacity-15 pointer-events-none" />

            <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 py-12 sm:py-16 pb-10">
                {/* Header */}
                <motion.div
                    className="mb-12"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-violet-500/20 flex items-center justify-center border border-violet-500/30">
                            <BookOpen className="w-6 h-6 text-violet-400" />
                        </div>
                        <h1 className="font-display text-4xl font-bold glow-text">Learning Hub</h1>
                    </div>
                    <p className="text-muted-foreground text-base max-w-xl">
                        Master English with our curated study materials and AI-powered guides designed for success.
                    </p>
                </motion.div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {resources.map((resource, i) => (
                        <motion.div
                            key={resource.title}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, delay: i * 0.1 }}
                            className="glass-strong rounded-[2.5rem] p-8 glow-border-violet group hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div 
                                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-500 group-hover:rotate-6 shadow-lg"
                                    style={{ background: `linear-gradient(135deg, ${resource.color}22, ${resource.color}44)`, border: `1px solid ${resource.color}33` }}
                                >
                                    <resource.icon className="w-7 h-7" style={{ color: resource.color }} />
                                </div>
                                <div className="text-[10px] font-bold tracking-[0.2em] text-violet-400/50 uppercase font-poppins bg-white/5 px-3 py-1.5 rounded-full border border-white/5 group-hover:text-violet-300 transition-colors">
                                    Educational Content
                                </div>
                            </div>

                            <h3 className="text-2xl font-bold mb-3 font-poppins group-hover:text-violet-200 transition-colors">{resource.title}</h3>
                            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                                {resource.description}
                            </p>

                            <div className="grid grid-cols-2 gap-3 mb-8">
                                {resource.items.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-xs text-violet-200/60 font-poppins">
                                        <div className="w-1 h-1 rounded-full bg-violet-500" />
                                        {item}
                                    </div>
                                ))}
                            </div>

                            <button className="flex items-center gap-2 text-sm font-bold text-violet-400 group-hover:text-violet-200 transition-all border-b border-transparent group-hover:border-violet-400/50 pb-1">
                                Explore Guide <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </button>
                        </motion.div>
                    ))}
                </div>

                {/* Call to action */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-16 glass-strong rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 border border-white/10"
                >
                    <div className="text-center md:text-left">
                        <h2 className="text-2xl font-bold mb-2">Want personal tutoring?</h2>
                        <p className="text-muted-foreground text-sm">Our AI Tutor is available 24/7 to answer your grammar questions.</p>
                    </div>
                    <button 
                        onClick={() => navigate("/ai-tutor")}
                        className="px-8 py-4 rounded-2xl bg-violet-600 text-white font-bold shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:bg-violet-500 transition-all"
                    >
                        Chat with AI Tutor
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

export default LearningPage;
