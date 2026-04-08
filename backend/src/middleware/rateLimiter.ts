import rateLimit from "express-rate-limit";

// Global API rate limiter
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "production" ? 100 : 10000, // relax for dev/k6 load testing
  message: { success: false, message: "Too many requests from this IP, please try again after 15 minutes" }
});

// Stricter rate limiter specifically for authentication routes (login/register)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "production" ? 10 : 1000, // relax for dev/k6
  message: { success: false, error: "Too many login/register attempts, please try again after 15 minutes" }
});
