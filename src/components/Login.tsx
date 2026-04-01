import { useState } from "react";
import { supabase } from "../supabase/supabase";
import { updateStreak } from "../utils/streak";

const handleLoginSuccess = async (userId: string): Promise<void> => {
    const { data } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

    if (!data) return;

    const newStreak = updateStreak(data.last_login, data.streak);

    await supabase
        .from("users")
        .update({
            streak: newStreak,
            last_login: new Date()
        })
        .eq("id", userId);
};

export default function Login(): JSX.Element {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const handleLogin = async (): Promise<void> => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            console.log(error);
            return;
        }

        if (data.user) {
            await handleLoginSuccess(data.user.id);
        }
    };

    return (
        <div>
            <input
                type="email"
                placeholder="Enter email"
                onChange={(e) => setEmail(e.target.value)}
            />

            <input
                type="password"
                placeholder="Enter password"
                onChange={(e) => setPassword(e.target.value)}
            />

            <button onClick={handleLogin}>Login</button>
        </div>
    );
}
