import { motion } from "framer-motion";
import { Award, BarChart2, Clock, Target, TrendingUp } from "lucide-react";

const stats = [
    { icon: TrendingUp, label: "Predicted DET score", value: "115", trend: "+5 pts", color: "#22d3ee" },
    { icon: Target, label: "Accuracy", value: "87%", trend: "+2% this week", color: "#38bdf8" },
    { icon: Clock, label: "Practice time", value: "4.2h", trend: "this week", color: "#67e8f9" },
    { icon: Award, label: "Tasks completed", value: "142", trend: "+8 today", color: "#7dd3fc" },
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
        <section className="app-surface px-5 py-6 sm:px-6">
            <motion.div
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
            >
                <span className="app-kicker">Analytics</span>
                <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">Performance snapshot</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-300/76">
                    Track the session at a glance and use the weekly chart to see whether momentum is holding.
                </p>
            </motion.div>

            <div className="mt-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.35, delay: index * 0.05 }}
                        className="app-surface-soft p-4"
                    >
                        <div
                            className="flex h-10 w-10 items-center justify-center rounded-2xl border"
                            style={{ background: `${stat.color}18`, borderColor: `${stat.color}33` }}
                        >
                            <stat.icon className="h-4 w-4" style={{ color: stat.color }} />
                        </div>
                        <p className="mt-3 text-2xl font-semibold text-white">{stat.value}</p>
                        <p className="mt-1 text-xs text-slate-400">{stat.label}</p>
                        <p className="mt-2 text-xs font-medium text-cyan-100">{stat.trend}</p>
                    </motion.div>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="app-surface-soft mt-5 p-5"
            >
                <div className="flex items-center gap-2">
                    <BarChart2 className="h-4 w-4 text-cyan-200" />
                    <h3 className="text-sm font-semibold text-white">Weekly performance</h3>
                    <span className="ml-auto text-xs text-slate-400">This week</span>
                </div>

                <div className="mt-5 overflow-x-auto pb-2">
                    <div className="flex h-36 min-w-[320px] items-end gap-3 sm:min-w-0">
                        {weekData.map((day, index) => {
                            const isToday = day.day === "Sun";

                            return (
                                <motion.div
                                    key={day.day}
                                    initial={{ scaleY: 0, opacity: 0 }}
                                    whileInView={{ scaleY: 1, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.45, delay: 0.2 + index * 0.05 }}
                                    className="flex flex-1 flex-col items-center gap-2"
                                    style={{ transformOrigin: "bottom" }}
                                >
                                    <div className="relative w-full" style={{ height: `${day.value}%` }}>
                                        <div
                                            className="h-full w-full rounded-t-xl"
                                            style={{
                                                background: isToday
                                                    ? "linear-gradient(180deg, #67e8f9, #22d3ee)"
                                                    : "linear-gradient(180deg, rgba(103,232,249,0.55), rgba(34,211,238,0.18))",
                                            }}
                                        />
                                    </div>
                                    <span className={`text-xs font-medium ${isToday ? "text-cyan-100" : "text-slate-400"}`}>
                                        {day.day}
                                    </span>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </motion.div>
        </section>
    );
};

export default StatsPanel;
