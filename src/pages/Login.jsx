import { useState } from "react";
import { supabase } from "../supabase/supabase";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const login = async () => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            console.log(error.message);
            alert("Login failed");
        } else {
            alert("Login success");
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <input type="email" onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
            <input type="password" onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
            <button onClick={login}>Login</button>
        </div>
    );
}