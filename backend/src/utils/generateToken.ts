import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export const generateAccessToken = (id: string | mongoose.Types.ObjectId) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: "15m",
  });
};

export const generateRefreshToken = (id: string | mongoose.Types.ObjectId) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: "7d",
  });
};

// Backwards compatibility (aliased to Access Token)
export const generateToken = generateAccessToken;
