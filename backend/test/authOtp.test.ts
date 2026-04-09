import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import axios from "axios";
import app from "../src/app";
import User from "../src/models/User";
import { connectMongoTestDatabase, getMongoTestAvailability, type TestDatabaseHandle } from "./support/database";

vi.mock("axios", () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

const mockedAxios = vi.mocked(axios, true);

const mongoSupport = getMongoTestAvailability();
const describeMongo = mongoSupport.enabled ? describe : describe.skip;

describeMongo("Google Auth Flow", () => {
  let database: TestDatabaseHandle;

  beforeAll(async () => {
    database = await connectMongoTestDatabase();
  });

  afterAll(async () => {
    await database.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});

    mockedAxios.post.mockImplementation(async (url: string) => {
      if (url.includes("oauth2.googleapis.com/token")) {
        return { data: { access_token: "google-access-token" } } as never;
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

  it("trusts Google's verified email and sends the user to complete their profile when needed", async () => {
    const callbackRes = await request(app)
      .post("/api/v1/auth/google/callback-handler")
      .set("User-Agent", "vitest-agent")
      .send({
        code: "google-auth-code",
        redirectUri: "http://localhost:8080/auth/google/callback",
      });

    expect(callbackRes.status).toBe(200);
    expect(callbackRes.body.success).toBe(true);
    expect(callbackRes.body.verified).toBe(true);
    expect(callbackRes.body.redirectTo).toBe("/complete-profile");
    expect(callbackRes.body.user.email).toBe("otpuser@gmail.com");
    expect(callbackRes.body.user.isVerified).toBe(true);
    expect(callbackRes.body.user.hasPassword).toBe(false);

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

  it("returns the normal app redirect once the Google user already has a password", async () => {
    const callbackRes = await request(app)
      .post("/api/v1/auth/google/callback-handler")
      .set("User-Agent", "vitest-agent")
      .send({
        code: "google-auth-code",
        redirectUri: "http://localhost:8080/auth/google/callback",
      });

    await request(app)
      .post("/api/v1/auth/google/complete-profile")
      .set("Authorization", `Bearer ${callbackRes.body.accessToken}`)
      .send({
        fullName: "OTP User Updated",
        password: "password123",
      });

    const secondCallbackRes = await request(app)
      .post("/api/v1/auth/google/callback-handler")
      .set("User-Agent", "vitest-agent")
      .send({
        code: "google-auth-code",
        redirectUri: "http://localhost:8080/auth/google/callback",
      });

    expect(secondCallbackRes.status).toBe(200);
    expect(secondCallbackRes.body.success).toBe(true);
    expect(secondCallbackRes.body.verified).toBe(true);
    expect(secondCallbackRes.body.redirectTo).toBe("/");
    expect(secondCallbackRes.body.user.hasPassword).toBe(true);
  });
});
