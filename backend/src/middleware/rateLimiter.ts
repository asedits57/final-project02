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

// Strict rate limiter for expensive AI features (Tracks Abuse Per-User!)
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === "production" ? 5 : 100, // 5 requests per minute
  keyGenerator: (req: any) => {
    // If the request is authenticated via JWT, rate-limit specifically by their User ID!
    if (req.user && req.user._id) {
      return req.user._id.toString();
    }
    // Fallback to IP address if unauthenticated
    return req.ip;
  },
  message: { success: false, message: "AI Tutor is overloaded. Please wait a minute before asking another question." }
});
