import { Request, Response, RequestHandler } from "express";
import * as authService from "../services/authService";
import { registerSchema } from "../validators/authValidator";
import jwt from "jsonwebtoken";
import { generateAccessToken } from "../utils/generateToken";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// REGISTER
export const registerUser: RequestHandler = async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: parsed.error.errors[0].message });
    return;
  }

  try {
    const { email, password, fullName, username, dept } = parsed.data;
    const { message, accessToken, refreshToken, user } = await authService.registerUser(email, password, fullName, username, dept);
    
    res.cookie("jwt_refresh", refreshToken, COOKIE_OPTIONS);

    res.json({ success: true, message, accessToken, user });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// LOGIN
export const loginUser: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { message, accessToken, refreshToken, user } = await authService.loginUser(email, password);
    
    res.cookie("jwt_refresh", refreshToken, COOKIE_OPTIONS);

    res.json({ success: true, message, accessToken, user });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// REFRESH TOKEN
export const refreshAccessToken: RequestHandler = async (req, res) => {
  const refreshToken = req.cookies.jwt_refresh;

  if (!refreshToken) {
    res.status(401).json({ success: false, message: "No refresh token provided" });
    return;
  }

  try {
    const decoded: any = jwt.verify(refreshToken, process.env.JWT_SECRET as string);
    const accessToken = generateAccessToken(decoded.id);

    res.json({ success: true, accessToken });
  } catch (err) {
    res.status(401).json({ success: false, message: "Invalid refresh token" });
  }
};

// LOGOUT
export const logoutUser: RequestHandler = async (req, res) => {
  res.clearCookie("jwt_refresh");
  res.json({ success: true, message: "Logged out successfully" });
};
