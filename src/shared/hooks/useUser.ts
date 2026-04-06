import { useQuery } from "@tanstack/react-query";
import { userService } from "@core/userService";
import { useAuthStore } from "@core/useAuthStore";
import { useEffect } from "react";

export const useUser = () => {
    const setUser = useAuthStore((state) => state.setUser);
    const currentUser = useAuthStore((state) => state.user);

    const query = useQuery({
        queryKey: ["user", "profile"],
        queryFn: userService.getProfile,
        retry: 1, // Only retry once if not authorized
        staleTime: 10 * 60 * 1000, // 10 minutes
    });

    // Synchronize with Auth Store
    useEffect(() => {
        if (query.data) {
            setUser(query.data);
        } else if (query.isError) {
            setUser(null);
        }
    }, [query.data, query.isError, setUser]);

    return {
        ...query,
        user: query.data || currentUser,
    };
};
