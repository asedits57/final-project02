import "dotenv/config";

// ✅ VALIDATE ENVIRONMENT VARIABLES
const REQUIRED_ENV = ["JWT_SECRET", "MONGO_URI"];
REQUIRED_ENV.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Error: Environment variable ${key} is missing!`);
    process.exit(1);
  }
});

import { createServer } from "http";
import app from "./app";
import { connectDB, disconnectDB } from "./config/db";
import { initSocket } from "./services/socketService";

const httpServer = createServer(app);
initSocket(httpServer);

const PORT = process.env.PORT || 5000;
let shuttingDown = false;

const shutdown = async (signal: string, exitCode = 0) => {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  console.log(`Received ${signal}. Shutting down server gracefully...`);

  try {
    await new Promise<void>((resolve) => {
      httpServer.close(() => resolve());
    });
  } catch (error) {
    console.error("HTTP server shutdown failed:", error);
  }

  try {
    await disconnectDB();
  } catch (error) {
    console.error("Database shutdown failed:", error);
  }

  process.exit(exitCode);
};

const startServer = async () => {
  await connectDB();

  httpServer.on("error", (error: NodeJS.ErrnoException) => {
    if (error.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is already in use. Stop the existing process or change PORT in backend/.env.`);
    } else {
      console.error("HTTP server error:", error);
    }

    void shutdown("server-error", 1);
  });

  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
  void shutdown("unhandledRejection", 1);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  void shutdown("uncaughtException", 1);
});

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
