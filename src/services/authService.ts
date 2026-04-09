import { apiClient, setAccessToken } from "@services/apiClient";

export interface User {
  id: string;
  _id?: string;
  email: string;
  fullName?: string;
  username?: string;
  dept?: string;
  avatar?: string;
  oauthProvider?: "local" | "google" | "github";
  isVerified?: boolean;
  hasPassword?: boolean;
  verifiedAt?: string;
  score: number;
  streak: number;
  level: number;
  role?: string;
  status?: string;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  user: User;
  accessToken: string;
  message?: string;
}

export interface OtpSessionResponse {
  success: boolean;
  message: string;
  email: string;
  requestId: string;
  expiresIn: number;
  resendAvailableIn: number;
  expiresAt: string;
  resendAvailableAt: string;
}

export interface GoogleCallbackResponse extends AuthResponse {
  verified: boolean;
  redirectTo: string;
  email?: string;
  requestId?: string;
  expiresIn?: number;
  resendAvailableIn?: number;
  expiresAt?: string;
  resendAvailableAt?: string;
}

export interface OtpVerifyResponse {
  success: boolean;
  message: string;
  verified: boolean;
  next: string;
  requiresProfileCompletion?: boolean;
  user?: User;
}

export interface GoogleAuthConfigResponse {
  success: boolean;
  enabled: boolean;
  clientId: string | null;
  redirectUri: string | null;
}

export interface CompleteGoogleProfileResponse {
  success: boolean;
  message: string;
  user: User;
}

export interface SignupOtpVerifyResponse {
  success: boolean;
  message: string;
  verified: boolean;
  requestId: string;
  email: string;
}

export interface AdminInviteDecisionResponse {
  success: boolean;
  data: {
    email: string;
    status: "accepted" | "declined";
    message: string;
    loginUrl: string;
    signupUrl: string;
    userExists: boolean;
    roleGrantedNow: boolean;
  };
}

export const authService = {
  async register(
    email: string,
    password: string,
    fullName?: string,
    username?: string,
    dept?: string,
    requestId?: string,
  ): Promise<AuthResponse> {
    const data = await apiClient<AuthResponse>("/auth/register", { 
      method: "POST", 
      body: JSON.stringify({ email, password, fullName, username, dept, requestId }) 
    });
    setAccessToken(data.accessToken);
    return data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const data = await apiClient<AuthResponse>("/auth/login", { 
      method: "POST", 
      body: JSON.stringify({ email, password }) 
    });
    setAccessToken(data.accessToken);
    return data;
  },

  async handleGoogleCallback(code: string, redirectUri: string): Promise<GoogleCallbackResponse> {
    const data = await apiClient<GoogleCallbackResponse>("/auth/google/callback-handler", {
      method: "POST",
      body: JSON.stringify({ code, redirectUri }),
    });
    setAccessToken(data.accessToken);
    return data;
  },

  async getGoogleAuthConfig(): Promise<GoogleAuthConfigResponse> {
    return apiClient<GoogleAuthConfigResponse>("/auth/google/config");
  },

  async sendOtp(email: string): Promise<OtpSessionResponse> {
    return apiClient<OtpSessionResponse>("/auth/otp/send", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  async resendOtp(requestId: string): Promise<OtpSessionResponse> {
    return apiClient<OtpSessionResponse>("/auth/otp/resend", {
      method: "POST",
      body: JSON.stringify({ requestId }),
    });
  },

  async getOtpSession(requestId: string): Promise<OtpSessionResponse> {
    return apiClient<OtpSessionResponse>("/auth/otp/session", {
      method: "POST",
      body: JSON.stringify({ requestId }),
    });
  },

  async verifyOtp(requestId: string, otp: string): Promise<OtpVerifyResponse> {
    return apiClient<OtpVerifyResponse>("/auth/otp/verify", {
      method: "POST",
      body: JSON.stringify({ requestId, otp }),
    });
  },

  async sendSignupOtp(email: string): Promise<OtpSessionResponse> {
    return apiClient<OtpSessionResponse>("/auth/signup-otp/send", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  async resendSignupOtp(requestId: string): Promise<OtpSessionResponse> {
    return apiClient<OtpSessionResponse>("/auth/signup-otp/resend", {
      method: "POST",
      body: JSON.stringify({ requestId }),
    });
  },

  async verifySignupOtp(requestId: string, otp: string): Promise<SignupOtpVerifyResponse> {
    return apiClient<SignupOtpVerifyResponse>("/auth/signup-otp/verify", {
      method: "POST",
      body: JSON.stringify({ requestId, otp }),
    });
  },

  async respondToAdminInvite(token: string, action: "accept" | "decline"): Promise<AdminInviteDecisionResponse> {
    return apiClient<AdminInviteDecisionResponse>("/auth/admin-invite/respond", {
      method: "POST",
      body: JSON.stringify({ token, action }),
    });
  },

  async completeGoogleProfile(fullName: string, password: string): Promise<CompleteGoogleProfileResponse> {
    return apiClient<CompleteGoogleProfileResponse>("/auth/google/complete-profile", {
      method: "POST",
      body: JSON.stringify({ fullName, password }),
    });
  },

  async logout(): Promise<void> {
    await apiClient<void>("/auth/logout", { method: "POST" });
    setAccessToken(null);
  }
};
