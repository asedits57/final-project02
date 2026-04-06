import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Activity, ShieldAlert, Trophy, Search, ChevronRight, CheckCircle2, AlertTriangle, XCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuthStore as useStore } from "@core/useAuthStore";
import { apiService as api } from "@shared/api";

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<"overview" | "users" | "proctoring" | "questions">("overview");
    const [questionsData, setQuestionsData] = useState<Record<string, any[]> | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>("grammar");

    useEffect(() => {
        const load = async () => {
            const data = await api.fetchQuestions();
            setQuestionsData(data as Record<string, any[]>);
        };
        load();
    }, []);

    const stats = [
        { label: "Total Users", value: "1,248", change: "+12% this week", icon: Users, color: "text-blue-400" },
        { label: "Tests Completed", value: "8,432", change: "+5% this week", icon: Activity, color: "text-green-400" },
        { label: "Flagged Sessions", value: "34", change: "-2% this week", icon: ShieldAlert, color: "text-red-400" },
        { label: "Avg Platform XP", value: "2,150", change: "+150 XP", icon: Trophy, color: "text-yellow-400" },
    ];

    const recentUsers = [
        { id: "1", name: "Jane Doe", level: "Advanced", score: 92, status: "Active" },
        { id: "2", name: "John Smith", level: "Intermediate", score: 65, status: "Active" },
        { id: "3", name: "Alice Johnson", level: "Expert", score: 98, status: "Warning" },
        { id: "4", name: "Bob Williams", level: "Beginner", score: 45, status: "Banned" },
        { id: "5", name: "Emma Davis", level: "Advanced", score: 88, status: "Active" },
    ];

    const proctoringAlerts = [
        { id: "101", user: "John Smith", issue: "Multiple faces detected", time: "10 mins ago", severity: "High" },
        { id: "102", user: "Alice Johnson", issue: "Looking away from screen", time: "45 mins ago", severity: "Medium" },
        { id: "103", user: "Jane Doe", issue: "Background noise detected", time: "2 hours ago", severity: "Low" },
        { id: "104", user: "Bob Williams", issue: "Tab switched", time: "3 hours ago", severity: "High" },
    ];

    return (
        <div className="min-h-screen animated-bg relative pb-10 text-foreground overflow-hidden">
            <div className="orb orb-violet w-[500px] h-[500px] -top-32 -left-32 float opacity-20 pointer-events-none" />
            <div className="orb orb-fuchsia w-[400px] h-[400px] top-1/2 -right-24 float-delayed opacity-10 pointer-events-none" />

            {/* Header */}
            <div
                className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 mb-6"
                style={{
                    background: "hsla(270, 25%, 6%, 0.75)",
                    backdropFilter: "blur(20px)",
                    borderBottom: "1px solid hsla(270, 40%, 35%, 0.15)",
                }}
            >
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate("/task")}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-fuchsia-400 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to App
                    </button>
                    <div className="font-poppins font-bold text-xl flex items-center gap-2 bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-violet-400">
                        <ShieldAlert className="w-5 h-5 text-fuchsia-400" />
                        Admin Console
                    </div>
                </div>
                
                <div className="flex bg-white/5 border border-white/10 rounded-full p-1">
                    {(["overview", "users", "proctoring", "questions"] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-1.5 rounded-full text-sm font-poppins capitalize transition-all duration-300 ${
                                activeTab === tab
                                    ? "bg-fuchsia-500/20 text-fuchsia-300 shadow-[0_0_10px_rgba(217,70,239,0.3)]"
                                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="container mx-auto px-6 max-w-6xl">
                {/* Stats Row */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                >
                    {stats.map((stat, idx) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={idx}
                                className="rounded-2xl p-6 relative overflow-hidden group"
                                style={{
                                    background: "hsla(270, 20%, 8%, 0.7)",
                                    backdropFilter: "blur(20px)",
                                    border: "1px solid hsla(270, 60%, 55%, 0.15)",
                                }}
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full transition-all duration-500 group-hover:scale-110" />
                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${stat.color}`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                </div>
                                <h3 className="text-3xl font-poppins font-bold text-white mb-1 relative z-10">{stat.value}</h3>
                                <p className="text-sm font-poppins text-muted-foreground mb-3 relative z-10">{stat.label}</p>
                                <div className="text-xs font-poppins text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded inline-block relative z-10">
                                    {stat.change}
                                </div>
                            </div>
                        );
                    })}
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Users Table */}
                        {(activeTab === "overview" || activeTab === "users") && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="rounded-2xl p-6"
                                style={{
                                    background: "hsla(270, 20%, 8%, 0.7)",
                                    backdropFilter: "blur(20px)",
                                    border: "1px solid hsla(270, 60%, 55%, 0.15)",
                                }}
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="font-poppins font-bold text-lg text-white">Recent Users</h2>
                                    <div className="relative">
                                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                        <input 
                                            type="text" 
                                            placeholder="Search users..." 
                                            className="bg-black/20 border border-white/10 rounded-full pl-9 pr-4 py-1.5 text-sm font-poppins text-white focus:outline-none focus:border-fuchsia-500/50 w-48 transition-all"
                                        />
                                    </div>
                                </div>
                                
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left font-poppins text-sm border-separate border-spacing-y-2">
                                        <thead>
                                            <tr className="text-muted-foreground px-4">
                                                <th className="pb-3 px-4 font-medium">Name</th>
                                                <th className="pb-3 px-4 font-medium">Level</th>
                                                <th className="pb-3 px-4 font-medium">Avg Score</th>
                                                <th className="pb-3 px-4 font-medium">Status</th>
                                                <th className="pb-3 px-4 font-medium text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentUsers.map((user) => (
                                                <tr key={user.id} className="bg-white/5 hover:bg-white/10 transition-colors group">
                                                    <td className="p-4 rounded-l-xl flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-fuchsia-500/40 to-violet-500/40 border border-fuchsia-500/30 flex items-center justify-center text-white font-bold text-xs">
                                                            {user.name.charAt(0)}
                                                        </div>
                                                        <span className="text-white">{user.name}</span>
                                                    </td>
                                                    <td className="p-4 text-violet-300">{user.level}</td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-16 h-1.5 bg-black/40 rounded-full overflow-hidden">
                                                                <div 
                                                                    className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-500" 
                                                                    style={{ width: `${user.score}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-xs text-white">{user.score}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        {user.status === "Active" && <span className="flex items-center gap-1.5 text-emerald-400 text-xs bg-emerald-400/10 px-2 py-1 rounded-full w-max"><CheckCircle2 className="w-3 h-3" /> Active</span>}
                                                        {user.status === "Warning" && <span className="flex items-center gap-1.5 text-yellow-400 text-xs bg-yellow-400/10 px-2 py-1 rounded-full w-max"><AlertTriangle className="w-3 h-3" /> Warning</span>}
                                                        {user.status === "Banned" && <span className="flex items-center gap-1.5 text-red-400 text-xs bg-red-400/10 px-2 py-1 rounded-full w-max"><XCircle className="w-3 h-3" /> Banned</span>}
                                                    </td>
                                                    <td className="p-4 rounded-r-xl text-right">
                                                        <button className="text-muted-foreground hover:text-white transition-colors">
                                                            <ChevronRight className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}

                        {/* Questions Management */}
                        {activeTab === "questions" && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="rounded-2xl p-6"
                                style={{
                                    background: "hsla(270, 20%, 8%, 0.7)",
                                    backdropFilter: "blur(20px)",
                                    border: "1px solid hsla(270, 60%, 55%, 0.15)",
                                }}
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="font-poppins font-bold text-lg text-white">Manage Questions</h2>
                                    <button className="px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg hover:scale-105">
                                        Add New Question
                                    </button>
                                </div>
                                
                                <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                                    {questionsData && Object.keys(questionsData).map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setSelectedCategory(cat)}
                                            className={`px-4 py-2 rounded-xl text-xs font-poppins capitalize border transition-all ${
                                                selectedCategory === cat 
                                                ? "bg-fuchsia-500/20 border-fuchsia-500/50 text-fuchsia-300" 
                                                : "bg-white/5 border-white/10 text-muted-foreground"
                                            }`}
                                        >
                                            {cat} ({questionsData[cat].length})
                                        </button>
                                    ))}
                                </div>

                                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                    {questionsData && questionsData[selectedCategory]?.map((item: any, idx: number) => (
                                        <div key={idx} className="p-4 bg-white/5 border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-xs font-bold text-violet-400 font-poppins">ID: {item.id || idx + 1}</span>
                                                <div className="flex gap-2">
                                                    <button className="text-[10px] text-muted-foreground hover:text-white underline">Edit</button>
                                                    <button className="text-[10px] text-red-400 hover:text-red-300 underline">Delete</button>
                                                </div>
                                            </div>
                                            <p className="text-sm text-foreground line-clamp-2">{item.question || item.prompt || item.title || "No text content"}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Sidebar Area */}
                    <div className="space-y-8">
                        {/* System Health */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="rounded-2xl p-6"
                            style={{
                                background: "hsla(270, 20%, 8%, 0.7)",
                                backdropFilter: "blur(20px)",
                                border: "1px solid hsla(270, 60%, 55%, 0.15)",
                            }}
                        >
                            <h2 className="font-poppins font-bold text-lg text-white mb-6">System Health</h2>
                            <div className="space-y-5">
                                <div>
                                    <div className="flex justify-between text-sm font-poppins mb-2">
                                        <span className="text-muted-foreground">AI Evaluator Load</span>
                                        <span className="text-white">45%</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-black/40 overflow-hidden">
                                        <div className="h-full bg-blue-500 w-[45%]" />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm font-poppins mb-2">
                                        <span className="text-muted-foreground">Database Storage</span>
                                        <span className="text-white">78%</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-black/40 overflow-hidden">
                                        <div className="h-full bg-yellow-500 w-[78%]" />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm font-poppins mb-2">
                                        <span className="text-muted-foreground">Proctoring Video Processing</span>
                                        <span className="text-white">92%</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-black/40 overflow-hidden">
                                        <div className="h-full bg-red-500 w-[92%]" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Quick Actions */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="rounded-2xl p-6"
                            style={{
                                background: "hsla(270, 20%, 8%, 0.7)",
                                backdropFilter: "blur(20px)",
                                border: "1px solid hsla(270, 60%, 55%, 0.15)",
                            }}
                        >
                            <h2 className="font-poppins font-bold text-lg text-white mb-6">Quick Actions</h2>
                            <div className="grid grid-cols-2 gap-3">
                                <button className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-fuchsia-500/20 hover:border-fuchsia-500/30 transition-all group text-left">
                                    <Trophy className="w-5 h-5 text-fuchsia-400 mb-2 group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-poppins text-white block">Reset Leaderboard</span>
                                </button>
                                <button className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-violet-500/20 hover:border-violet-500/30 transition-all group text-left">
                                    <Users className="w-5 h-5 text-violet-400 mb-2 group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-poppins text-white block">Add Admin</span>
                                </button>
                                <button className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-blue-500/20 hover:border-blue-500/30 transition-all group text-left col-span-2">
                                    <ShieldAlert className="w-5 h-5 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-poppins text-white block">Generate Compliance Report</span>
                                    <span className="text-xs text-muted-foreground mt-1 block">Export recent proctoring flags to PDF</span>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
