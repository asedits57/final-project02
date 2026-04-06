import { useQuery } from "@tanstack/react-query";
import { userService } from "@core/userService";

export const useLeaderboard = () => {
    return useQuery({
        queryKey: ["leaderboard"],
        queryFn: userService.getLeaderboard,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};
