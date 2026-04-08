import { useQuery } from "@tanstack/react-query";
import { userService } from "@services/userService";
import { useAuthStore } from "@store/useAuthStore";
import { useEffect } from "react";

export const useUser = () => {
    const setUser = useAuthStore((state) => state.setUser);
    const currentUser = useAuthStore((state) => state.user);

    const hasToken = !!(typeof window !== "undefined" && localStorage.getItem("token") && localStorage.getItem("token") !== "undefined");

    const query = useQuery({
        queryKey: ["user", "profile"],
        queryFn: userService.fetchProfile,
        enabled: hasToken,  // Don't fire if no token — avoids a guaranteed 401
        retry: false,       // apiClient handles refresh token flow internally
        staleTime: 10 * 60 * 1000, // 10 minutes
    });

    // Sync successful profile data into the auth store
    useEffect(() => {
        if (query.data) {
            setUser(query.data);
        }
        // Don't wipe the store user on error – keeps users logged in
        // during transient network failures or while cookie refresh runs
    }, [query.data, setUser]);

    return {
        ...query,
        user: query.data || currentUser,
    };
};
