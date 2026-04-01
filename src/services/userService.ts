import { supabase } from "../supabase/supabase";

export interface UserRecord {
    id: string;
    score: number;
    streak: number;
    mistakes: number;
}

const API_URL = "http://localhost:5000/api/users";

export const addUserData = async (userId: string): Promise<void> => {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id: userId,
                score: 0,
                streak: 0,
                mistakes: 0
            }),
        });
        if (!response.ok) {
            const error = await response.json();
            console.error("Error adding user data:", error);
        }
    } catch (error) {
        console.error("Network error adding user data:", error);
    }
};

export const updateUserScore = async (userId: string, score: number): Promise<void> => {
    try {
        const response = await fetch(`${API_URL}/${userId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ score }),
        });
        if (!response.ok) {
            const error = await response.json();
            console.error("Error updating user score:", error);
        }
    } catch (error) {
        console.error("Network error updating user score:", error);
    }
};

export const getUserData = async (userId: string): Promise<UserRecord | null> => {
    try {
        const response = await fetch(`${API_URL}/${userId}`);
        if (!response.ok) {
            if (response.status === 404) return null;
            const error = await response.json();
            console.error("Error fetching user data:", error);
            return null;
        }
        const data = await response.json();
        return data as UserRecord;
    } catch (error) {
        console.error("Network error fetching user data:", error);
        return null;
    }
};