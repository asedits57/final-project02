import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Question from "../models/Question";
import { createMongoMemoryServer, resolveMongoMemoryRoot } from "./memoryMongo";
import { ensureBootstrapAdmin } from "../services/adminBootstrapService";
import { backfillTaskQuestionBankAssignments } from "../services/taskService";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mongoMemoryServer: Awaited<ReturnType<typeof createMongoMemoryServer>> | null = null;
let reconnectPromise: Promise<void> | null = null;
let lastDatabaseHealthCheckAt = 0;
let connectionListenersAttached = false;

mongoose.set("bufferCommands", false);

const DB_CONNECT_OPTIONS = {
  serverSelectionTimeoutMS: 2000,
  socketTimeoutMS: 5000,
} as const;
const DB_HEALTH_CACHE_MS = 5000;
const DB_HEALTH_TIMEOUT_MS = 1500;

const attachConnectionListeners = () => {
  if (connectionListenersAttached) {
    return;
  }

  connectionListenersAttached = true;

  mongoose.connection.on("connected", () => {
    lastDatabaseHealthCheckAt = Date.now();
  });

  mongoose.connection.on("disconnected", () => {
    lastDatabaseHealthCheckAt = 0;
    console.warn("MongoDB disconnected");
  });

  mongoose.connection.on("error", (error) => {
    lastDatabaseHealthCheckAt = 0;
    console.error("MongoDB connection error:", error);
  });
};

const runPostConnectTasks = async () => {
  await ensureBootstrapAdmin();
  const syncedTasks = await backfillTaskQuestionBankAssignments();
  if (syncedTasks > 0) {
    console.log(`Backfilled question bank questions into ${syncedTasks} existing task(s)`);
  }
};

const seedQuestionsIfNeeded = async () => {
  const questionsPath = path.join(__dirname, "../../../backend/data/questions.json");
  if (!fs.existsSync(questionsPath)) {
    return;
  }

  const count = await Question.countDocuments();
  if (count !== 0) {
    return;
  }

  const rawData = JSON.parse(fs.readFileSync(questionsPath, "utf-8")) as Record<string, unknown>;
  const flattened: Array<Record<string, unknown>> = [];
  const parseTimeLimit = (value: unknown) => {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string") {
      const match = value.match(/\d+/);
      if (match) {
        return Number(match[0]);
      }
    }

    return undefined;
  };

  for (const [moduleName, items] of Object.entries(rawData)) {
    if (!Array.isArray(items)) {
      continue;
    }

    items.forEach((item) => {
      if (item && typeof item === "object") {
        const typedItem = item as Record<string, unknown>;
        const rawDifficulty = String(typedItem.difficulty || "medium").toLowerCase();
        const normalizedDifficulty =
          rawDifficulty === "beginner" ? "easy" :
          rawDifficulty === "intermediate" ? "medium" :
          rawDifficulty === "advanced" ? "hard" :
          rawDifficulty;

        flattened.push({
          ...typedItem,
          module: moduleName,
          category: moduleName,
          title: typedItem.title || typedItem.question || "Seeded question",
          questionText: typedItem.question || typedItem.text || typedItem.title || "No text available",
          text: typedItem.question || typedItem.text || typedItem.title || "No text available",
          questionType: Array.isArray(typedItem.options) ? "multiple_choice" : "short_answer",
          difficulty: normalizedDifficulty || "medium",
          status: "published",
          targetType: "both",
          points: Number(typedItem.points || 1),
          options: Array.isArray(typedItem.options) ? typedItem.options : [],
          timeLimit: parseTimeLimit(typedItem.timeLimit),
        });
      }
    });
  }

  if (flattened.length > 0) {
    await Question.insertMany(flattened);
    console.log(`Seeded ${flattened.length} questions into MongoDB memory mode`);
  }
};

const connectMemoryDB = async () => {
  if (!mongoMemoryServer) {
    mongoMemoryServer = await createMongoMemoryServer();
  }

  await mongoose.connect(mongoMemoryServer.getUri(), DB_CONNECT_OPTIONS);
  console.log(`MongoDB memory mode connected (${resolveMongoMemoryRoot()})`);
  await seedQuestionsIfNeeded();
  await runPostConnectTasks();
};

const stopMemoryServer = async () => {
  if (!mongoMemoryServer) {
    return;
  }

  try {
    await mongoMemoryServer.stop();
  } finally {
    mongoMemoryServer = null;
  }
};

const disconnectMongoose = async () => {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  try {
    await mongoose.disconnect();
  } catch (error) {
    console.warn("MongoDB disconnect warning:", error);
  } finally {
    lastDatabaseHealthCheckAt = 0;
  }
};

const reconnectDatabase = async () => {
  if (reconnectPromise) {
    return reconnectPromise;
  }

  reconnectPromise = (async () => {
    const mongoUri = process.env.MONGO_URI?.trim();

    if (!mongoUri) {
      throw new Error("No MONGO_URI in .env");
    }

    await disconnectMongoose();

    if (mongoUri.toLowerCase() === "memory") {
      await stopMemoryServer();
      await connectMemoryDB();
      return;
    }

    try {
      await mongoose.connect(mongoUri, DB_CONNECT_OPTIONS);
      console.log(`MongoDB reconnected: ${mongoUri}`);
      await runPostConnectTasks();
    } catch (error) {
      console.log(`MongoDB at ${mongoUri} unavailable during reconnect. Falling back to in-memory MongoDB.`);
      await stopMemoryServer();
      await connectMemoryDB();
    }
  })();

  try {
    await reconnectPromise;
  } finally {
    reconnectPromise = null;
  }
};

const pingDatabase = async () => {
  if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
    return false;
  }

  const now = Date.now();
  if (now - lastDatabaseHealthCheckAt < DB_HEALTH_CACHE_MS) {
    return true;
  }

  try {
    await Promise.race([
      mongoose.connection.db.admin().ping(),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error("MongoDB health check timed out")), DB_HEALTH_TIMEOUT_MS);
      }),
    ]);
    lastDatabaseHealthCheckAt = now;
    return true;
  } catch (error) {
    lastDatabaseHealthCheckAt = 0;
    console.warn("MongoDB health check failed. Reconnecting...", error);
    return false;
  }
};

export const disconnectDB = async () => {
  await disconnectMongoose();
  await stopMemoryServer();
};

export const connectDB = async () => {
  attachConnectionListeners();

  const mongoUri = process.env.MONGO_URI?.trim();

  if (!mongoUri) {
    throw new Error("No MONGO_URI in .env");
  }

  if (mongoUri.toLowerCase() === "memory") {
    await connectMemoryDB();
    return;
  }

  try {
    await mongoose.connect(mongoUri, DB_CONNECT_OPTIONS);
    console.log(`MongoDB connected: ${mongoUri}`);
    await runPostConnectTasks();
  } catch (err) {
    const targetLabel = mongoUri ? `MongoDB at ${mongoUri}` : "Configured MongoDB";
    console.log(`${targetLabel} unavailable. Falling back to in-memory MongoDB.`);

    await connectMemoryDB();
  }
};

export const ensureDatabaseConnection = async () => {
  if (await pingDatabase()) {
    return;
  }

  await reconnectDatabase();
};

export const getDatabaseStatus = () => ({
  readyState: mongoose.connection.readyState,
  readyStateLabel:
    mongoose.connection.readyState === 1 ? "connected" :
    mongoose.connection.readyState === 2 ? "connecting" :
    mongoose.connection.readyState === 3 ? "disconnecting" :
    "disconnected",
  mode: process.env.MONGO_URI?.trim().toLowerCase() === "memory" ? "memory" : "external",
});
