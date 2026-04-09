import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import axios from "axios";
import app from "../src/app";
import User from "../src/models/User";
import OtpVerification from "../src/models/OtpVerification";
import { createMongoMemoryServer } from "../src/config/memoryMongo";

vi.mock("axios", () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

const mockedAxios = vi.mocked(axios, true);

describe("Google OTP Auth Flow", () => {
  let mongoServer: Awaited<ReturnType<typeof createMongoMemoryServer>>;
  let sentOtpCodes: string[] = [];

  beforeAll(async () => {
    mongoServer = await createMongoMemoryServer();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  beforeEach(async () => {
    sentOtpCodes = [];
    await User.deleteMany({});

    mockedAxios.post.mockImplementation(async (url: string, payload: unknown) => {
      if (url.includes("oauth2.googleapis.com/token")) {
        return { data: { access_token: "google-access-token" } } as never;
      }

      if (url.includes("api.resend.com/emails")) {
        const emailPayload = typeof payload === "object" && payload !== null ? payload as { text?: string } : {};
        const match = String(emailPayload.text || "").match(/OTP is (\d{6})/);
        if (match) {
          sentOtpCodes.push(match[1]);
        }
        return { data: { id: `email_${sentOtpCodes.length}` } } as never;
      }

      throw new Error(`Unexpected POST ${url}`);
    });

    mockedAxios.get.mockResolvedValue({
      data: {
        sub: "google-user-123",
        email: "otpuser@gmail.com",
        email_verified: true,
        name: "OTP User",
        picture: "https://example.com/avatar.png",
      },
    } as never);
  });

  it("sends an OTP after Google callback, verifies it, and completes the profile", async () => {
    const callbackRes = await request(app)
      .post("/api/v1/auth/google/callback-handler")
      .set("User-Agent", "vitest-agent")
      .send({
        code: "google-auth-code",
        redirectUri: "http://localhost:8080/auth/google/callback",
      });

    expect(callbackRes.status).toBe(200);
    expect(callbackRes.body.success).toBe(true);
    expect(callbackRes.body.verified).toBe(false);
    expect(callbackRes.body.email).toBe("otpuser@gmail.com");
    expect(callbackRes.body.requestId).toBeTruthy();
    expect(sentOtpCodes).toHaveLength(1);

    const sessionRes = await request(app)
      .post("/api/v1/auth/otp/session")
      .set("Authorization", `Bearer ${callbackRes.body.accessToken}`)
      .set("User-Agent", "vitest-agent")
      .send({
        requestId: callbackRes.body.requestId,
      });

    expect(sessionRes.status).toBe(200);
    expect(sessionRes.body.success).toBe(true);
    expect(sessionRes.body.requestId).toBe(callbackRes.body.requestId);
    expect(sessionRes.body.email).toBe("otpuser@gmail.com");

    const verifyRes = await request(app)
      .post("/api/v1/auth/otp/verify")
      .set("Authorization", `Bearer ${callbackRes.body.accessToken}`)
      .set("User-Agent", "vitest-agent")
      .send({
        requestId: callbackRes.body.requestId,
        otp: sentOtpCodes[0],
      });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.success).toBe(true);
    expect(verifyRes.body.verified).toBe(true);
    expect(verifyRes.body.next).toBe("/complete-profile");
    expect(verifyRes.body.requiresProfileCompletion).toBe(true);

    const completeProfileRes = await request(app)
      .post("/api/v1/auth/google/complete-profile")
      .set("Authorization", `Bearer ${callbackRes.body.accessToken}`)
      .send({
        fullName: "OTP User Updated",
        password: "password123",
      });

    expect(completeProfileRes.status).toBe(200);
    expect(completeProfileRes.body.success).toBe(true);
    expect(completeProfileRes.body.user.fullName).toBe("OTP User Updated");
    expect(completeProfileRes.body.user.hasPassword).toBe(true);

    const user = await User.findOne({ email: "otpuser@gmail.com" });
    expect(user?.isVerified).toBe(true);
    expect(user?.password).toBeTruthy();
  });

  it("resends an OTP with a new request id and invalidates the previous request", async () => {
    const callbackRes = await request(app)
      .post("/api/v1/auth/google/callback-handler")
      .set("User-Agent", "vitest-agent")
      .send({
        code: "google-auth-code",
        redirectUri: "http://localhost:8080/auth/google/callback",
      });

    await OtpVerification.findOneAndUpdate(
      { requestId: callbackRes.body.requestId },
      {
        $set: {
          resendAvailableAt: new Date(Date.now() - 1000),
        },
      },
    );

    const resendRes = await request(app)
      .post("/api/v1/auth/otp/resend")
      .set("Authorization", `Bearer ${callbackRes.body.accessToken}`)
      .set("User-Agent", "vitest-agent")
      .send({
        requestId: callbackRes.body.requestId,
      });

    expect(resendRes.status).toBe(200);
    expect(resendRes.body.success).toBe(true);
    expect(resendRes.body.requestId).not.toBe(callbackRes.body.requestId);
    expect(sentOtpCodes).toHaveLength(2);

    const oldVerifyRes = await request(app)
      .post("/api/v1/auth/otp/verify")
      .set("Authorization", `Bearer ${callbackRes.body.accessToken}`)
      .set("User-Agent", "vitest-agent")
      .send({
        requestId: callbackRes.body.requestId,
        otp: sentOtpCodes[0],
      });

    expect(oldVerifyRes.status).toBe(400);
    expect(oldVerifyRes.body.success).toBe(false);
    expect(oldVerifyRes.body.verified).toBe(false);

    const newVerifyRes = await request(app)
      .post("/api/v1/auth/otp/verify")
      .set("Authorization", `Bearer ${callbackRes.body.accessToken}`)
      .set("User-Agent", "vitest-agent")
      .send({
        requestId: resendRes.body.requestId,
        otp: sentOtpCodes[1],
      });

    expect(newVerifyRes.status).toBe(200);
    expect(newVerifyRes.body.success).toBe(true);
    expect(newVerifyRes.body.verified).toBe(true);
  });
});
