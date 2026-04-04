import { createClient } from "redis";

export const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
  socket: {
    reconnectStrategy: false // Disable infinite retries
  }
});

redisClient.on("error", (err) => {
  console.log("Redis connection error:", err);
});

redisClient.connect().catch(console.error);

export default redisClient;
