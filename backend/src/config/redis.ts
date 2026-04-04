import { createClient } from "redis";

export const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
  socket: {
    reconnectStrategy: false // Disable infinite retries
  }
});

redisClient.on("error", (err) => {
  // Silent error logs if no URL is provided to prevent terminal noise
  if (process.env.REDIS_URL) {
    console.warn("Redis connection issue:", err.message || err);
  }
});

if (!process.env.REDIS_URL) {
  console.log("ℹ️ No REDIS_URL found. Caching remains disabled.");
} else {
  redisClient.connect().catch(() => console.warn("Redis offline: Caching disabled."));
}

export const safeGet = async (key: string) => {
  try {
    if (!redisClient.isOpen) return null;
    return await redisClient.get(key);
  } catch (err) {
    console.warn(`Redis GET error for ${key}:`, err);
    return null;
  }
};

export const safeSet = async (key: string, value: string, options?: any) => {
  try {
    if (!redisClient.isOpen) return;
    await redisClient.set(key, value, options);
  } catch (err) {
    console.warn(`Redis SET error for ${key}:`, err);
  }
};

export const safeDel = async (key: string) => {
  try {
    if (!redisClient.isOpen) return;
    await redisClient.del(key);
  } catch (err) {
    console.warn(`Redis DEL error for ${key}:`, err);
  }
};

export default redisClient;
