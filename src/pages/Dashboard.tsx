import { useEffect } from "react";

import { getTodayChallenge } from "../utils/dailyChallenge";

function Dashboard(): JSX.Element {
    const task = getTodayChallenge();

    useEffect(() => {
        // Channel logic removed
    }, []);

    return (
        <div>
            <h1>Dashboard Page</h1>
            <h2>Today's Challenge: {task}</h2>
        </div>
    );
}

export default Dashboard;
