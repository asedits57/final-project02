import { useState } from "react";
import { supabase } from "../supabase/supabase";

export default function Signup(): JSX.Element {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const signup = async (): Promise<void> => {
        const { error } = await supabase.auth.signUp({
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
