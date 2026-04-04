import bcrypt from "bcrypt";
import User from "../models/User";
import { generateToken } from "../utils/generateToken";

export const registerUser = async (email: string, password: string) => {
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    email,
    password: hashedPassword,
  });

  return {
    message: "User registered",
    token: generateToken(user._id.toString()),
  };
};

export const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Invalid email");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid password");
  }

  return {
    message: "Login successful",
    token: generateToken(user._id.toString()),
  };
};
