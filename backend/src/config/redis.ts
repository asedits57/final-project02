import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL?.trim();

export const redisClient = redisUrl
  ? createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: false,
      },
    })
  : null;

if (redisClient) {
  redisClient.on("error", (err) => {
    console.warn("Redis connection issue:", err.message || err);
  });

  redisClient.connect().catch(() => console.warn("Redis offline: caching disabled."));
}

export const safeGet = async (key: string) => {
  try {
    if (!redisClient?.isOpen) return null;
    return await redisClient.get(key);
  } catch (err) {
    console.warn(`Redis GET error for ${key}:`, err);
    return null;
  }
};

export const safeSet = async (key: string, value: string, options?: Record<string, unknown>) => {
  try {
    if (!redisClient?.isOpen) return;
    await redisClient.set(key, value, options);
  } catch (err) {
    console.warn(`Redis SET error for ${key}:`, err);
  }
};

export const safeDel = async (key: string) => {
  try {
    if (!redisClient?.isOpen) return;
    await redisClient.del(key);
  } catch (err) {
    console.warn(`Redis DEL error for ${key}:`, err);
  }
};

export default redisClient;
