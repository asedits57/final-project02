import axios from "axios";
import bcrypt from "bcrypt";
import User from "../models/User";
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken";
import ApiError from "../utils/ApiError";
import { toPublicUser } from "../utils/toPublicUser";
import { consumeVerifiedSignupOtp } from "./otpService";
import { applyAcceptedAdminInviteForUser } from "./adminInviteService";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";

type RequestContext = {
  ip?: string | null;
  userAgent?: string | null;
};

type GoogleUserProfile = {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
};

type AuthUserDocument = Parameters<typeof toPublicUser>[0];

const buildAuthPayload = (user: AuthUserDocument) => ({
  accessToken: generateAccessToken(user._id.toString()),
  refreshToken: generateRefreshToken(user._id.toString()),
  user: toPublicUser(user),
});

const exchangeGoogleCodeForProfile = async (code: string, redirectUri?: string) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const resolvedRedirectUri = redirectUri || process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !resolvedRedirectUri) {
    throw new ApiError(500, "Google OAuth is not configured correctly");
  }

  try {
    const tokenResponse = await axios.post(
      GOOGLE_TOKEN_URL,
      new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: resolvedRedirectUri,
        grant_type: "authorization_code",
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        timeout: 10000,
      },
    );

    const accessToken = tokenResponse.data?.access_token;
    if (!accessToken) {
      throw new ApiError(400, "Google authentication failed");
    }

    const profileResponse = await axios.get<GoogleUserProfile>(GOOGLE_USERINFO_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      timeout: 10000,
    });

    return profileResponse.data;
  } catch (error) {
    throw new ApiError(400, "Google authentication failed");
  }
};

export const registerUser = async (
  email: string,
  password: string,
  fullName: string | undefined,
  username: string | undefined,
  dept: string | undefined,
  requestId: string,
  context: RequestContext,
) => {
  const normalizedEmail = email.trim().toLowerCase();
  const userExists = await User.findOne({ email: normalizedEmail });
  if (userExists) {
    throw new ApiError(400, "User already exists");
  }

  await consumeVerifiedSignupOtp(normalizedEmail, requestId, context);

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    email: normalizedEmail,
    password: hashedPassword,
    fullName,
    username,
    dept,
  });
  const effectiveUser = await applyAcceptedAdminInviteForUser(user._id.toString());

  return {
    message: "User registered",
    ...buildAuthPayload(effectiveUser),
  };
};

export const loginUser = async (email: string, password: string) => {
  const credential = email.trim();
  const normalizedEmail = credential.toLowerCase();

  // Support login by email OR username (MEC ID)
  const user = await User.findOne({ $or: [{ email: normalizedEmail }, { username: credential }] });
  if (!user) {
    throw new ApiError(400, "Invalid email or username");
  }

  const isMatch = await bcrypt.compare(password, user.password || "");
  if (!isMatch) {
    throw new ApiError(400, "Invalid password");
  }
  const effectiveUser = await applyAcceptedAdminInviteForUser(user._id.toString());

  return {
    message: "Login successful",
    ...buildAuthPayload(effectiveUser),
  };
};

export const handleGoogleCallback = async (code: string, redirectUri: string | undefined) => {
  const profile = await exchangeGoogleCodeForProfile(code, redirectUri);
  const email = profile.email?.trim().toLowerCase();

  if (!email || !profile.email_verified) {
    throw new ApiError(400, "Google account email is not verified");
  }

  let user = await User.findOne({
    $or: [
      { oauthProvider: "google", oauthSubject: profile.sub },
      { email },
    ],
  });

  if (!user) {
    user = await User.create({
      email,
      fullName: profile.name,
      avatar: profile.picture,
      oauthProvider: "google",
      oauthSubject: profile.sub,
      isVerified: true,
      verifiedAt: new Date(),
    });
  } else {
    user.email = email;
    user.oauthProvider = "google";
    user.oauthSubject = profile.sub;
    user.isVerified = true;
    user.verifiedAt = user.verifiedAt || new Date();
    if (profile.name) {
      user.fullName = profile.name;
    }
    if (profile.picture) {
      user.avatar = profile.picture;
    }
    await user.save();
  }

  const effectiveUser = await applyAcceptedAdminInviteForUser(user._id.toString());
  const authPayload = buildAuthPayload(effectiveUser);
  const requiresProfileCompletion = !authPayload.user.hasPassword;

  return {
    success: true,
    message: "Google authentication successful",
    verified: true,
    redirectTo: requiresProfileCompletion ? "/complete-profile" : "/",
    ...authPayload,
  };
};

export const completeGoogleProfile = async (userId: string, fullName: string, password: string) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.oauthProvider !== "google") {
    throw new ApiError(403, "Profile completion is only available for Google sign-ins");
  }

  if (!user.isVerified) {
    throw new ApiError(403, "Verify your Google email before completing your profile");
  }

  user.fullName = fullName.trim();
  user.password = await bcrypt.hash(password, 10);
  await user.save();

  return {
    message: "Profile completed successfully",
    user: toPublicUser(user),
  };
};
