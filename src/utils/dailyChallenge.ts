type ChallengeTask = "grammar" | "translate" | "vocab";

export const getTodayChallenge = (): ChallengeTask => {
    const tasks: ChallengeTask[] = ["grammar", "translate", "vocab"];
    return tasks[new Date().getDate() % tasks.length];
};
