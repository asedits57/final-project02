import { Trophy } from 'lucide-react';
import type { LeaderboardUser } from '@lib/leaderboard-types';

interface RankingsListProps {
    users: LeaderboardUser[];
    currentUserId?: string;
}

export function RankingsList({ users }: RankingsListProps) {
    if (users.length === 0) return null;

    return (
        <div className="px-4 pb-24 max-w-4xl mx-auto">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-violet-500/20 overflow-hidden">
                <div className="divide-y divide-violet-500/10">
                    {users.map((user, index) => {
                        const isCurrentUser = user.username === 'You';
                        const progressPercent = Math.min((user.xp % 1000) / 10, 100);

                        return (
                            <div
                                key={user.id}
                                className={`flex items-center gap-4 p-4 transition-all duration-300 hover:bg-violet-500/10 animate-fade-in ${isCurrentUser ? 'bg-violet-500/20 border-l-4 border-violet-500' : ''
                                    }`}
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <div className="flex-shrink-0 w-12 text-center">
                                    <span className={`text-2xl font-bold ${isCurrentUser ? 'text-violet-400' : 'text-gray-500'}`}>
                                        #{user.rank}
                                    </span>
                                </div>

                                <div className="flex-shrink-0">
                                    <div className={`w-14 h-14 rounded-full overflow-hidden ring-2 ${isCurrentUser ? 'ring-violet-500' : 'ring-gray-700'
                                        }`}>
                                        <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className={`font-bold truncate ${isCurrentUser ? 'text-violet-300' : 'text-white'}`}>
                                            {user.username}
                                        </h3>
                                        {isCurrentUser && (
                                            <span className="flex-shrink-0 bg-violet-500 text-white text-xs px-2 py-0.5 rounded-full">
                                                You
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-violet-500 to-purple-600 transition-all duration-500"
                                                style={{ width: `${progressPercent}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-gray-500">Lvl {user.level}</span>
                                    </div>
                                </div>

                                <div className="flex-shrink-0 text-right">
                                    <div className="flex items-center gap-1 justify-end mb-1">
                                        <Trophy className="w-4 h-4 text-violet-400" />
                                        <span className="text-violet-400 font-bold">{user.weekly_xp.toLocaleString()}</span>
                                    </div>
                                    <span className="text-xs text-gray-500">XP this week</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
