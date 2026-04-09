import { Crown, Medal } from 'lucide-react';
import type { LeaderboardUser } from '@lib/leaderboard-types';

interface PodiumProps {
    topThree: LeaderboardUser[];
}

export function Podium({ topThree }: PodiumProps) {
    const [first, second, third] = topThree;
    const formatLiveModules = (modules?: string[]) =>
        modules && modules.length > 0 ? modules.map((module) => module.replace(/-/g, " ")).join(", ") : "";

    if (!first) return null;

    return (
        <div className="relative px-4 py-8">
            <div className="flex items-end justify-center gap-4 max-w-4xl mx-auto">
                {second && (
                    <div className="flex-1 max-w-[200px] animate-scale-in" style={{ animationDelay: '0.2s' }}>
                        <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border-2 border-gray-600 shadow-lg hover:scale-105 transition-transform duration-300">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gray-600 rounded-full p-2">
                                <Medal className="w-6 h-6 text-gray-300" />
                            </div>
                            <div className="flex flex-col items-center mt-2">
                                <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-gray-600 mb-3">
                                    <img src={second.avatar_url} alt={second.username} className="w-full h-full object-cover" />
                                </div>
                                <h3 className="text-white font-bold text-lg mb-1">{second.username}</h3>
                                {second.is_live && (
                                    <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                        Live now
                                    </div>
                                )}
                                <p className="text-gray-400 text-sm mb-2">Level {second.level}</p>
                                {second.is_live && second.live_modules?.length ? (
                                    <p className="mb-2 text-center text-xs text-emerald-200/80">
                                        {formatLiveModules(second.live_modules)}
                                    </p>
                                ) : null}
                                <div className="bg-gray-700 rounded-full px-4 py-1">
                                    <p className="text-violet-400 font-bold">{second.weekly_xp.toLocaleString()} XP</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 text-center">
                            <span className="text-4xl font-bold text-gray-500">#2</span>
                        </div>
                    </div>
                )}

                {first && (
                    <div className="flex-1 max-w-[240px] -mt-8 animate-scale-in z-10" style={{ animationDelay: '0s' }}>
                        <div className="relative bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl p-6 border-2 border-yellow-400 shadow-2xl shadow-violet-500/50 hover:scale-105 transition-transform duration-300">
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                                <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full p-3 shadow-lg shadow-yellow-500/50 animate-pulse-glow">
                                    <Crown className="w-8 h-8 text-yellow-900" />
                                </div>
                            </div>
                            <div className="flex flex-col items-center mt-4">
                                <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-yellow-400 mb-4 shadow-lg shadow-yellow-500/50">
                                    <img src={first.avatar_url} alt={first.username} className="w-full h-full object-cover" />
                                </div>
                                <h3 className="text-white font-bold text-xl mb-1">{first.username}</h3>
                                {first.is_live && (
                                    <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-100">
                                        <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
                                        Live now
                                    </div>
                                )}
                                <p className="text-violet-200 text-sm mb-3">Level {first.level}</p>
                                {first.is_live && first.live_modules?.length ? (
                                    <p className="mb-3 text-center text-xs text-violet-100/80">
                                        {formatLiveModules(first.live_modules)}
                                    </p>
                                ) : null}
                                <div className="bg-white/20 backdrop-blur-sm rounded-full px-5 py-2">
                                    <p className="text-white font-bold text-lg">{first.weekly_xp.toLocaleString()} XP</p>
                                </div>
                            </div>
                            <div className="absolute -top-1 -right-1 w-8 h-8">
                                <div className="absolute inset-0 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
                                <div className="relative bg-yellow-400 rounded-full w-full h-full flex items-center justify-center">
                                    <span className="text-yellow-900 text-xs font-bold">★</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 text-center">
                            <span className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">#1</span>
                        </div>
                    </div>
                )}

                {third && (
                    <div className="flex-1 max-w-[200px] animate-scale-in" style={{ animationDelay: '0.4s' }}>
                        <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border-2 border-orange-700 shadow-lg hover:scale-105 transition-transform duration-300">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-700 rounded-full p-2">
                                <Medal className="w-6 h-6 text-orange-400" />
                            </div>
                            <div className="flex flex-col items-center mt-2">
                                <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-orange-700 mb-3">
                                    <img src={third.avatar_url} alt={third.username} className="w-full h-full object-cover" />
                                </div>
                                <h3 className="text-white font-bold text-lg mb-1">{third.username}</h3>
                                {third.is_live && (
                                    <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                        Live now
                                    </div>
                                )}
                                <p className="text-gray-400 text-sm mb-2">Level {third.level}</p>
                                {third.is_live && third.live_modules?.length ? (
                                    <p className="mb-2 text-center text-xs text-emerald-200/80">
                                        {formatLiveModules(third.live_modules)}
                                    </p>
                                ) : null}
                                <div className="bg-gray-700 rounded-full px-4 py-1">
                                    <p className="text-violet-400 font-bold">{third.weekly_xp.toLocaleString()} XP</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 text-center">
                            <span className="text-4xl font-bold text-gray-500">#3</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
