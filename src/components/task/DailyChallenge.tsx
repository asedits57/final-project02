import { Flame, Clock, Target, Zap, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const DailyChallenge = () => {
    const navigate = useNavigate();

    return (
        <section className="relative w-full pt-6 px-6 md:px-8">
            <div className="w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="relative rounded-3xl p-8 md:p-8 overflow-hidden"
                    style={{
                        background: "linear-gradient(135deg, hsla(270, 30%, 9%, 0.9) 0%, hsla(262, 50%, 12%, 0.9) 100%)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid hsla(270, 80%, 55%, 0.25)",
                        boxShadow: "0 0 40px hsla(270, 80%, 55%, 0.1), inset 0 1px 0 hsla(270, 60%, 70%, 0.08)",
                    }}
                >
                    {/* Decorative BG glow */}
                    <div
                        className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none opacity-20"
                        style={{ background: "hsl(270, 80%, 55%)", filter: "blur(60px)" }}
                    />
                    <div
                        className="absolute -bottom-16 -left-10 w-48 h-48 rounded-full pointer-events-none opacity-10"
                        style={{ background: "hsl(185, 100%, 50%)", filter: "blur(50px)" }}
                    />

                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex-1">
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4"
                                style={{
                                    background: "hsla(270, 80%, 55%, 0.15)",
                                    border: "1px solid hsla(270, 80%, 55%, 0.3)",
                                }}>
                                <Flame className="h-4 w-4 text-orange-400" />
                                <span className="text-xs font-semibold text-violet-300 font-poppins tracking-wide">Daily Challenge</span>
                                <span className="ml-1 text-xs text-orange-400 font-bold">🔥 Day 7</span>
                            </div>

                            <h3 className="font-poppins text-2xl md:text-3xl font-bold mb-2">
                                5-Minute Speaking Sprint
                            </h3>
                            <p className="text-muted-foreground text-sm max-w-lg leading-relaxed">
                                Describe three images in under 90 seconds each. AI evaluates pronunciation, fluency, and coherence in real time.
                            </p>

                            <div className="flex flex-wrap items-center gap-5 mt-5">
                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4 text-violet-400" />
                                    5 min
                                </div>
                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <Target className="h-4 w-4 text-violet-400" />
                                    +50 XP
                                </div>
                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <Zap className="h-4 w-4 text-yellow-400" />
                                    Intermediate
                                </div>
                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <Trophy className="h-4 w-4 text-amber-400" />
                                    Weekly Leaderboard
                                </div>
                            </div>
                        </div>

                        {/* CTA */}
                        <button
                            onClick={() => navigate("/task/speaking")}
                            className="group relative flex items-center gap-2 rounded-2xl px-7 py-3.5 font-poppins font-semibold text-white shrink-0 overflow-hidden transition-all duration-300 hover:scale-105"
                            style={{
                                background: "linear-gradient(135deg, #7f5af0, #8b5cf6)",
                                boxShadow: "0 0 25px hsla(262, 83%, 58%, 0.4)",
                            }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 45px hsla(262, 83%, 58%, 0.65)";
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 25px hsla(262, 83%, 58%, 0.4)";
                            }}
                        >
                            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                                style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.1), transparent)" }} />
                            <Zap className="h-4 w-4" />
                            Accept Challenge
                        </button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default DailyChallenge;
