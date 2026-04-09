export type OtpSession = {
  requestId: string;
  email: string;
  expiresAt: string;
  resendAvailableAt: string;
};

const OTP_SESSION_KEY = "google_otp_session";

const canUseStorage = () => typeof window !== "undefined" && !!window.localStorage;

export const getOtpSession = (): OtpSession | null => {
  if (!canUseStorage()) {
    return null;
  }

  const rawValue = window.localStorage.getItem(OTP_SESSION_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as OtpSession;
  } catch (error) {
    window.localStorage.removeItem(OTP_SESSION_KEY);
    return null;
  }
};

export const setOtpSession = (session: OtpSession) => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(OTP_SESSION_KEY, JSON.stringify(session));
};

export const clearOtpSession = () => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(OTP_SESSION_KEY);
};
