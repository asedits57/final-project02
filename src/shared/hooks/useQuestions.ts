import { useQuery } from "@tanstack/react-query";
import { questionService } from "@shared/questionService";

export const useQuestions = () => {
    return useQuery({
        queryKey: ["questions"],
        queryFn: questionService.fetchQuestions,
        staleTime: 60 * 60 * 1000, // 1 hour (as these change rarely)
    });
};
