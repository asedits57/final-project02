import { createClient } from '@supabase/supabase-js';
import type { Database } from './leaderboard-types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export async function updateUserXP(userId: string, xpToAdd: number) {
    const { data: user, error: fetchError } = await (supabase
        .from('leaderboard_users' as any) as any)
        .select('xp, weekly_xp')
        .eq('id', userId)
        .single();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

    if (user) {
        const { error: updateError } = await (supabase
            .from('leaderboard_users' as any) as any)
            .update({
                xp: (user.xp || 0) + xpToAdd,
                weekly_xp: (user.weekly_xp || 0) + xpToAdd,
            })
            .eq('id', userId);
        if (updateError) throw updateError;
    }
}

export async function syncUserProfile(profile: { id: string; username: string; avatar_url?: string }) {
    const { error } = await (supabase
        .from('leaderboard_users' as any) as any)
        .upsert({
            id: profile.id,
            username: profile.username,
            avatar_url: profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`,
            xp: 0,
            level: 1,
            weekly_xp: 0,
            rank: 999,
        }, { onConflict: 'id' });
    
    if (error) throw error;
}
