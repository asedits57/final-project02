export interface LeaderboardUser {
    id: string;
    username: string;
    xp: number;
    level: number;
    avatar_url: string;
    weekly_xp: number;
    rank: number;
    created_at: string;
    updated_at: string;
    is_live?: boolean;
    live_modules?: string[];
    is_current_user?: boolean;
}

export interface Database {
    public: {
        Tables: {
            leaderboard_users: {
                Row: LeaderboardUser;
                Insert: Omit<LeaderboardUser, "created_at" | "updated_at">;
                Update: Partial<Omit<LeaderboardUser, "id" | "created_at" | "updated_at">>;
                Relationships: [];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            [_ in never]: never;
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
}
