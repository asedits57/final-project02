import { Request, Response } from "express";
import * as authService from "../services/authService";
import * as otpService from "../services/otpService";
import {
  completeGoogleProfileSchema,
  googleCallbackSchema,
  loginSchema,
  otpResendSchema,
  otpSendSchema,
  otpSessionSchema,
  otpVerifySchema,
  registerSchema,
  respondAdminInviteSchema,
  signupOtpResendSchema,
  signupOtpSendSchema,
  signupOtpVerifySchema,
} from "../validators/authValidator";
import jwt from "jsonwebtoken";
import { generateAccessToken } from "../utils/generateToken";
import catchAsync from "../utils/catchAsync";
import ApiError from "../utils/ApiError";
import { respondToAdminInvite } from "../services/adminInviteService";
import User from "../models/User";

type AuthenticatedUser = {
  _id?: { toString(): string };
  id?: string;
  email: string;
  isVerified?: boolean;
  oauthProvider?: string;
};

type AuthenticatedRequest = Request & {
  user?: AuthenticatedUser;
};

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const setRefreshCookie = (res: Response, refreshToken: string) => {
  res.cookie("jwt_refresh", refreshToken, COOKIE_OPTIONS);
};

const getRequestContext = (req: Request) => ({
  ip: req.ip,
  userAgent: req.get("user-agent"),
});

const getAuthenticatedUser = (req: Request) => {
  const user = (req as AuthenticatedRequest).user;

  if (!user) {
    throw new ApiError(401, "Not authorized, user not found");
  }

  return user;
};

const getAuthenticatedUserId = (user: AuthenticatedUser) => {
  const userId = user.id || user._id?.toString();

  if (!userId) {
    throw new ApiError(401, "Not authorized, user not found");
  }

  return userId;
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  return "Invalid or expired OTP";
};

const ensureGoogleAuthenticatedUser = (user: AuthenticatedUser) => {
  if (user.oauthProvider !== "google") {
    throw new ApiError(403, "OTP verification is only available for Google sign-ins");
  }
};

export const getGoogleAuthConfig = (req: Request, res: Response) => {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const redirectUri = process.env.GOOGLE_REDIRECT_URI?.trim();

  res.json({
    success: true,
    enabled: Boolean(clientId && redirectUri),
    clientId: clientId || null,
    redirectUri: redirectUri || null,
  });
};

// REGISTER
export const registerUser = catchAsync(async (req: Request, res: Response) => {
  const parsedData = registerSchema.parse(req.body);
  const { email, password, fullName, username, dept, requestId } = parsedData;
  const { message, accessToken, refreshToken, user } = await authService.registerUser(
    email,
    password,
    fullName,
    username,
    dept,
    requestId,
    getRequestContext(req),
  );
  
  setRefreshCookie(res, refreshToken);
  res.json({ success: true, message, accessToken, user });
});

// LOGIN
export const loginUser = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = loginSchema.parse(req.body);

  const { message, accessToken, refreshToken, user } = await authService.loginUser(email, password);
  
  setRefreshCookie(res, refreshToken);
  res.json({ success: true, message, accessToken, user });
});

// GOOGLE CALLBACK HANDLER
export const handleGoogleCallback = catchAsync(async (req: Request, res: Response) => {
  const { code, redirectUri } = googleCallbackSchema.parse(req.body);
  const result = await authService.handleGoogleCallback(code, redirectUri);

  const { refreshToken, ...responseBody } = result;
  setRefreshCookie(res, refreshToken);
  res.json(responseBody);
});

// SEND OTP
export const sendOtp = catchAsync(async (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  const { email } = otpSendSchema.parse(req.body);
  ensureGoogleAuthenticatedUser(user);

  if (!user?.email || user.email.toLowerCase() !== email) {
    throw new ApiError(403, "OTP can only be sent to the authenticated Google email");
  }

  const otpRequest = await otpService.sendOtpForUser(user, getRequestContext(req));

  res.json({
    success: true,
    message: "OTP sent successfully",
    requestId: otpRequest.requestId,
    expiresIn: otpRequest.expiresIn,
    resendAvailableIn: otpRequest.resendAvailableIn,
    expiresAt: otpRequest.expiresAt,
    resendAvailableAt: otpRequest.resendAvailableAt,
    email: otpRequest.email,
  });
});

// RESEND OTP
export const resendOtp = catchAsync(async (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  const { requestId } = otpResendSchema.parse(req.body);
  ensureGoogleAuthenticatedUser(user);
  const otpRequest = await otpService.resendOtpForUser(user, requestId, getRequestContext(req));

  res.json({
    success: true,
    message: "OTP resent successfully",
    requestId: otpRequest.requestId,
    expiresIn: otpRequest.expiresIn,
    resendAvailableIn: otpRequest.resendAvailableIn,
    expiresAt: otpRequest.expiresAt,
    resendAvailableAt: otpRequest.resendAvailableAt,
    email: otpRequest.email,
  });
});

export const getOtpSession = catchAsync(async (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  const { requestId } = otpSessionSchema.parse(req.body);
  ensureGoogleAuthenticatedUser(user);

  const otpRequest = await otpService.getOtpSessionForUser(user, requestId, getRequestContext(req));

  res.json({
    success: true,
    message: "OTP session loaded successfully",
    requestId: otpRequest.requestId,
    expiresIn: otpRequest.expiresIn,
    resendAvailableIn: otpRequest.resendAvailableIn,
    expiresAt: otpRequest.expiresAt,
    resendAvailableAt: otpRequest.resendAvailableAt,
    email: otpRequest.email,
  });
});

// VERIFY OTP
export const verifyOtp = catchAsync(async (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  const { requestId, otp } = otpVerifySchema.parse(req.body);
  ensureGoogleAuthenticatedUser(user);

  try {
    const result = await otpService.verifyOtpForUser(user, requestId, otp, getRequestContext(req));

    res.json({
      success: true,
      message: "OTP verified successfully",
      verified: true,
      next: result.next,
      user: result.user,
      requiresProfileCompletion: result.requiresProfileCompletion,
    });
  } catch (error: unknown) {
    const statusCode = error instanceof ApiError ? error.statusCode : 400;
    res.status(statusCode).json({
      success: false,
      message: getErrorMessage(error),
      verified: false,
    });
  }
});

export const completeGoogleProfile = catchAsync(async (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  ensureGoogleAuthenticatedUser(user);

  const { fullName, password } = completeGoogleProfileSchema.parse(req.body);
  const result = await authService.completeGoogleProfile(getAuthenticatedUserId(user), fullName, password);

  res.json({
    success: true,
    message: result.message,
    user: result.user,
  });
});

export const sendSignupOtp = catchAsync(async (req: Request, res: Response) => {
  const { email } = signupOtpSendSchema.parse(req.body);
  const otpRequest = await otpService.sendSignupOtp(email, getRequestContext(req));

  res.json({
    success: true,
    message: "OTP sent successfully",
    requestId: otpRequest.requestId,
    expiresIn: otpRequest.expiresIn,
    resendAvailableIn: otpRequest.resendAvailableIn,
    expiresAt: otpRequest.expiresAt,
    resendAvailableAt: otpRequest.resendAvailableAt,
    email: otpRequest.email,
  });
});

export const resendSignupOtp = catchAsync(async (req: Request, res: Response) => {
  const { requestId } = signupOtpResendSchema.parse(req.body);
  const otpRequest = await otpService.resendSignupOtp(requestId, getRequestContext(req));

  res.json({
    success: true,
    message: "OTP resent successfully",
    requestId: otpRequest.requestId,
    expiresIn: otpRequest.expiresIn,
    resendAvailableIn: otpRequest.resendAvailableIn,
    expiresAt: otpRequest.expiresAt,
    resendAvailableAt: otpRequest.resendAvailableAt,
    email: otpRequest.email,
  });
});

export const verifySignupOtp = catchAsync(async (req: Request, res: Response) => {
  const { requestId, otp } = signupOtpVerifySchema.parse(req.body);
  const result = await otpService.verifySignupOtp(requestId, otp, getRequestContext(req));

  res.json({
    success: true,
    message: "OTP verified successfully",
    verified: true,
    requestId: result.requestId,
    email: result.email,
  });
});

export const respondAdminInvitation = catchAsync(async (req: Request, res: Response) => {
  const payload = respondAdminInviteSchema.parse(req.body);
  const result = await respondToAdminInvite(payload);

  res.json({
    success: true,
    data: result,
  });
});

// REFRESH TOKEN
export const refreshAccessToken = catchAsync(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.jwt_refresh;

  if (!refreshToken) {
    throw new ApiError(401, "No refresh token provided");
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET as string) as jwt.JwtPayload & { id: string };
    const user = await User.findById(decoded.id);

    if (!user) {
      res.clearCookie("jwt_refresh");
      throw new ApiError(401, "Session expired. Please log in again.");
    }

    if (user.status === "suspended") {
      res.clearCookie("jwt_refresh");
      throw new ApiError(403, "Your account is suspended. Please contact support.");
    }

    const accessToken = generateAccessToken(decoded.id);

    res.json({ success: true, accessToken });
  } catch (err) {
    throw new ApiError(401, "Invalid refresh token");
  }
});

// LOGOUT
export const logoutUser = catchAsync(async (req: Request, res: Response) => {
  res.clearCookie("jwt_refresh");
  res.json({ success: true, message: "Logged out successfully" });
});
