
import { supabase } from "./src/integrations/supabase/client";

async function checkTables() {
    const { data, error } = await supabase.from('profiles').select('*').limit(1);
    if (error) {
        if (error.code === '42P01') {
            console.log("Profiles table does not exist.");
        } else {
            console.log("Error checking profiles:", error.message);
        }
    } else {
        console.log("Profiles table exists.");
    }

    const { data: lbData, error: lbError } = await supabase.from('leaderboard_users').select('*').limit(1);
    if (lbError) {
        console.log("Leaderboard table error:", lbError.message);
    } else {
        console.log("Leaderboard table exists.");
    }
}

checkTables();
