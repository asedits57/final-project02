import { supabase } from "@/integrations/supabase/client";

const USER_KEY = "li_user";

export type UserLevel = "beginner" | "intermediate" | "advanced" | "expert";

export interface AuthUser {
    id?: string;
    username: string;
    fullName?: string | null;
    dept?: string | null;
    email?: string | null;
    phoneNumber?: string | null;
    level?: UserLevel | null;
}

// ── Legacy localStorage helpers (kept for compatibility) ──────────
export function getUser(): AuthUser | null {
    try {
        const raw = localStorage.getItem(USER_KEY);
        return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
        return null;
    }
}

export function setUser(user: AuthUser): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearUser(): void {
    localStorage.removeItem(USER_KEY);
    supabase.auth.signOut();
}

// ── Supabase session check ────────────────────────────────────────
export async function getSupabaseSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
}
