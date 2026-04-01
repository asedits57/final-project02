import { supabase } from "../supabase/supabase";

interface UserRecord {
    id: string;
    score: number;
    streak: number;
    mistakes: number;
}

export const addUserData = async (userId: string): Promise<void> => {
    const { error } = await supabase
        .from("users")
        .insert([
            {
                id: userId,
                score: 0,
                streak: 0,
                mistakes: 0
            } satisfies UserRecord
        ]);

    if (error) console.log(error);
};

export const updateUserScore = async (userId: string, score: number): Promise<void> => {
    const { error } = await supabase
        .from("users")
        .update({ score })
        .eq("id", userId);

    if (error) console.log(error);
};

export const getUserData = async (userId: string): Promise<UserRecord | null> => {
    const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

    if (error) {
        console.log(error);
        return null;
    }

    return data as UserRecord;
};
