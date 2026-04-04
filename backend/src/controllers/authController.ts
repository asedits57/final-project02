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
    const { email, password, fullName, username, dept } = req.body;
    const { message, token, user } = await authService.registerUser(email, password, fullName, username, dept);
    
    // Set HttpOnly cookie
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, 
    });

    res.json({ success: true, message, token, user });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// LOGIN
export const loginUser: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { message, token, user } = await authService.loginUser(email, password);
    
    // Set HttpOnly cookie
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, 
    });

    res.json({ success: true, message, token, user });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};
