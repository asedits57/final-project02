import { useEffect } from "react";
import { supabase } from "../supabaseClient";

function Dashboard() {

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
        </div>
    );
}

export default Dashboard;
import { getTodayChallenge } from "../utils/dailyChallenge";

const task = getTodayChallenge();

return <h2>Today's Challenge: {task}</h2>;