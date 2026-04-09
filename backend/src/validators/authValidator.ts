import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(6),
  fullName: z.string().trim().optional(),
  username: z.string().trim().optional(),
  dept: z.string().trim().optional(),
  requestId: z.string().trim().uuid(),
});

export const loginSchema = z.object({
  email: z.string().trim().min(1),
  password: z.string().min(1),
});

export const googleCallbackSchema = z.object({
  code: z.string().trim().min(1),
  redirectUri: z.string().trim().url().optional(),
});

export const otpSendSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

export const otpResendSchema = z.object({
  requestId: z.string().trim().uuid(),
});

export const otpSessionSchema = z.object({
  requestId: z.string().trim().uuid(),
});

export const otpVerifySchema = z.object({
  requestId: z.string().trim().uuid(),
  otp: z.string().trim().regex(/^\d{6}$/, "OTP must be a 6-digit code"),
});

export const completeGoogleProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  password: z.string().min(6),
});

export const signupOtpSendSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

export const signupOtpResendSchema = z.object({
  requestId: z.string().trim().uuid(),
});

export const signupOtpVerifySchema = z.object({
  requestId: z.string().trim().uuid(),
  otp: z.string().trim().regex(/^\d{6}$/, "OTP must be a 6-digit code"),
});

export const respondAdminInviteSchema = z.object({
  token: z.string().trim().min(1),
  action: z.enum(["accept", "decline"]),
});
