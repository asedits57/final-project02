import { supabase } from "../supabase/supabase";
import { updateStreak } from "./streak";

export const handleLoginSuccess = async (userId: string): Promise<void> => {
    const { data } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

    if (!data) return;

    const newStreak = updateStreak(data.last_login as string, data.streak as number);

    await supabase
        .from("users")
        .update({
            streak: newStreak,
            last_login: new Date().toISOString()
        })
        .eq("id", userId);
};
