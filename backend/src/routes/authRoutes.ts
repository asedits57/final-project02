import express from "express";
import {
  authLimiter,
  googleCallbackLimiter,
  otpResendLimiter,
  otpSendLimiter,
  otpVerifyLimiter,
} from "../middleware/rateLimiter";
import {
  getGoogleAuthConfig,
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  handleGoogleCallback,
  completeGoogleProfile,
  getOtpSession,
  resendSignupOtp,
  respondAdminInvitation,
  resendOtp,
  sendSignupOtp,
  sendOtp,
  verifySignupOtp,
  verifyOtp,
} from "../controllers/authController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/google/config", getGoogleAuthConfig);
router.post("/signup-otp/send", otpSendLimiter, sendSignupOtp);
router.post("/signup-otp/resend", otpResendLimiter, resendSignupOtp);
router.post("/signup-otp/verify", otpVerifyLimiter, verifySignupOtp);
router.post("/admin-invite/respond", authLimiter, respondAdminInvitation);
router.post("/register", authLimiter, registerUser);
router.post("/login", authLimiter, loginUser);
router.post("/google/callback-handler", googleCallbackLimiter, handleGoogleCallback);
router.post("/otp/send", protect, otpSendLimiter, sendOtp);
router.post("/otp/session", protect, otpVerifyLimiter, getOtpSession);
router.post("/otp/resend", protect, otpResendLimiter, resendOtp);
router.post("/otp/verify", protect, otpVerifyLimiter, verifyOtp);
router.post("/google/complete-profile", protect, authLimiter, completeGoogleProfile);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", logoutUser);

export default router;
