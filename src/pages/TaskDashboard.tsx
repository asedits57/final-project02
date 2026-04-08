import { motion } from "framer-motion";
import { Home, CheckSquare, Trophy, User, Bot, Shield, ArrowRight, BookOpen } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import HeroSection from "@components/task/HeroSection";
import LearningSection from "@components/task/LearningSection";
import DailyChallenge from "@components/task/DailyChallenge";
import StatsPanel from "@components/task/StatsPanel";

const navItems = [
    { label: "Home", icon: Home, path: "/" },
    { label: "Task", icon: CheckSquare, path: "/task" },
    { label: "Learn", icon: BookOpen, path: "/learning" },
    { label: "Leaderboard", icon: Trophy, path: "/leaderboard" },
    { label: "Profile", icon: User, path: "/profile" },
];

const TaskDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className="min-h-screen animated-bg relative pb-24 flex justify-center text-foreground">
            {/* Main content - Centered without sidebar */}
            <div className="flex-1 max-w-7xl mx-auto w-full">
                <HeroSection />

                {/* Unified Card for Task and Learning */}
                <div id="task-cards" className="container mx-auto px-6 mb-8 mt-4 scroll-mt-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="glass-strong rounded-[2.5rem] p-2 overflow-hidden glow-border-violet"
                    >
                        <DailyChallenge />
                        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-violet-500/30 to-transparent my-2" />
                        <LearningSection />
                    </motion.div>
                </div>

                <div id="progress">
                    <StatsPanel />
                </div>
                <div className="container mx-auto px-6 mb-12 flex justify-center">
                    <motion.button
                        whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(139, 92, 246, 0.3)" }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        onClick={() => navigate("/exam-proctor")}
                        className="w-full max-w-2xl py-6 px-8 rounded-[2.5rem] glass-strong border border-violet-500/30 flex items-center gap-6 group transition-all hover:border-violet-500/60"
                        style={{
                            background: "linear-gradient(135deg, rgba(30, 20, 50, 0.4), rgba(50, 30, 80, 0.2))"
                        }}
                    >
                        <div className="p-4 rounded-2xl bg-violet-500/20 border border-violet-500/30 group-hover:scale-110 transition-transform">
                            <Shield className="w-8 h-8 text-violet-400 group-hover:text-violet-300 transition-colors" />
                        </div>
                        <div className="text-left flex-1">
                            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-violet-300">Final Test</h3>
                            <p className="text-base text-violet-200/60">AI Proctoring & Real-time Monitoring</p>
                        </div>
                        <ArrowRight className="w-6 h-6 text-violet-400 group-hover:translate-x-2 transition-transform" />
                    </motion.button>
                </div>
                
                <footer className="glass-strong border-t border-border/50 py-8 mt-8">
                    <div className="container mx-auto px-6 text-center text-sm text-muted-foreground font-poppins">
                        © 2026 FluentAI — AI-Powered English Learning Platform
                    </div>
                </footer>
            </div>

            {/* AI Tutor Floating Action Button */}
            <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 20 }}
                onClick={() => navigate("/ai-tutor")}
                className="fixed bottom-24 right-6 z-50 group flex items-center justify-center w-14 h-14 rounded-full shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:scale-110 transition-transform duration-300"
                style={{ background: "linear-gradient(135deg, #7f5af0, #8b5cf6)" }}
            >
                <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.2), transparent)" }} />
                <Bot className="w-6 h-6 text-white group-hover:-rotate-12 transition-transform duration-300" />

                {/* Ping animation indicator */}
                <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#120a1f] rounded-full animate-pulse"></span>
            </motion.button>

            {/* Bottom Navigation Bar */}
            <motion.nav
                className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-4 py-3"
                style={{
                    background: "rgba(15, 10, 30, 0.85)",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                    borderTop: "1px solid rgba(127, 90, 240, 0.2)",
                    boxShadow: "0 -4px 30px rgba(127, 90, 240, 0.1)",
                }}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
            >
                {navItems.map(({ label, icon: Icon, path }) => {
                    const active = location.pathname === path;
                    return (
                        <motion.button
                            key={label}
                            onClick={() => navigate(path)}
                            whileHover={{ scale: 1.1, y: -2 }}
                            whileTap={{ scale: 0.9 }}
                            aria-label={`Go to ${label}`}
                            className="flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-violet-500"
                            style={{
                                background: active ? "rgba(127, 90, 240, 0.18)" : "transparent",
                                border: active ? "1px solid rgba(127, 90, 240, 0.35)" : "1px solid transparent",
                            }}
                            onKeyDown={(e) => e.key === "Enter" && navigate(path)}
                        >
                            <Icon
                                className="w-5 h-5 transition-all duration-200"
                                style={{
                                    color: active ? "hsl(270, 80%, 75%)" : "rgba(160, 140, 200, 0.6)",
                                    filter: active ? "drop-shadow(0 0 6px hsl(270 80% 65%))" : "none",
                                }}
                            />
                            <span
                                className="text-[10px] font-medium leading-none transition-all duration-200 font-poppins"
                                style={{ color: active ? "hsl(270, 80%, 80%)" : "rgba(160, 140, 200, 0.5)" }}
                            >
                                {label}
                            </span>
                        </motion.button>
                    );
                })}
            </motion.nav>
        </div>
    );
};

export default TaskDashboard;
