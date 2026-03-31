import { ArrowRight, Sparkles, BookOpen, Headphones, Mic, PenTool, Zap, Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useStore } from "@/store/useStore";

const features = [
    { icon: BookOpen, label: "Reading", desc: "Passage comprehension & fill-in-the-blank", color: "#7f5af0" },
    { icon: Headphones, label: "Listening", desc: "Audio exercises with waveform visualization", color: "#8b5cf6" },
    { icon: Mic, label: "Speaking", desc: "AI pronunciation analysis & scoring", color: "#a78bfa" },
    { icon: PenTool, label: "Writing", desc: "AI feedback on essays & responses", color: "#7f5af0" },
];

const HeroSection = () => {
    const navigate = useNavigate();
    const user = useStore(s => s.user);
    const levelMap = ["beginner", "intermediate", "advanced", "expert"];
    const currentLevel = user?.level ? levelMap[user.level - 1] : "beginner";

    return (
        <section className="relative py-20 md:py-28 overflow-hidden">
            {/* Animated Background Particles */}
            {[...Array(6)].map((_, i) => (
                <div
                    key={i}
                    className="absolute rounded-full opacity-10 animate-particle pointer-events-none"
                    style={{
                        width: `${Math.random() * 6 + 4}px`,
                        height: `${Math.random() * 6 + 4}px`,
                        background: "hsl(270, 80%, 65%)",
                        left: `${10 + i * 15}%`,
                        animationDuration: `${8 + i * 3}s`,
                        animationDelay: `${i * 1.5}s`,
                    }}
                />
            ))}

            {/* Orbs */}
            <div className="orb orb-violet w-[500px] h-[500px] -top-32 -left-32 float opacity-20" />
            <div className="orb orb-cyan w-[300px] h-[300px] top-20 right-5 float-delayed opacity-10" />
            <div className="orb orb-violet w-[200px] h-[200px] bottom-10 left-1/2 float opacity-10" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-3xl mx-auto text-center">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 rounded-full px-5 py-2 mb-8 font-poppins"
                        style={{
                            background: "hsla(270, 80%, 55%, 0.12)",
                            border: "1px solid hsla(270, 80%, 55%, 0.35)",
                            boxShadow: "0 0 20px hsla(270, 80%, 55%, 0.15)",
                        }}
                    >
                        <Brain className="h-4 w-4 text-violet-400" />
                        <span className="text-xs font-semibold text-violet-300 tracking-wider uppercase">AI-Powered English Learning</span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="font-poppins text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 tracking-tight"
                    >
                        Master English with{" "}
                        <span
                            className="relative inline-block"
                            style={{
                                background: "linear-gradient(135deg, #a78bfa 0%, #7f5af0 50%, #8b5cf6 100%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                                filter: "drop-shadow(0 0 30px rgba(127, 90, 240, 0.5))",
                            }}
                        >
                            AI-Powered
                        </span>{" "}
                        Practice
                    </motion.h1>

                    {/* Subtext */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 font-poppins leading-relaxed"
                    >
                        Practice <span className="text-violet-400 font-medium">Reading</span>,{" "}
                        <span className="text-violet-400 font-medium">Writing</span>,{" "}
                        <span className="text-violet-400 font-medium">Listening</span>, and{" "}
                        <span className="text-violet-400 font-medium">Speaking</span> with real-time AI feedback and adaptive scoring.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        {/* Primary CTA - Glowing Violet */}
                        <button
                            onClick={() => {
                                document.getElementById("task-cards")?.scrollIntoView({ behavior: "smooth" });
                            }}
                            className="group relative flex items-center gap-3 rounded-2xl px-8 py-4 font-poppins font-semibold text-white text-base overflow-hidden transition-all duration-300 hover:scale-105"
                            style={{
                                background: "linear-gradient(135deg, #7f5af0, #8b5cf6)",
                                boxShadow: "0 0 30px hsla(262, 83%, 58%, 0.5), 0 4px 20px hsla(262, 83%, 58%, 0.3)",
                            }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                                    "0 0 50px hsla(262, 83%, 58%, 0.7), 0 8px 30px hsla(262, 83%, 58%, 0.4)";
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                                    "0 0 30px hsla(262, 83%, 58%, 0.5), 0 4px 20px hsla(262, 83%, 58%, 0.3)";
                            }}
                        >
                            {/* Ripple overlay */}
                            <span
                                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.08), transparent)" }}
                            />
                            <Zap className="h-5 w-5" />
                            Start Practice
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </button>

                        <button
                            onClick={() => navigate("/task/mock-test")}
                            className="group flex items-center gap-2 rounded-2xl px-8 py-4 font-poppins font-semibold text-violet-300 text-base transition-all duration-300 hover:scale-105"
                            style={{
                                background: "hsla(270, 80%, 55%, 0.08)",
                                border: "1px solid hsla(270, 80%, 55%, 0.3)",
                                boxShadow: "0 0 20px hsla(270, 80%, 55%, 0.08)",
                            }}
                        >
                            Take Mock Test
                        </button>
                    </motion.div>
                </div>

                {/* Stats Row */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.4 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-2xl mx-auto"
                >
                    {[
                        { value: "50K+", label: "Active Learners" },
                        { value: "95%", label: "Success Rate" },
                        { value: "150+", label: "Practice Tests" },
                        { value: "24/7", label: "AI Feedback" },
                    ].map((stat, i) => (
                        <div
                            key={stat.label}
                            className="relative rounded-2xl p-4 text-center liquid-hover transition-all duration-300 hover:scale-105"
                            style={{
                                background: "hsla(270, 20%, 10%, 0.6)",
                                backdropFilter: "blur(20px)",
                                border: "1px solid hsla(270, 60%, 60%, 0.15)",
                                boxShadow: "0 0 20px hsla(270, 80%, 55%, 0.06)",
                                animationDelay: `${i * 0.1}s`,
                            }}
                        >
                            <div
                                className="font-poppins text-2xl font-extrabold mb-1"
                                style={{
                                    background: "linear-gradient(135deg, #a78bfa, #7f5af0)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    backgroundClip: "text",
                                }}
                            >
                                {stat.value}
                            </div>
                            <div className="text-xs text-muted-foreground font-medium">{stat.label}</div>
                        </div>
                    ))}
                </motion.div>

                {/* Feature Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.5 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 max-w-3xl mx-auto"
                >
                    {features.map((f, i) => (
                        <div
                            key={f.label}
                            className="relative rounded-2xl p-5 group liquid-hover transition-all duration-300 hover:scale-105 cursor-pointer"
                            style={{
                                background: "hsla(270, 20%, 8%, 0.7)",
                                backdropFilter: "blur(20px)",
                                border: `1px solid hsla(270, 60%, 60%, 0.12)`,
                                animationDelay: `${i * 0.1}s`,
                            }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLDivElement).style.border = `1px solid hsla(270, 80%, 55%, 0.35)`;
                                (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 25px hsla(270, 80%, 55%, 0.12)`;
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLDivElement).style.border = `1px solid hsla(270, 60%, 60%, 0.12)`;
                                (e.currentTarget as HTMLDivElement).style.boxShadow = "";
                            }}
                        >
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110"
                                style={{ background: `${f.color}22` }}
                            >
                                <f.icon className="w-5 h-5" style={{ color: f.color }} />
                            </div>
                            <h3 className="font-poppins font-semibold text-sm text-foreground mb-1">{f.label}</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default HeroSection;
