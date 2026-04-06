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
import { connectDB } from "./config/db";
import { initSocket } from "./socket";

const httpServer = createServer(app);
initSocket(httpServer);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});