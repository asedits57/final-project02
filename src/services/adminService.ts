import { apiClient } from "@services/apiClient";

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type AdminListResponse<T> = {
  success: boolean;
  items: T[];
  pagination: Pagination;
};

type AdminDataResponse<T> = {
  success: boolean;
  data: T;
};

export type AdminInviteRecord = {
  inviteId: string;
  email: string;
  status: "pending" | "accepted" | "declined" | "expired" | "revoked";
  expiresAt: string;
  loginUrl: string;
  acceptUrl: string;
  declineUrl: string;
};

export type AdminActivityItem = {
  _id: string;
  action: string;
  description: string;
  targetType?: string;
  targetId?: string;
  createdAt: string;
  actor?: {
    _id: string;
    email: string;
    fullName?: string;
    role?: string;
  };
};

export type AdminDashboardOverview = {
  totalUsers: number;
  activeUsers: number;
  totalQuestions: number;
  publishedQuestions: number;
  totalTasks: number;
  totalDailyTasks: number;
  totalLearningVideos: number;
  totalFinalTestSubmissions: number;
  pendingFinalTestReviews: number;
  certificatesIssued: number;
  leaderboard: {
    activeUsers: number;
    topUsers: Array<{
      id?: string;
      _id?: string;
      email: string;
      score: number;
      streak: number;
      level: number;
      isLive?: boolean;
      liveModules?: string[];
    }>;
    updatedAt: string;
  };
  recentActivity: AdminActivityItem[];
};

export type AdminUserRecord = {
  _id: string;
  id?: string;
  email: string;
  fullName?: string;
  username?: string;
  dept?: string;
  level?: number;
  score: number;
  streak: number;
  role: "user" | "admin";
  status: "active" | "suspended";
  createdAt: string;
  lastActive?: string;
};

export type AdminQuestionRecord = {
  _id: string;
  title: string;
  questionText: string;
  questionType: "multiple_choice" | "true_false" | "short_answer" | "fill_blank";
  difficulty: "easy" | "medium" | "hard";
  category: string;
  tags: string[];
  points: number;
  status: "draft" | "published" | "archived";
  targetType: "task" | "daily-task" | "both";
  timeLimit?: number;
  priority?: number;
  createdAt: string;
};

export type CreateAdminQuestionPayload = {
  title: string;
  questionText: string;
  questionType: "multiple_choice" | "true_false" | "short_answer" | "fill_blank";
  options: string[];
  correctAnswer?: string | number | boolean | string[];
  explanation?: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
  tags: string[];
  points: number;
  status: "draft" | "published" | "archived";
  targetType: "task" | "daily-task" | "both";
  timeLimit?: number;
  priority?: number;
};

export type AdminTaskRecord = {
  _id: string;
  title: string;
  description: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  rewardPoints: number;
  status: "draft" | "published" | "archived";
  dueDate?: string;
  questionCount?: number;
  createdAt: string;
};

export type CreateAdminTaskPayload = {
  title: string;
  description: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  dueDate?: string;
  rewardPoints: number;
  status: "draft" | "published" | "archived";
  assignedQuestions: Array<{
    questionId: string;
    order: number;
  }>;
  simpleQuestions?: Array<{
    questionText: string;
    correctAnswer?: string;
    explanation?: string;
    points?: number;
  }>;
};

export type AdminDailyTaskRecord = {
  _id: string;
  title: string;
  description: string;
  rewardPoints: number;
  status: "draft" | "published" | "archived";
  activeDate: string;
  expiryDate: string;
  createdAt: string;
};

export type AdminVideoRecord = {
  _id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  videoUrl: string;
  sourceType?: "external" | "upload";
  thumbnail?: string;
  duration?: number;
  tags: string[];
  visibility: "public" | "authenticated" | "private";
  status: "draft" | "published" | "archived";
  createdAt: string;
};

export type CreateAdminVideoPayload = {
  title: string;
  description: string;
  category: string;
  level: string;
  thumbnail?: string;
  videoUrl?: string;
  upload?: {
    dataUrl: string;
    mimeType?: string;
    fileName?: string;
    sizeBytes?: number;
  };
  duration: number;
  tags: string[];
  visibility: "public" | "authenticated" | "private";
  status: "draft" | "published" | "archived";
};

export type AdminFinalTestRecord = {
  _id: string;
  testTitle: string;
  testCategory: string;
  score: number;
  flags: string[];
  recommendation?: string;
  responseTranscript?: string;
  reviewStatus: "pending" | "approved" | "rejected" | "reviewed" | "re_evaluation_requested";
  adminNotes?: string;
  createdAt: string;
  reviewedAt?: string;
  aiEvaluation?: Record<string, unknown>;
  proctoring?: {
    riskScore?: number;
    events?: Array<{
      time: string;
      message: string;
      type: "info" | "success" | "warning" | "danger";
      source: "camera" | "voice" | "screen" | "system";
    }>;
  };
  recordings?: {
    audio?: {
      url: string;
      mimeType?: string;
      durationSeconds?: number;
      sizeBytes?: number;
    };
    video?: {
      url: string;
      mimeType?: string;
      durationSeconds?: number;
      sizeBytes?: number;
    };
  };
  user?: {
    _id: string;
    email: string;
    fullName?: string;
    username?: string;
    score?: number;
    level?: number;
    streak?: number;
  };
  reviewedBy?: {
    _id: string;
    email: string;
    fullName?: string;
    role?: string;
  };
};

export const adminService = {
  getDashboard(): Promise<AdminDataResponse<AdminDashboardOverview>> {
    return apiClient<AdminDataResponse<AdminDashboardOverview>>("/admin/dashboard");
  },

  listUsers(params?: Record<string, string | number | undefined>): Promise<AdminListResponse<AdminUserRecord>> {
    const query = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        query.set(key, String(value));
      }
    });

    return apiClient<AdminListResponse<AdminUserRecord>>(`/admin/users${query.size ? `?${query.toString()}` : ""}`);
  },

  updateUserRole(userId: string, role: "user" | "admin"): Promise<AdminDataResponse<AdminUserRecord>> {
    return apiClient<AdminDataResponse<AdminUserRecord>>(`/admin/users/${userId}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });
  },

  updateUserStatus(userId: string, status: "active" | "suspended"): Promise<AdminDataResponse<AdminUserRecord>> {
    return apiClient<AdminDataResponse<AdminUserRecord>>(`/admin/users/${userId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  inviteAdmin(payload: { email: string; message?: string }): Promise<AdminDataResponse<AdminInviteRecord>> {
    return apiClient<AdminDataResponse<AdminInviteRecord>>("/admin/invitations", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  listQuestions(params?: Record<string, string | number | undefined>): Promise<AdminListResponse<AdminQuestionRecord>> {
    const query = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        query.set(key, String(value));
      }
    });

    return apiClient<AdminListResponse<AdminQuestionRecord>>(`/admin/questions${query.size ? `?${query.toString()}` : ""}`);
  },

  createQuestion(payload: CreateAdminQuestionPayload): Promise<AdminDataResponse<AdminQuestionRecord>> {
    return apiClient<AdminDataResponse<AdminQuestionRecord>>("/admin/questions", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  listTasks(params?: Record<string, string | number | undefined>): Promise<AdminListResponse<AdminTaskRecord>> {
    const query = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        query.set(key, String(value));
      }
    });

    return apiClient<AdminListResponse<AdminTaskRecord>>(`/admin/tasks${query.size ? `?${query.toString()}` : ""}`);
  },

  createTask(payload: CreateAdminTaskPayload): Promise<AdminDataResponse<AdminTaskRecord>> {
    return apiClient<AdminDataResponse<AdminTaskRecord>>("/admin/tasks", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  listDailyTasks(params?: Record<string, string | number | undefined>): Promise<AdminListResponse<AdminDailyTaskRecord>> {
    const query = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        query.set(key, String(value));
      }
    });

    return apiClient<AdminListResponse<AdminDailyTaskRecord>>(`/admin/daily-tasks${query.size ? `?${query.toString()}` : ""}`);
  },

  listVideos(params?: Record<string, string | number | undefined>): Promise<AdminListResponse<AdminVideoRecord>> {
    const query = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        query.set(key, String(value));
      }
    });

    return apiClient<AdminListResponse<AdminVideoRecord>>(`/admin/videos${query.size ? `?${query.toString()}` : ""}`);
  },

  createVideo(payload: CreateAdminVideoPayload): Promise<AdminDataResponse<AdminVideoRecord>> {
    return apiClient<AdminDataResponse<AdminVideoRecord>>("/admin/videos", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  listFinalTests(params?: Record<string, string | number | undefined>): Promise<AdminListResponse<AdminFinalTestRecord>> {
    const query = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        query.set(key, String(value));
      }
    });

    return apiClient<AdminListResponse<AdminFinalTestRecord>>(`/admin/final-tests${query.size ? `?${query.toString()}` : ""}`);
  },

  getFinalTest(finalTestId: string): Promise<AdminDataResponse<AdminFinalTestRecord>> {
    return apiClient<AdminDataResponse<AdminFinalTestRecord>>(`/admin/final-tests/${finalTestId}`);
  },

  reviewFinalTest(
    finalTestId: string,
    payload: { reviewStatus: AdminFinalTestRecord["reviewStatus"]; adminNotes?: string },
  ): Promise<AdminDataResponse<AdminFinalTestRecord>> {
    return apiClient<AdminDataResponse<AdminFinalTestRecord>>(`/admin/final-tests/${finalTestId}/review`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
};
