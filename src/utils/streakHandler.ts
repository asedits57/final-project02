import { updateStreak } from "./streak";

export const handleLoginSuccess = async (userId: string): Promise<void> => {
    const streakKey = `streak:${userId}`;
    const lastLoginKey = `last-login:${userId}`;
    const lastLogin = localStorage.getItem(lastLoginKey);
    const currentStreak = Number.parseInt(localStorage.getItem(streakKey) || "0", 10);
    const nextStreak = lastLogin ? updateStreak(lastLogin, currentStreak) : 1;

    localStorage.setItem(streakKey, String(nextStreak));
    localStorage.setItem(lastLoginKey, new Date().toISOString());
};
