export const getTodayChallenge = () => {
    const tasks = ["grammar", "translate", "vocab"];
    return tasks[new Date().getDate() % tasks.length];
};