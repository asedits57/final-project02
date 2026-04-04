import { Request, Response, RequestHandler } from "express";
import User from "../models/User";
import * as authService from "../services/authService";
import { registerSchema } from "../validators/authValidator";

// REGISTER
export const registerUser: RequestHandler = async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const { email, password } = req.body;
    const result = await authService.registerUser(email, password);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// LOGIN
export const loginUser: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// GET USER PROFILE
export const getUserProfile: RequestHandler = async (req, res) => {
  try {
    const user = await User.findById((req as any).user.id).select("-password");
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
