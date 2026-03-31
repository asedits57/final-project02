import { useEffect, useState } from "react";
import { supabase } from "../supabase/supabase";

export default function AuthGuard({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            const { data } = await supabase.auth.getUser();
            setUser(data.user);
            setLoading(false);
        };

        checkUser();
    }, []);

    if (loading) return <div>Loading...</div>;

    if (!user) return <div>Please login</div>;

    return children;
}