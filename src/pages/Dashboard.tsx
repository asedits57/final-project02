import { useEffect } from "react";
import { useStore } from "../store/useStore";
import { getTodayChallenge } from "../utils/dailyChallenge";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonCard } from "@/components/ui/SkeletonLoader";

function DashboardSkeleton() {
    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <Skeleton className="h-10 w-2/3 bg-white/10 rounded-xl" />
            <div className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10">
                <Skeleton className="h-6 w-1/3 mb-4 bg-white/10" />
                <Skeleton className="h-10 w-full bg-white/10" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map((i) => (
                    <div key={i} className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-3">
                        <Skeleton className="h-4 w-1/4 bg-white/10" />
                        <Skeleton className="h-10 w-1/2 bg-white/10" />
                    </div>
                ))}
            </div>
        </div>
    );
}

function Dashboard(): JSX.Element {
    const task = getTodayChallenge();
    const { user, loading, fetchUser } = useStore();

    useEffect(() => {
        fetchUser();
    }, []);

    if (loading) return <DashboardSkeleton />;

    return (
        <motion.div 
            className="p-8 max-w-4xl mx-auto space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <motion.h1 
                className="text-4xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
            >
                Hello, {user?.email?.split('@')[0]} 👋
            </motion.h1>

            <motion.div 
                className="group relative bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <h2 className="text-sm font-semibold uppercase tracking-widest text-violet-400 mb-2">Today's Challenge</h2>
                <p className="text-2xl font-medium text-white leading-tight">{task}</p>
                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Live Content
                </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div 
                    className="bg-gradient-to-br from-violet-600/20 to-violet-800/20 p-8 rounded-3xl border border-violet-500/20"
                    whileHover={{ y: -5 }}
                >
                    <h3 className="text-sm font-semibold uppercase tracking-widest text-violet-300 mb-2">Total Score</h3>
                    <p className="text-5xl font-bold text-white tabular-nums">{user?.score || 0}</p>
                </motion.div>

                <motion.div 
                    className="bg-gradient-to-br from-fuchsia-600/20 to-fuchsia-800/20 p-8 rounded-3xl border border-fuchsia-500/20"
                    whileHover={{ y: -5 }}
                >
                    <h3 className="text-sm font-semibold uppercase tracking-widest text-fuchsia-300 mb-2">Since</h3>
                    <p className="text-3xl font-bold text-white">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : '---'}
                    </p>
                </motion.div>
            </div>
        </motion.div>
    );
}

export default Dashboard;
