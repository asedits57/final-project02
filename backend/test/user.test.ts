import request from "supertest";
import app from "../src/app";
import User from "../src/models/User";
import { generateAccessToken } from "../src/utils/generateToken";
import mongoose from "mongoose";

describe("User Controller Tests", () => {
  let token: string;
  let testUser: any;

  beforeAll(async () => {
    // Connect to in-memory DB or similar setup here if not handled globally
    testUser = await User.create({
      email: "user_test@example.com",
      password: "password123",
      username: "user_test",
      fullName: "Test User",
    });

    token = generateAccessToken(testUser._id.toString());
  });

  afterAll(async () => {
    await User.deleteOne({ email: "user_test@example.com" });
  });

  it("GET /api/v1/profile - should return user profile if authenticated", async () => {
    const res = await request(app)
      .get("/api/v1/profile")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe("user_test@example.com");
  });

  it("GET /api/v1/profile - should fail without a token", async () => {
    const res = await request(app).get("/api/v1/profile");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
