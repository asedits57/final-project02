import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import app from "../src/app";
import User from "../src/models/User";
import { generateAccessToken } from "../src/utils/generateToken";
import { connectMongoTestDatabase, getMongoTestAvailability, type TestDatabaseHandle } from "./support/database";

const mongoSupport = getMongoTestAvailability();
const describeMongo = mongoSupport.enabled ? describe : describe.skip;

describeMongo("User Controller Tests", () => {
  let token: string;
  let testUser: { _id: { toString(): string } };
  let database: TestDatabaseHandle;

  beforeAll(async () => {
    database = await connectMongoTestDatabase();

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
    await database.stop();
  });

  it("GET /api/v1/profile - should return user profile if authenticated", async () => {
    const res = await request(app)
      .get("/api/v1/profile")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe("user_test@example.com");
  });

  it("GET /api/v1/profile - should fail without a token", async () => {
    const res = await request(app).get("/api/v1/profile");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
