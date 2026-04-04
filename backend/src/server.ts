import "dotenv/config";
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