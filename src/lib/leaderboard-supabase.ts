import { supabase } from '@/integrations/supabase/client';
export { supabase };
import type { Database } from '@/integrations/supabase/types';

export type LeaderboardUser = Database['public']['Tables']['leaderboard_users']['Row'];

// Use a type-safe helper for the leaderboard table
const leaderboardTable = () => supabase.from('leaderboard_users');

export async function updateUserXP(userId: string, xpToAdd: number) {
    const { data: user, error: fetchError } = await leaderboardTable()
        .select('xp, weekly_xp')
        .eq('id', userId)
        .single();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

    if (user) {
        const { error: updateError } = await leaderboardTable()
            .update({
                xp: (user.xp || 0) + xpToAdd,
                weekly_xp: (user.weekly_xp || 0) + xpToAdd,
            })
            .eq('id', userId);
        if (updateError) throw updateError;
    }
}

export async function syncUserProfile(profile: { id: string; username: string; avatar_url?: string }) {
    const { error } = await leaderboardTable()
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
