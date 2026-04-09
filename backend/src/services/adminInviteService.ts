import crypto from "crypto";

import AdminInvite from "../models/AdminInvite";
import User from "../models/User";
import ApiError from "../utils/ApiError";
import { recordAdminActivity } from "./adminActivityService";
import { sendAdminInvitationEmail } from "./mailService";

const ADMIN_INVITE_TTL_DAYS = Number.parseInt(process.env.ADMIN_INVITE_TTL_DAYS || "7", 10);

const normalizeEmail = (email: string) => email.trim().toLowerCase();
const createInviteToken = () => crypto.randomBytes(32).toString("hex");
const hashInviteToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");

const getAppUrl = () => {
  const configuredUrl = process.env.APP_URL?.trim();
  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  const corsOrigin = process.env.CORS_ORIGIN?.split(",")[0]?.trim();
  if (corsOrigin) {
    return corsOrigin.replace(/\/$/, "");
  }

  return "http://localhost:8080";
};

const buildLoginUrl = (email: string) => {
  const url = new URL("/login", getAppUrl());
  url.searchParams.set("email", email);
  url.searchParams.set("invite", "admin");
  return url.toString();
};

const buildSignupUrl = (email: string) => {
  const url = new URL("/login", getAppUrl());
  url.searchParams.set("email", email);
  url.searchParams.set("mode", "signup");
  url.searchParams.set("invite", "admin");
  return url.toString();
};

const buildInviteResponseUrl = (token: string, action: "accept" | "decline") => {
  const url = new URL("/admin-invite/respond", getAppUrl());
  url.searchParams.set("token", token);
  url.searchParams.set("action", action);
  return url.toString();
};

const expireOutstandingInvites = async (email: string) => {
  await AdminInvite.updateMany(
    {
      email,
      status: "pending",
      expiresAt: { $lte: new Date() },
    },
    {
      $set: {
        status: "expired",
      },
    },
  );
};

export const applyAcceptedAdminInviteForUser = async (userId: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const email = normalizeEmail(user.email);
  await expireOutstandingInvites(email);

  const invite = await AdminInvite.findOne({
    email,
    status: "accepted",
  }).sort({ createdAt: -1 });

  if (!invite) {
    return user;
  }

  if (user.role === "admin" && invite.acceptedBy?.toString() === user._id.toString()) {
    return user;
  }

  let changed = false;
  if (user.role !== "admin") {
    user.role = "admin";
    await user.save();
    changed = true;
  }

  if (!invite.acceptedBy) {
    invite.acceptedBy = user._id;
    await invite.save();
    changed = true;
  }

  if (!changed) {
    return user;
  }

  await recordAdminActivity({
    actorId: user._id.toString(),
    action: "admin.invite.applied",
    targetType: "admin-invite",
    targetId: invite._id.toString(),
    description: `${user.email} received admin access after accepting an invitation`,
  });

  return user;
};

export const inviteAdminByEmail = async (
  payload: { email: string; message?: string },
  actorId: string,
) => {
  const email = normalizeEmail(payload.email);
  const actor = await User.findById(actorId).select("email fullName");

  if (!actor) {
    throw new ApiError(404, "Admin actor not found");
  }

  await expireOutstandingInvites(email);

  const existingUser = await User.findOne({ email });
  if (existingUser?.role === "admin") {
    throw new ApiError(409, "This user already has admin access");
  }

  const expiresAt = new Date(Date.now() + ADMIN_INVITE_TTL_DAYS * 24 * 60 * 60 * 1000);
  const token = createInviteToken();
  const responseTokenHash = hashInviteToken(token);
  const invite = await AdminInvite.findOneAndUpdate(
    { email, status: "pending" },
    {
      $set: {
        invitedBy: actorId,
        message: payload.message,
        expiresAt,
        lastSentAt: new Date(),
        responseTokenHash,
        acceptedAt: undefined,
        acceptedBy: undefined,
        declinedAt: undefined,
        respondedAt: undefined,
      },
      $setOnInsert: {
        role: "admin",
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    },
  );
  const acceptUrl = buildInviteResponseUrl(token, "accept");
  const declineUrl = buildInviteResponseUrl(token, "decline");
  await sendAdminInvitationEmail(email, {
    invitedByName: actor.fullName || actor.email,
    acceptUrl,
    declineUrl,
    loginUrl: buildLoginUrl(email),
    signupUrl: buildSignupUrl(email),
    expiresAt,
    message: payload.message,
  });

  await recordAdminActivity({
    actorId,
    action: "admin.invite.sent",
    targetType: "admin-invite",
    targetId: invite._id.toString(),
    description: `Sent admin invitation to ${email}`,
    metadata: {
      acceptUrl,
      declineUrl,
      expiresAt: invite.expiresAt.toISOString(),
    },
  });

  return {
    inviteId: invite._id.toString(),
    email,
    status: invite.status,
    expiresAt: invite.expiresAt.toISOString(),
    loginUrl: buildLoginUrl(email),
    acceptUrl,
    declineUrl,
  };
};

export const respondToAdminInvite = async (
  payload: { token: string; action: "accept" | "decline" },
) => {
  const invite = await AdminInvite.findOne({
    responseTokenHash: hashInviteToken(payload.token),
  });

  if (!invite) {
    throw new ApiError(404, "Invitation not found");
  }

  if (invite.status === "declined") {
    return {
      email: invite.email,
      status: "declined" as const,
      message: "This admin invitation was already declined.",
      loginUrl: buildLoginUrl(invite.email),
      signupUrl: buildSignupUrl(invite.email),
      userExists: Boolean(await User.exists({ email: invite.email })),
      roleGrantedNow: false,
    };
  }

  if (invite.status === "accepted") {
    return {
      email: invite.email,
      status: "accepted" as const,
      message: "This admin invitation was already accepted.",
      loginUrl: buildLoginUrl(invite.email),
      signupUrl: buildSignupUrl(invite.email),
      userExists: Boolean(await User.exists({ email: invite.email })),
      roleGrantedNow: Boolean(await User.exists({ email: invite.email, role: "admin" })),
    };
  }

  if (invite.status !== "pending" || invite.expiresAt.getTime() <= Date.now()) {
    if (invite.status === "pending") {
      invite.status = "expired";
      await invite.save();
    }
    throw new ApiError(410, "This admin invitation has expired");
  }

  const user = await User.findOne({ email: invite.email });

  if (payload.action === "decline") {
    invite.status = "declined";
    invite.declinedAt = new Date();
    invite.respondedAt = new Date();
    await invite.save();

    await recordAdminActivity({
      action: "admin.invite.declined",
      targetType: "admin-invite",
      targetId: invite._id.toString(),
      description: `${invite.email} declined an admin invitation`,
    });

    return {
      email: invite.email,
      status: "declined" as const,
      message: "You declined the admin invitation. No admin access was granted.",
      loginUrl: buildLoginUrl(invite.email),
      signupUrl: buildSignupUrl(invite.email),
      userExists: Boolean(user),
      roleGrantedNow: false,
    };
  }

  invite.status = "accepted";
  invite.acceptedAt = new Date();
  invite.respondedAt = new Date();

  let roleGrantedNow = false;
  if (user) {
    if (user.role !== "admin") {
      user.role = "admin";
      await user.save();
    }
    invite.acceptedBy = user._id;
    roleGrantedNow = true;
  }

  await invite.save();

  await recordAdminActivity({
    actorId: user?._id?.toString(),
    action: "admin.invite.accepted",
    targetType: "admin-invite",
    targetId: invite._id.toString(),
    description: roleGrantedNow
      ? `${invite.email} accepted the admin invitation and received admin access`
      : `${invite.email} accepted the admin invitation`,
  });

  return {
    email: invite.email,
    status: "accepted" as const,
    message: roleGrantedNow
      ? "You accepted the invitation and admin access is now active for this account."
      : "You accepted the invitation. Sign up or sign in with this email to activate admin access.",
    loginUrl: buildLoginUrl(invite.email),
    signupUrl: buildSignupUrl(invite.email),
    userExists: Boolean(user),
    roleGrantedNow,
  };
};
