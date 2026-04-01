import { useEffect } from "react";
import { supabase } from "../supabase/supabase";
import { getTodayChallenge } from "../utils/dailyChallenge";

function Dashboard(): JSX.Element {
    const task = getTodayChallenge();

    useEffect(() => {
        const channel = supabase
            .channel("test")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "users" },
                (data) => {
                    console.log("Realtime:", data);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <div>
            <h1>Dashboard Page</h1>
            <h2>Today's Challenge: {task}</h2>
        </div>
    );
}

export default Dashboard;
