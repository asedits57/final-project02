import crypto from "crypto";
import OtpVerification from "../models/OtpVerification";
import User from "../models/User";
import { sendVerificationEmail } from "./mailService";
import ApiError from "../utils/ApiError";
import { toPublicUser } from "../utils/toPublicUser";
import { applyAcceptedAdminInviteForUser } from "./adminInviteService";

const OTP_EXPIRY_SECONDS = 5 * 60;
const OTP_RESEND_COOLDOWN_SECONDS = 60;
const OTP_MAX_ATTEMPTS = Number.parseInt(process.env.OTP_MAX_ATTEMPTS || "5", 10);
const GOOGLE_OTP_PURPOSE = "google_oauth";
const SIGNUP_OTP_PURPOSE = "local_signup";

type RequestContext = {
  ip?: string | null;
  userAgent?: string | null;
};

type AuthUserLike = {
  _id?: { toString(): string };
  id?: string;
  email: string;
  isVerified?: boolean;
};

type OtpIdentity = {
  purpose: string;
  email: string;
  userId?: string;
};

type OtpRecord = {
  requestId: string;
  email: string;
  expiresAt: Date;
  resendAvailableAt: Date;
  attempts: number;
  verified: boolean;
  invalidatedAt?: Date | null;
  contextHash: string;
  otpHash: string;
  save(): Promise<unknown>;
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const getUserId = (user: AuthUserLike) => {
  const rawId = user._id ? user._id.toString() : user.id;
  if (!rawId) {
    throw new ApiError(500, "Authenticated user context is missing");
  }
  return rawId;
};

const getIdentityKey = (identity: OtpIdentity) => identity.userId || normalizeEmail(identity.email);

const getOtpHashSecret = () => {
  const secret = process.env.OTP_HASH_SECRET;
  if (!secret) {
    throw new ApiError(500, "OTP_HASH_SECRET is not configured");
  }
  return secret;
};

const hashOtp = (otp: string) => {
  return crypto.createHmac("sha256", getOtpHashSecret()).update(otp).digest("hex");
};

const createOtpCode = () => crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");

const createContextHash = (identityKey: string, context: RequestContext) => {
  return crypto
    .createHash("sha256")
    .update([
      identityKey,
      (context.ip || "").trim(),
      (context.userAgent || "").trim().toLowerCase(),
    ].join("|"))
    .digest("hex");
};

const serializeOtpSession = ({
  requestId,
  email,
  expiresAt,
  resendAvailableAt,
}: {
  requestId: string;
  email: string;
  expiresAt: Date;
  resendAvailableAt: Date;
}) => {
  const now = Date.now();
  return {
    requestId,
    email,
    expiresIn: Math.max(0, Math.ceil((expiresAt.getTime() - now) / 1000)),
    resendAvailableIn: Math.max(0, Math.ceil((resendAvailableAt.getTime() - now) / 1000)),
    expiresAt: expiresAt.toISOString(),
    resendAvailableAt: resendAvailableAt.toISOString(),
  };
};

const invalidateOutstandingOtps = async (identity: OtpIdentity) => {
  const now = new Date();
  const query = identity.userId
    ? { userId: identity.userId, purpose: identity.purpose, verified: false, invalidatedAt: null }
    : { email: identity.email, purpose: identity.purpose, verified: false, invalidatedAt: null };

  await OtpVerification.updateMany(
    query,
    {
      $set: {
        invalidatedAt: now,
        expiresAt: now,
      },
    },
  );
};

const createOtpRequest = async (identity: OtpIdentity, context: RequestContext) => {
  const email = normalizeEmail(identity.email);
  const requestId = crypto.randomUUID();
  const otp = createOtpCode();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + OTP_EXPIRY_SECONDS * 1000);
  const resendAvailableAt = new Date(now.getTime() + OTP_RESEND_COOLDOWN_SECONDS * 1000);
  const contextHash = createContextHash(getIdentityKey({ ...identity, email }), context);

  await invalidateOutstandingOtps({ ...identity, email });

  const record = await OtpVerification.create({
    userId: identity.userId,
    email,
    otpHash: hashOtp(otp),
    requestId,
    purpose: identity.purpose,
    expiresAt,
    resendAvailableAt,
    attempts: 0,
    verified: false,
    contextHash,
  });

  try {
    await sendVerificationEmail(email, otp);
  } catch (error) {
    await OtpVerification.deleteOne({ _id: record._id });
    throw error;
  }

  return serializeOtpSession({
    requestId,
    email,
    expiresAt,
    resendAvailableAt,
  });
};

const assertOtpRecordBelongsToContext = (record: OtpRecord | null, contextHash: string) => {
  if (!record || record.verified || record.invalidatedAt) {
    throw new ApiError(400, "Verification request not found");
  }

  if (record.contextHash !== contextHash) {
    throw new ApiError(400, "Verification request not found");
  }
};

const assertOtpRecordIsActive = (record: OtpRecord | null, contextHash: string) => {
  assertOtpRecordBelongsToContext(record, contextHash);
  const ensuredRecord = record as OtpRecord;

  if (ensuredRecord.expiresAt.getTime() <= Date.now()) {
    throw new ApiError(400, "Invalid or expired OTP");
  }
};

const validateOtpMatch = async (record: OtpRecord | null, otp: string) => {
  if (!record) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  if (record.attempts >= OTP_MAX_ATTEMPTS) {
    throw new ApiError(429, "Maximum verification attempts exceeded. Request a new code.");
  }

  const isMatch = crypto.timingSafeEqual(
    Buffer.from(record.otpHash, "hex"),
    Buffer.from(hashOtp(otp), "hex"),
  );

  if (isMatch) {
    record.verified = true;
    await record.save();
    return;
  }

  record.attempts += 1;

  if (record.attempts >= OTP_MAX_ATTEMPTS) {
    record.invalidatedAt = new Date();
    record.expiresAt = new Date();
  }

  await record.save();

  if (record.attempts >= OTP_MAX_ATTEMPTS) {
    throw new ApiError(429, "Maximum verification attempts exceeded. Request a new code.");
  }

  throw new ApiError(400, "Invalid or expired OTP");
};

const validateResendAvailability = (record: OtpRecord | null, contextHash: string) => {
  assertOtpRecordBelongsToContext(record, contextHash);
  const ensuredRecord = record as OtpRecord;

  const secondsRemaining = Math.ceil((ensuredRecord.resendAvailableAt.getTime() - Date.now()) / 1000);
  if (secondsRemaining > 0) {
    throw new ApiError(429, `Please wait ${secondsRemaining} seconds before requesting a new code`);
  }
};

export const sendOtpForUser = async (user: AuthUserLike, context: RequestContext) => {
  if (!user.email) {
    throw new ApiError(400, "Authenticated email is required to send OTP");
  }

  return createOtpRequest({
    userId: getUserId(user),
    email: user.email,
    purpose: GOOGLE_OTP_PURPOSE,
  }, context);
};

export const getOtpSessionForUser = async (user: AuthUserLike, requestId: string, context: RequestContext) => {
  const userId = getUserId(user);
  const record = await OtpVerification.findOne({
    userId,
    requestId,
    purpose: GOOGLE_OTP_PURPOSE,
  });

  assertOtpRecordBelongsToContext(record, createContextHash(userId, context));
  const ensuredRecord = record as OtpRecord;

  return serializeOtpSession({
    requestId: ensuredRecord.requestId,
    email: normalizeEmail(ensuredRecord.email),
    expiresAt: ensuredRecord.expiresAt,
    resendAvailableAt: ensuredRecord.resendAvailableAt,
  });
};

export const resendOtpForUser = async (user: AuthUserLike, requestId: string, context: RequestContext) => {
  const userId = getUserId(user);
  const record = await OtpVerification.findOne({
    userId,
    requestId,
    purpose: GOOGLE_OTP_PURPOSE,
  });

  validateResendAvailability(record, createContextHash(userId, context));

  return createOtpRequest({
    userId,
    email: user.email,
    purpose: GOOGLE_OTP_PURPOSE,
  }, context);
};

export const verifyOtpForUser = async (user: AuthUserLike, requestId: string, otp: string, context: RequestContext) => {
  const userId = getUserId(user);
  const record = await OtpVerification.findOne({
    userId,
    requestId,
    purpose: GOOGLE_OTP_PURPOSE,
  });

  assertOtpRecordIsActive(record, createContextHash(userId, context));
  await validateOtpMatch(record, otp);

  await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        isVerified: true,
        verifiedAt: new Date(),
      },
    },
    { returnDocument: "after" },
  );

  const updatedUser = await applyAcceptedAdminInviteForUser(userId);

  if (!updatedUser) {
    throw new ApiError(404, "User not found");
  }

  const requiresProfileCompletion = !updatedUser.password;

  return {
    verified: true,
    next: requiresProfileCompletion ? "/complete-profile" : "/",
    requiresProfileCompletion,
    user: toPublicUser(updatedUser),
  };
};

export const sendSignupOtp = async (email: string, context: RequestContext) => {
  const normalizedEmail = normalizeEmail(email);
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    throw new ApiError(400, "User already exists");
  }

  return createOtpRequest({
    email: normalizedEmail,
    purpose: SIGNUP_OTP_PURPOSE,
  }, context);
};

export const resendSignupOtp = async (requestId: string, context: RequestContext) => {
  const record = await OtpVerification.findOne({
    requestId,
    purpose: SIGNUP_OTP_PURPOSE,
  });

  if (!record) {
    throw new ApiError(400, "Verification request not found");
  }

  const email = normalizeEmail(record.email);
  validateResendAvailability(record, createContextHash(email, context));

  return createOtpRequest({
    email,
    purpose: SIGNUP_OTP_PURPOSE,
  }, context);
};

export const verifySignupOtp = async (requestId: string, otp: string, context: RequestContext) => {
  const record = await OtpVerification.findOne({
    requestId,
    purpose: SIGNUP_OTP_PURPOSE,
  });

  if (!record) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  const email = normalizeEmail(record.email);
  assertOtpRecordIsActive(record, createContextHash(email, context));
  await validateOtpMatch(record, otp);

  return {
    requestId: record.requestId,
    email,
    verified: true,
  };
};

export const consumeVerifiedSignupOtp = async (email: string, requestId: string, context: RequestContext) => {
  const normalizedEmail = normalizeEmail(email);
  const record = await OtpVerification.findOne({
    email: normalizedEmail,
    requestId,
    purpose: SIGNUP_OTP_PURPOSE,
    verified: true,
    invalidatedAt: null,
  });

  if (!record) {
    throw new ApiError(400, "Verify your email before completing registration");
  }

  if (record.contextHash !== createContextHash(normalizedEmail, context)) {
    throw new ApiError(400, "Verify your email before completing registration");
  }

  record.invalidatedAt = new Date();
  record.expiresAt = new Date();
  await record.save();
};
