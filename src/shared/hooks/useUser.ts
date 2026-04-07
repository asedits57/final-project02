import { useQuery } from "@tanstack/react-query";
import { userService } from "@core/userService";
import { useAuthStore } from "@core/useAuthStore";
import { setAccessToken } from "@shared/apiClient";
import { useEffect, useMemo } from "react";

export const useUser = () => {
    const setUser = useAuthStore((state) => state.setUser);
    const currentUser = useAuthStore((state) => state.user);

    // Restore in-memory access token from localStorage on page refresh.
    // useMemo ensures this runs once per hook mount, not on every render.
    useMemo(() => {
        const storedToken = localStorage.getItem("token");
        if (storedToken && storedToken !== "undefined") {
            setAccessToken(storedToken);
        }
    }, []);

    const query = useQuery({
        queryKey: ["user", "profile"],
        queryFn: userService.getProfile,
        retry: false,   // apiClient handles refresh token flow internally
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
