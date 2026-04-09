import { createClient } from "redis";
import { logger } from "../utils/logger";
import { serializeError } from "../utils/logging";

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
    logger.warn("Redis connection issue", serializeError(err));
  });

  redisClient.connect().catch((error) => {
    logger.warn("Redis offline: caching disabled", serializeError(error));
  });
}

export const safeGet = async (key: string) => {
  try {
    if (!redisClient?.isOpen) return null;
    return await redisClient.get(key);
  } catch (err) {
    logger.warn("Redis GET failed", { key, ...serializeError(err) });
    return null;
  }
};

export const safeSet = async (key: string, value: string, options?: Record<string, unknown>) => {
  try {
    if (!redisClient?.isOpen) return;
    await redisClient.set(key, value, options);
  } catch (err) {
    logger.warn("Redis SET failed", { key, ...serializeError(err) });
  }
};

export const safeDel = async (key: string) => {
  try {
    if (!redisClient?.isOpen) return;
    await redisClient.del(key);
  } catch (err) {
    logger.warn("Redis DEL failed", { key, ...serializeError(err) });
  }
};

export default redisClient;
