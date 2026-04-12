import { Trophy } from 'lucide-react';
import type { LeaderboardUser } from '@lib/leaderboard-types';

interface RankingsListProps {
    users: LeaderboardUser[];
    currentUserId?: string;
}

export function RankingsList({ users, currentUserId }: RankingsListProps) {
    if (users.length === 0) return null;

    return (
        <div className="px-4 pb-24 max-w-4xl mx-auto">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/40 backdrop-blur-sm">
                <div className="divide-y divide-white/6">
                    {users.map((user, index) => {
                        const isCurrentUser = user.is_current_user || user.id === currentUserId;
                        const progressPercent = Math.min((user.xp % 1000) / 10, 100);
                        const liveLabel = user.live_modules?.length
                            ? `Live in ${user.live_modules.map((module) => module.replace(/-/g, " ")).join(", ")}`
                            : "Live now";

                        return (
                            <div
                                key={user.id}
                                className={`flex items-center gap-4 p-4 transition-all duration-300 hover:bg-cyan-500/8 animate-fade-in ${isCurrentUser ? 'border-l-4 border-cyan-400 bg-cyan-500/12' : ''
                                    }`}
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <div className="flex-shrink-0 w-12 text-center">
                                    <span className={`text-2xl font-bold ${isCurrentUser ? 'text-cyan-200' : 'text-slate-500'}`}>
                                        #{user.rank}
                                    </span>
                                </div>

                                <div className="flex-shrink-0">
                                    <div className={`w-14 h-14 rounded-full overflow-hidden ring-2 ${isCurrentUser ? 'ring-cyan-400' : 'ring-slate-700'
                                        }`}>
                                        <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className={`font-bold truncate ${isCurrentUser ? 'text-cyan-100' : 'text-white'}`}>
                                            {user.username}
                                        </h3>
                                        {user.is_live && (
                                            <span className="flex-shrink-0 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
                                                Live
                                            </span>
                                        )}
                                        {isCurrentUser && (
                                            <span className="flex-shrink-0 rounded-full bg-cyan-400 px-2 py-0.5 text-xs text-slate-950">
                                                You
                                            </span>
                                        )}
                                    </div>
                                    {user.is_live && (
                                        <p className="mb-1 text-xs text-emerald-200/80">{liveLabel}</p>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-2 overflow-hidden rounded-full bg-slate-800">
                                            <div
                                                className="h-full bg-gradient-to-r from-cyan-400 to-orange-400 transition-all duration-500"
                                                style={{ width: `${progressPercent}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-slate-500">Lvl {user.level}</span>
                                    </div>
                                </div>

                                <div className="flex-shrink-0 text-right">
                                    <div className="flex items-center gap-1 justify-end mb-1">
                                        <Trophy className="w-4 h-4 text-orange-200" />
                                        <span className="font-bold text-orange-200">{user.weekly_xp.toLocaleString()}</span>
                                    </div>
                                    <span className="text-xs text-slate-500">XP this week</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
