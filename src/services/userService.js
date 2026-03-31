const addUserData = async (userId) => {
    const { error } = await supabase
        .from("users")
        .insert([
            {
                id: userId,
                score: 0,
                streak: 0,
                mistakes: 0
            }
        ]);

    if (error) console.log(error);
};
await supabase
    .from("users")
    .update({ score: 120 })
    .eq("id", userId);
const { data } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId);