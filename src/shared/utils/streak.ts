export const updateStreak = (lastLogin: string | Date, currentStreak: number): number => {
    const today = new Date();
    const last = new Date(lastLogin);

    // Remove time component for accurate day comparison
    today.setHours(0, 0, 0, 0);
    last.setHours(0, 0, 0, 0);

    const diffDays = (today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
        return currentStreak + 1; // continue streak
    } else if (diffDays === 0) {
        return currentStreak; // same day login
    } else {
        return 1; // reset streak
    }
};
