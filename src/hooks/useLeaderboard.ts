import { useQuery } from "@tanstack/react-query";
import { userService } from "@services/userService";

export const useLeaderboard = () => {
    return useQuery({
        queryKey: ["leaderboard"],
        queryFn: userService.fetchLeaderboard,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};
