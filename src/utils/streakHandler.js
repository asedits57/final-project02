import { supabase } from "../supabase/supabase";
import { updateStreak } from "./streak";

export const handleLoginSuccess = async (userId) => {
    const { data } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

    const newStreak = updateStreak(data.last_login, data.streak);

    await supabase
        .from("users")
        .update({
            streak: newStreak,
            last_login: new Date()
        })
        .eq("id", userId);
};