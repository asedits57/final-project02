import bcrypt from "bcrypt";
import crypto from "crypto";
import mongoose from "mongoose";

import User from "../models/User";
import { logger } from "../utils/logger";

const deriveNameFromEmail = (email: string) => {
  const localPart = email.split("@")[0] || "Admin";
  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ") || "Admin";
};

const deriveBootstrapAdminId = (email: string) => {
  const hex = crypto.createHash("sha1").update(`sandysquad-bootstrap-admin:${email}`).digest("hex").slice(0, 24);
  return new mongoose.Types.ObjectId(hex);
};

export const ensureBootstrapAdmin = async () => {
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD?.trim();

  if (!email || !password) {
    return null;
  }

  const fullName = process.env.ADMIN_BOOTSTRAP_NAME?.trim() || deriveNameFromEmail(email);
  const existingUser = await User.findOne({ email });
  const nextVerifiedAt = existingUser?.verifiedAt || new Date();

  if (!existingUser) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const createdUser = await User.create({
      _id: deriveBootstrapAdminId(email),
      email,
      password: hashedPassword,
      fullName,
      role: "admin",
      status: "active",
      isVerified: true,
      verifiedAt: nextVerifiedAt,
    });

    logger.info("Bootstrap admin created", { email });
    return createdUser;
  }

  let shouldSave = false;

  if (existingUser.role !== "admin") {
    existingUser.role = "admin";
    shouldSave = true;
  }

  if (existingUser.status !== "active") {
    existingUser.status = "active";
    shouldSave = true;
  }

  if (!existingUser.isVerified) {
    existingUser.isVerified = true;
    existingUser.verifiedAt = nextVerifiedAt;
    shouldSave = true;
  }

  if (!existingUser.fullName) {
    existingUser.fullName = fullName;
    shouldSave = true;
  }

  const passwordMatches = existingUser.password
    ? await bcrypt.compare(password, existingUser.password)
    : false;

  if (!passwordMatches) {
    existingUser.password = await bcrypt.hash(password, 10);
    shouldSave = true;
  }

  if (shouldSave) {
    await existingUser.save();
    logger.info("Bootstrap admin updated", { email });
  }

  return existingUser;
};
