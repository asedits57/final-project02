import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getUser } from "@/lib/auth";
import { syncUserProfile } from "@/lib/leaderboard-supabase";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";

interface AuthGuardProps {
    children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
    const navigate = useNavigate();
    const [authed, setAuthed] = useState<boolean | null>(null);

    useEffect(() => {
        // Check Supabase session first, fall back to localStorage for legacy users
        supabase.auth.getSession().then(({ data }) => {
            if (data.session) {
                setAuthed(true);
                // Sync profile to leaderboard if missing or update
                syncUserProfile({
                    id: data.session.user.id,
                    username: data.session.user.user_metadata?.username || data.session.user.email?.split('@')[0] || 'User',
                    avatar_url: data.session.user.user_metadata?.avatar_url
                }).catch(console.error);
            } else if (getUser()) { // Fallback for legacy users
                setAuthed(true);
            } else {
                setAuthed(false);
                navigate("/login", { replace: true });
            }
        });

        // Listen for auth state changes (e.g. sign out)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === "SIGNED_OUT") {
                setAuthed(false);
                navigate("/login", { replace: true });
            } else if (session) {
                setAuthed(true);
            }
        });

        return () => subscription.unsubscribe();
    }, [navigate]);

    if (authed === null) {
        // Briefly show nothing while checking session (faster than a loader)
        return null;
    }

    if (!authed) return null;

    return <>{children}</>;
}
