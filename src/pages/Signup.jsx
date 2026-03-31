import { useState } from "react";
import { supabase } from "../supabase/supabase";

export default function Signup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const signup = async () => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password
        });

        if (error) {
            console.log(error.message);
            alert("Signup failed");
        } else {
            alert("Signup successful! Check email");
        }
    };

    return (
        <div>
            <h2>Signup</h2>
            <input type="email" onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
            <input type="password" onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
            <button onClick={signup}>Signup</button>
        </div>
    );
}