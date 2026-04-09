import { Request } from "express";

export type UserRole = "user" | "admin";
export type UserStatus = "active" | "suspended";

export type AuthenticatedUser = {
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
  verifiedAt?: string | Date;
  score: number;
  streak: number;
  level: number;
  role: UserRole;
  status: UserStatus;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

export type AuthenticatedRequest = Request & {
  user?: AuthenticatedUser;
};
