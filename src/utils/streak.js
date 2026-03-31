export const updateStreak = (lastLogin, currentStreak) => {
    const today = new Date();
    const last = new Date(lastLogin);

    // Remove time (important 🔥)
    today.setHours(0, 0, 0, 0);
    last.setHours(0, 0, 0, 0);

    const diffDays = (today - last) / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
        return currentStreak + 1; // continue streak
    } else if (diffDays === 0) {
        return currentStreak; // same day
    } else {
        return 1; // reset streak
    }
};