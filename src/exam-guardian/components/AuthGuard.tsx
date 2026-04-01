import { useEffect, useState, ReactNode } from "react";
import { supabase } from "../../supabase/supabase";
import { User } from "@supabase/supabase-js";

interface AuthGuardProps {
    children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps): JSX.Element {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const checkUser = async (): Promise<void> => {
            const { data } = await supabase.auth.getUser();
            setUser(data.user);
            setLoading(false);
        };

        checkUser();
    }, []);

    if (loading) return <div>Loading...</div>;

    if (!user) return <div>Please login</div>;

    return <>{children}</>;
}
