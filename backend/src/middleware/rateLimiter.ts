import rateLimit from "express-rate-limit";

type RateLimitedRequest = {
  user?: {
    _id?: { toString(): string };
  };
  ip?: string;
};

const authAwareKeyGenerator = (req: RateLimitedRequest) => {
  if (req.user?._id) {
    return req.user._id.toString();
  }

  return req.ip || "anonymous";
};

// Global API rate limiter
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "production" ? 100 : 10000, // relax for dev/k6 load testing
  message: { success: false, message: "Too many requests from this IP, please try again after 15 minutes" },
  validate: false,
});

// Stricter rate limiter specifically for authentication routes (login/register)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "production" ? 10 : 1000, // relax for dev/k6
  message: { success: false, error: "Too many login/register attempts, please try again after 15 minutes" },
  validate: false,
});

export const googleCallbackLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 10 : 200,
  message: { success: false, message: "Too many Google login attempts. Please try again shortly." },
  validate: false,
});

export const otpSendLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 5 : 100,
  keyGenerator: authAwareKeyGenerator,
  message: { success: false, message: "Too many OTP send attempts. Please wait before trying again." },
  validate: false,
});

export const otpResendLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 6 : 120,
  keyGenerator: authAwareKeyGenerator,
  message: { success: false, message: "Too many OTP resend attempts. Please wait before trying again." },
  validate: false,
});

export const otpVerifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 15 : 200,
  keyGenerator: authAwareKeyGenerator,
  message: { success: false, message: "Too many OTP verification attempts. Please wait before trying again.", verified: false },
  validate: false,
});

// Strict rate limiter for expensive AI features (Tracks Abuse Per-User!)
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === "production" ? 5 : 100, // 5 requests per minute
  keyGenerator: authAwareKeyGenerator,
  validate: false,
  message: { success: false, message: "AI Tutor is overloaded. Please wait a minute before asking another question." }
});
