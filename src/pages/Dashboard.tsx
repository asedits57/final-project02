import { useEffect } from "react";
import { useStore } from "../store/useStore";
import { getTodayChallenge } from "../utils/dailyChallenge";

function Dashboard(): JSX.Element {
    const task = getTodayChallenge();
    const { user, loading, fetchUser } = useStore();

    useEffect(() => {
        fetchUser();
    }, []);

    if (loading) return <div>Loading Profile...</div>;

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">Hello, {user?.email} 👋</h1>
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-semibold mb-2">Today's Challenge:</h2>
                <p className="text-lg text-primary">{task}</p>
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-primary/20 p-4 rounded-lg">
                    <h3 className="font-bold">Your Score</h3>
                    <p className="text-2xl font-mono">{user?.score || 0}</p>
                </div>
                <div className="bg-secondary/20 p-4 rounded-lg">
                    <h3 className="font-bold">Member Since</h3>
                    <p className="text-sm">{new Date(user?.createdAt).toLocaleDateString()}</p>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
