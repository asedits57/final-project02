import request from "supertest";
import { beforeAll, afterAll, describe, it, expect } from "vitest";
import app from "../src/app";
import User from "../src/models/User";
import { generateAccessToken } from "../src/utils/generateToken";
import { connectMongoTestDatabase, getMongoTestAvailability, type TestDatabaseHandle } from "./support/database";

const mongoSupport = getMongoTestAvailability();
const describeMongo = mongoSupport.enabled ? describe : describe.skip;

describeMongo("AI Controller Tests", () => {
  let token: string;
  let database: TestDatabaseHandle;

  beforeAll(async () => {
    database = await connectMongoTestDatabase();

    const testUser = await User.create({
      email: "ai_test@example.com",
      password: "password123",
      username: "ai_test",
    });

    token = generateAccessToken(testUser._id.toString());
  });

  afterAll(async () => {
    await User.deleteOne({ email: "ai_test@example.com" });
    await database.stop();
  });

  it("POST /api/v1/ai/generate - should return 401 if unauthenticated", async () => {
    const res = await request(app)
      .post("/api/v1/ai/generate")
      .send({ prompt: "What is a noun?" });

    expect(res.status).toBe(401);
  });

  it("POST /api/v1/ai/generate - should validate payload (missing prompt)", async () => {
    const res = await request(app)
      .post("/api/v1/ai/generate")
      .set("Authorization", `Bearer ${token}`)
      .send({}); // missing prompt

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // Note: We avoid testing the actual 200 response tightly because it calls real OpenAI
  // In a full enterprise app, we would mock aiService.askAI() here using jest.mock
});
