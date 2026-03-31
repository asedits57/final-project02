import { loginUser } from "./services/authService";

const handleLogin = async () => {
    try {
        const user = await loginUser(email, password);
        console.log("Logged in:", user.uid);
    } catch (err) {
        console.log(err);
    }
};
import { loginUser } from "../services/authService";
import { supabase } from "../supabase/supabase";
import { updateStreak } from "../utils/streak";

const handleLoginSuccess = async (userId) => {
    // 1. Get user data
    const { data } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

    const newStreak = updateStreak(data.last_login, data.streak);

    // 2. Update in DB
    await supabase
        .from("users")
        .update({
            streak: newStreak,
            last_login: new Date()
        })
        .eq("id", userId);
};
import { supabase } from "../supabase/supabase";
import { useState } from "react";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // 🔥 THIS IS WHERE YOUR CODE GOES
    const handleLogin = async () => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            console.log(error);
            return;
        }

        // ✅ PASTE HERE
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