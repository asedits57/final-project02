import { Request, Response, RequestHandler } from "express";
import * as authService from "../services/authService";
import { registerSchema } from "../validators/authValidator";

// REGISTER
export const registerUser: RequestHandler = async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ success: false, message: parsed.error.message });
    return;
  }

  try {
    const { email, password } = req.body;
    const result = await authService.registerUser(email, password);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// LOGIN
export const loginUser: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};
