import "dotenv/config";
import { logger } from "./utils/logger";
import { serializeError } from "./utils/logging";

// ✅ VALIDATE ENVIRONMENT VARIABLES
const REQUIRED_ENV = ["JWT_SECRET", "MONGO_URI"];
REQUIRED_ENV.forEach((key) => {
  if (!process.env[key]) {
    logger.error("Missing required environment variable", { key });
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
  logger.info("Shutting down server gracefully", { signal });

  try {
    await new Promise<void>((resolve) => {
      httpServer.close(() => resolve());
    });
  } catch (error) {
    logger.error("HTTP server shutdown failed", serializeError(error));
  }

  try {
    await disconnectDB();
  } catch (error) {
    logger.error("Database shutdown failed", serializeError(error));
  }

  process.exit(exitCode);
};

const startServer = async () => {
  await connectDB();

  httpServer.on("error", (error: NodeJS.ErrnoException) => {
    if (error.code === "EADDRINUSE") {
      logger.error("Server port is already in use", { port: PORT, code: error.code });
    } else {
      logger.error("HTTP server error", serializeError(error));
    }

    void shutdown("server-error", 1);
  });

  httpServer.listen(PORT, () => {
    logger.info("Server running", { url: `http://localhost:${PORT}` });
  });
};

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled promise rejection", serializeError(reason));
  void shutdown("unhandledRejection", 1);
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception", serializeError(error));
  void shutdown("uncaughtException", 1);
});

startServer().catch((err) => {
  logger.error("Failed to start server", serializeError(err));
  process.exit(1);
});
