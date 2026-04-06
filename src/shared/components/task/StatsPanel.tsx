import { TrendingUp, Target, Clock, Award, BarChart2 } from "lucide-react";
import { motion } from "framer-motion";

const stats = [
    { icon: TrendingUp, label: "Predicted DET Score", value: "115", trend: "+5 pts", positive: true, color: "#7f5af0" },
    { icon: Target, label: "Accuracy", value: "87%", trend: "+2% this week", positive: true, color: "#8b5cf6" },
    { icon: Clock, label: "Practice Time", value: "4.2h", trend: "this week", positive: true, color: "#a78bfa" },
    { icon: Award, label: "Tasks Completed", value: "142", trend: "+8 today", positive: true, color: "#7f5af0" },
];

const weekData = [
    { day: "Mon", value: 65 },
    { day: "Tue", value: 80 },
    { day: "Wed", value: 45 },
    { day: "Thu", value: 90 },
    { day: "Fri", value: 70 },
    { day: "Sat", value: 55 },
    { day: "Sun", value: 85 },
];

const StatsPanel = () => {
    return (
        <section className="py-16 relative">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="mb-10"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-1 w-8 rounded-full" style={{ background: "linear-gradient(90deg, #7f5af0, #8b5cf6)" }} />
                        <span className="text-xs font-semibold text-violet-400 uppercase tracking-widest font-poppins">Analytics</span>
                    </div>
                    <h2 className="font-poppins text-3xl font-bold mb-2">Performance Analytics</h2>
                    <p className="text-muted-foreground text-sm">Track your progress and identify areas for improvement</p>
                </motion.div>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.08 }}
                            className="relative rounded-2xl p-5 group overflow-hidden transition-all duration-300"
                            style={{
                                background: "hsla(270, 20%, 8%, 0.7)",
                                backdropFilter: "blur(20px)",
                                border: "1px solid hsla(270, 60%, 60%, 0.12)",
                            }}
                            whileHover={{
                                scale: 1.03,
                                borderColor: stat.color + "44",
                                boxShadow: `0 0 25px ${stat.color}22`,
                            }}
                        >
                            {/* Glow bg */}
                            <div
                                className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-5 pointer-events-none"
                                style={{ background: stat.color, filter: "blur(20px)" }}
                            />

                            <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                                style={{ background: `${stat.color}18` }}
                            >
                                <stat.icon className="h-4 w-4" style={{ color: stat.color }} />
                            </div>
                            <div
                                className="font-poppins text-2xl font-extrabold mb-0.5"
                                style={{
                                    background: `linear-gradient(135deg, ${stat.color}, ${stat.color}bb)`,
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    backgroundClip: "text",
                                }}
                            >
                                {stat.value}
                            </div>
                            <div className="text-xs text-muted-foreground mb-1.5 leading-tight">{stat.label}</div>
                            <div className="text-xs font-medium text-green-400">{stat.trend}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Weekly Activity Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="relative rounded-2xl p-6 overflow-hidden"
                    style={{
                        background: "hsla(270, 20%, 8%, 0.7)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid hsla(270, 60%, 55%, 0.15)",
                        boxShadow: "0 0 30px hsla(270, 80%, 55%, 0.06)",
                    }}
                >
                    <div className="flex items-center gap-2 mb-6">
                        <BarChart2 className="w-4 h-4 text-violet-400" />
                        <h4 className="text-sm font-semibold font-poppins text-foreground">Weekly Performance</h4>
                        <span className="ml-auto text-xs text-muted-foreground">This Week</span>
                    </div>

                    <div className="flex items-end gap-3 h-36">
                        {weekData.map((d, i) => {
                            const isToday = d.day === "Sun";
                            return (
                                <motion.div
                                    key={d.day}
                                    initial={{ scaleY: 0, opacity: 0 }}
                                    whileInView={{ scaleY: 1, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: 0.4 + i * 0.07 }}
                                    className="flex-1 flex flex-col items-center gap-2 group cursor-pointer"
                                    style={{ transformOrigin: "bottom" }}
                                >
                                    <div className="w-full relative" style={{ height: `${d.value}%` }}>
                                        <div
                                            className="w-full h-full rounded-t-lg transition-all duration-300 group-hover:opacity-90"
                                            style={{
                                                background: isToday
                                                    ? "linear-gradient(180deg, #a78bfa, #7f5af0)"
                                                    : "linear-gradient(180deg, hsla(270, 60%, 55%, 0.5), hsla(270, 60%, 40%, 0.2))",
                                                boxShadow: isToday ? "0 0 15px hsla(270, 80%, 55%, 0.4)" : "none",
                                            }}
                                        />
                                        {/* Tooltip on hover */}
                                        <div
                                            className="absolute -top-7 left-1/2 -translate-x-1/2 bg-violet-900/90 text-violet-200 text-xs px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                                            style={{ backdropFilter: "blur(10px)" }}
                                        >
                                            {d.value}%
                                        </div>
                                    </div>
                                    <span className={`text-xs font-medium ${isToday ? "text-violet-400" : "text-muted-foreground"}`}>
                                        {d.day}
                                    </span>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default StatsPanel;
