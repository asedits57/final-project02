import { Request, Response } from "express";
import * as authService from "../services/authService";
import { registerSchema } from "../validators/authValidator";
import jwt from "jsonwebtoken";
import { generateAccessToken } from "../utils/generateToken";
import catchAsync from "../utils/catchAsync";
import ApiError from "../utils/ApiError";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// REGISTER
export const registerUser = catchAsync(async (req: Request, res: Response) => {
  const parsedData = registerSchema.parse(req.body);
  const { email, password, fullName, username, dept } = parsedData;
  const { message, accessToken, refreshToken, user } = await authService.registerUser(email, password, fullName, username, dept);
  
  res.cookie("jwt_refresh", refreshToken, COOKIE_OPTIONS);
  res.json({ success: true, message, accessToken, user });
});

// LOGIN
export const loginUser = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const { message, accessToken, refreshToken, user } = await authService.loginUser(email, password);
  
  res.cookie("jwt_refresh", refreshToken, COOKIE_OPTIONS);
  res.json({ success: true, message, accessToken, user });
});

// REFRESH TOKEN
export const refreshAccessToken = catchAsync(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.jwt_refresh;

  if (!refreshToken) {
    throw new ApiError(401, "No refresh token provided");
  }

  try {
    const decoded: any = jwt.verify(refreshToken, process.env.JWT_SECRET as string);
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
