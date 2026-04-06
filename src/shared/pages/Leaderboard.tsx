import { Sparkles, Home, CheckSquare, Trophy, User, BookOpen } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Podium } from '@components/leaderboard/Podium';
import { RankingsList } from '@components/leaderboard/RankingsList';
import { motion } from 'framer-motion';
import type { LeaderboardUser } from '@shared/lib/leaderboard-types';
import { SkeletonPodiumItem, SkeletonListRow } from "@components/ui/SkeletonLoader";
import { useLeaderboard } from '../hooks/useLeaderboard';

const navItems = [
    { label: 'Home', icon: Home, path: '/' },
    { label: 'Task', icon: CheckSquare, path: '/task' },
    { label: 'Learn', icon: BookOpen, path: '/learning' },
    { label: 'Leaderboard', icon: Trophy, path: '/leaderboard' },
    { label: 'Profile', icon: User, path: '/profile' },
];

function LeaderboardSkeleton() {
    return (
        <div className="space-y-12 animate-in fade-in duration-500">
            <div className="flex items-end justify-center gap-4 max-w-4xl mx-auto px-4 py-8">
                <SkeletonPodiumItem className="flex-1" />
                <SkeletonPodiumItem className="flex-1" high />
                <SkeletonPodiumItem className="flex-1" />
            </div>
            <div className="max-w-4xl mx-auto px-4 space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                    <SkeletonListRow key={i} className="bg-white/5 rounded-2xl border border-white/10" />
                ))}
            </div>
        </div>
    );
}

const Leaderboard = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const { data, isLoading } = useLeaderboard();

    // Map to frontend expected format if needed
    const users: LeaderboardUser[] = (data || []).map((u: any, idx: number) => ({
        id: u.id || u._id || String(idx + 1),
        username: u.email.split('@')[0],
        xp: u.score || 0,
        level: Math.floor((u.score || 0) / 100) + 1,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.email}`,
        weekly_xp: u.score || 0,
        rank: idx + 1,
        created_at: '',
        updated_at: ''
    }));

    const topThree = users.slice(0, 3);
    const remaining = users.slice(3);

    return (
        <div className="min-h-screen animated-bg text-foreground">
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-violet-950/20 via-transparent to-transparent pointer-events-none" />

                {/* Header */}
                <header className="relative pt-8 pb-4 px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <motion.div 
                            className="inline-flex items-center gap-2 mb-3"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                        >
                            <Sparkles className="w-6 h-6 text-violet-400 animate-sparkle" />
                            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-400 via-purple-500 to-violet-600 bg-clip-text text-transparent">
                                Leaderboard
                            </h1>
                            <Sparkles className="w-6 h-6 text-violet-400 animate-sparkle" style={{ animationDelay: '1s' }} />
                        </motion.div>
                        <p className="text-gray-400 text-lg">Top Language Learners This Week</p>
                    </div>
                </header>

                {isLoading ? (
                    <LeaderboardSkeleton />
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Podium topThree={topThree} />
                        <div className="mt-8">
                            <RankingsList users={remaining} />
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Bottom Navigation Bar */}
            <motion.nav
                className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-4 py-3"
                style={{
                    background: 'rgba(15, 10, 30, 0.75)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderTop: '1px solid rgba(139, 92, 246, 0.2)',
                    boxShadow: '0 -4px 30px rgba(139, 92, 246, 0.1)',
                }}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
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
                            className="flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
                            style={{
                                background: active ? 'rgba(139, 92, 246, 0.18)' : 'transparent',
                                border: active ? '1px solid rgba(139, 92, 246, 0.35)' : '1px solid transparent',
                            }}
                            onKeyDown={(e) => e.key === 'Enter' && navigate(path)}
                        >
                            <Icon
                                className="w-5 h-5 transition-all duration-200"
                                style={{
                                    color: active ? 'hsl(270, 80%, 75%)' : 'rgba(160, 140, 200, 0.6)',
                                    filter: active ? 'drop-shadow(0 0 6px hsl(270 80% 65%))' : 'none',
                                }}
                            />
                            <span
                                className="text-[10px] font-medium leading-none"
                                style={{
                                    color: active ? 'hsl(270, 80%, 80%)' : 'rgba(160, 140, 200, 0.5)',
                                    fontFamily: "'Inter', sans-serif",
                                }}
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

export default Leaderboard;
