import { useState } from "react";

export default function Signup(): JSX.Element {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const signup = async (): Promise<void> => {
        alert("Signup successful! Check email");
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
