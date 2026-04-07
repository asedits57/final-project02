import bcrypt from "bcrypt";
import User from "../models/User";
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken";

export const registerUser = async (email: string, password: string, fullName?: string, username?: string, dept?: string) => {
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    email,
    password: hashedPassword,
    fullName,
    username,
    dept,
  });

  return {
    message: "User registered",
    accessToken: generateAccessToken(user._id.toString()),
    refreshToken: generateRefreshToken(user._id.toString()),
    user,
  };
};

export const loginUser = async (email: string, password: string) => {
  // Support login by email OR username (MEC ID)
  const user = await User.findOne({ $or: [{ email }, { username: email }] });
  if (!user) {
    throw new Error("Invalid email or username");
  }

  const isMatch = await bcrypt.compare(password, user.password || "");
  if (!isMatch) {
    throw new Error("Invalid password");
  }

  return {
    message: "Login successful",
    accessToken: generateAccessToken(user._id.toString()),
    refreshToken: generateRefreshToken(user._id.toString()),
    user,
  };
};
