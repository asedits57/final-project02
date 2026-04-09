import { apiClient } from "@services/apiClient";

export type LearningVideoRecord = {
  _id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  thumbnail?: string;
  videoUrl: string;
  sourceType?: "external" | "upload";
  duration?: number;
  tags: string[];
  visibility: "public" | "authenticated" | "private";
  status: "draft" | "published" | "archived";
  createdAt: string;
};

export type DailyTaskQuestionRecord = {
  order: number;
  question: {
    _id: string;
    title: string;
    questionText: string;
    questionType: "multiple_choice" | "true_false" | "short_answer" | "fill_blank";
    options?: string[];
    difficulty?: "easy" | "medium" | "hard";
    category?: string;
    points?: number;
    explanation?: string;
  };
};

export type ActiveDailyTaskRecord = {
  _id: string;
  title: string;
  description: string;
  rewardPoints: number;
  activeDate: string;
  expiryDate: string;
  assignedQuestions: DailyTaskQuestionRecord[];
  submission?: {
    score?: number;
    maxScore?: number;
    earnedPoints?: number;
    submittedAt?: string;
  } | null;
};

export type LearningTaskRecord = {
  _id: string;
  title: string;
  description: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  rewardPoints: number;
  questionCount?: number;
  dueDate?: string;
  createdAt: string;
  submission?: {
    score?: number;
    earnedPoints?: number;
    submittedAt?: string;
  } | null;
};

export type LearningCompletionRecord = {
  _id: string;
  contentType: "guide" | "video";
  contentKey: string;
  title: string;
  category: string;
  pointsAwarded: number;
  completedAt: string;
  videoId?: string;
};

export type LearningProgressSummary = {
  completedGuides: LearningCompletionRecord[];
  completedVideos: LearningCompletionRecord[];
  totalLearningPoints: number;
};

type ProgressUserSnapshot = {
  id: string;
  score: number;
  level: number;
  streak: number;
};

export type DailyTaskSubmissionResult = {
  submission: {
    _id: string;
    score: number;
    maxScore: number;
    earnedPoints: number;
    submittedAt?: string;
  };
  score: number;
  maxScore: number;
  earnedPoints: number;
  user: ProgressUserSnapshot;
};

export type LearningCompletionResult = {
  completion: LearningCompletionRecord;
  alreadyCompleted: boolean;
  awardedPoints: number;
  user?: ProgressUserSnapshot;
};

type DataResponse<T> = {
  success: boolean;
  data: T;
};

export const learningContentService = {
  listLearningVideos(): Promise<DataResponse<LearningVideoRecord[]>> {
    return apiClient<DataResponse<LearningVideoRecord[]>>("/videos");
  },

  listLearnerTasks(): Promise<DataResponse<LearningTaskRecord[]>> {
    return apiClient<DataResponse<LearningTaskRecord[]>>("/tasks");
  },

  getActiveDailyTask(): Promise<DataResponse<ActiveDailyTaskRecord | null>> {
    return apiClient<DataResponse<ActiveDailyTaskRecord | null>>("/daily-tasks/active");
  },

  submitDailyTask(
    dailyTaskId: string,
    answers: Array<{ questionId: string; answer: string | number | boolean | string[] }>,
  ): Promise<DataResponse<DailyTaskSubmissionResult>> {
    return apiClient<DataResponse<DailyTaskSubmissionResult>>(`/daily-tasks/${dailyTaskId}/submit`, {
      method: "POST",
      body: JSON.stringify({ answers }),
    });
  },

  getLearningProgress(): Promise<DataResponse<LearningProgressSummary>> {
    return apiClient<DataResponse<LearningProgressSummary>>("/learning/progress");
  },

  completeLearningGuide(guideKey: string): Promise<DataResponse<LearningCompletionResult>> {
    return apiClient<DataResponse<LearningCompletionResult>>(`/learning/guides/${guideKey}/complete`, {
      method: "POST",
    });
  },

  completeLearningVideo(videoId: string): Promise<DataResponse<LearningCompletionResult>> {
    return apiClient<DataResponse<LearningCompletionResult>>(`/learning/videos/${videoId}/complete`, {
      method: "POST",
    });
  },
};
