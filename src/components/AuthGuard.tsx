import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useStore } from "@/store/useStore";
import { syncUserProfile } from "@/lib/leaderboard-supabase";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";

interface AuthGuardProps {
    children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
    const navigate = useNavigate();
    const [authed, setAuthed] = useState<boolean | null>(null);

    const setStoreUser = useStore(s => s.setUser);

    useEffect(() => {
        // Check Supabase session first
        supabase.auth.getSession().then(({ data }) => {
            if (data.session) {
                setAuthed(true);
                const user = data.session.user;
                const meta = user.user_metadata;
                
                // Keep store in sync
                setStoreUser({
                    id: user.id || "",
                    username: meta?.username || user.email?.split('@')[0] || 'User',
                    fullName: meta?.fullName ?? null,
                    dept: meta?.dept ?? null,
                    email: user.email ?? null,
                    level: meta?.level ? (meta.level === "beginner" ? 1 : meta.level === "intermediate" ? 2 : meta.level === "advanced" ? 3 : 4) : 1,
                    xp: meta?.xp || 0,
                    streak: meta?.streak || 0,
                });

                // Sync profile to leaderboard
                syncUserProfile({
                    id: user.id,
                    username: meta?.username || user.email?.split('@')[0] || 'User',
                    avatar_url: meta?.avatar_url
                }).catch(console.error);
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
    }, [navigate, setStoreUser]);

    if (authed === null) {
        // Briefly show nothing while checking session (faster than a loader)
        return null;
    }

    if (!authed) return null;

    return <>{children}</>;
}
