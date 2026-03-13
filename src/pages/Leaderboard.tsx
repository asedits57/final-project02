import { Sparkles, Home, CheckSquare, Trophy, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/leaderboard-supabase';
import { Podium } from '@/components/leaderboard/Podium';
import { RankingsList } from '@/components/leaderboard/RankingsList';
import { motion } from 'framer-motion';
import type { LeaderboardUser } from '@/lib/leaderboard-types';

const navItems = [
    { label: 'Home', icon: Home, path: '/' },
    { label: 'Task', icon: CheckSquare, path: '/task' },
    { label: 'Leaderboard', icon: Trophy, path: '/leaderboard' },
    { label: 'Profile', icon: User, path: '/profile' },
];

// Instant placeholder data — shown immediately while real data loads
const PLACEHOLDER_USERS: LeaderboardUser[] = [
    { id: '1', username: 'Loading...', xp: 9800, level: 12, avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1', weekly_xp: 9800, rank: 1, created_at: '', updated_at: '' },
    { id: '2', username: 'Loading...', xp: 8400, level: 10, avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2', weekly_xp: 8400, rank: 2, created_at: '', updated_at: '' },
    { id: '3', username: 'Loading...', xp: 7200, level: 9, avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3', weekly_xp: 7200, rank: 3, created_at: '', updated_at: '' },
    { id: '4', username: 'Loading...', xp: 6100, level: 8, avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4', weekly_xp: 6100, rank: 4, created_at: '', updated_at: '' },
    { id: '5', username: 'Loading...', xp: 5300, level: 7, avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=5', weekly_xp: 5300, rank: 5, created_at: '', updated_at: '' },
    { id: '6', username: 'Loading...', xp: 4700, level: 6, avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=6', weekly_xp: 4700, rank: 6, created_at: '', updated_at: '' },
];

async function fetchLeaderboardData() {
    const { data, error } = await supabase
        .from('leaderboard_users')
        .select('id, username, xp, level, avatar_url, weekly_xp, rank, created_at, updated_at')
        .order('weekly_xp', { ascending: false })
        .limit(20);
    if (error) throw error;
    return data ?? [];
}

const Leaderboard = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const { data: users = PLACEHOLDER_USERS, isFetching } = useQuery<LeaderboardUser[]>({
        queryKey: ['leaderboard'],
        queryFn: fetchLeaderboardData,
        initialData: PLACEHOLDER_USERS, // Use initialData to ensure type match
        staleTime: 5 * 60_000,
        gcTime: 10 * 60_000,
        refetchOnWindowFocus: false,
    });

    const topThree = users.slice(0, 3);
    const remaining = users.slice(3);

    return (
        <div className="min-h-screen animated-bg text-foreground">
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-violet-950/20 via-transparent to-transparent pointer-events-none" />

                {/* Header */}
                <header className="relative pt-8 pb-4 px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 mb-3">
                            <Sparkles className="w-6 h-6 text-violet-400 animate-sparkle" />
                            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-400 via-purple-500 to-violet-600 bg-clip-text text-transparent">
                                Leaderboard
                            </h1>
                            <Sparkles className="w-6 h-6 text-violet-400 animate-sparkle" style={{ animationDelay: '1s' }} />
                        </div>
                        <p className="text-gray-400 text-lg">Top Language Learners This Week</p>
                        {/* Subtle refresh indicator — only visible while fetching fresh data */}
                        {isFetching && (
                            <p className="text-xs text-violet-400/50 mt-1 animate-pulse">Refreshing…</p>
                        )}
                    </div>
                </header>

                {/* Always renders immediately — no loading gate */}
                <Podium topThree={topThree} />
                <div className="mt-8">
                    <RankingsList users={remaining} />
                </div>
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
                        <button
                            key={label}
                            onClick={() => navigate(path)}
                            className="flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-200"
                            style={{
                                background: active ? 'rgba(139, 92, 246, 0.18)' : 'transparent',
                                border: active ? '1px solid rgba(139, 92, 246, 0.35)' : '1px solid transparent',
                            }}
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
                        </button>
                    );
                })}
            </motion.nav>
        </div>
    );
};

export default Leaderboard;
