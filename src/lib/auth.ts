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

// ── Supabase session check ────────────────────────────────────────
export async function getSupabaseSession() {
    return null;
}
