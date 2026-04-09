import mongoose from "mongoose";
import { createMongoMemoryServer, resolveMongoMemoryBinary } from "../../src/config/memoryMongo";

export type TestDatabaseHandle = {
  stop: () => Promise<void>;
};

type MongoTestAvailability = {
  enabled: boolean;
  reason?: string;
};

const canDownloadMongoBinary = () => process.env.MONGO_MEMORY_ALLOW_DOWNLOAD === "true";
const hasExplicitMongoBinary = () => !!process.env.MONGO_MEMORY_BINARY?.trim();

export const getMongoTestAvailability = (): MongoTestAvailability => {
  const externalMongoUri = process.env.TEST_MONGO_URI?.trim();
  if (externalMongoUri) {
    return { enabled: true };
  }

  if (hasExplicitMongoBinary() && resolveMongoMemoryBinary()) {
    return { enabled: true };
  }

  if (canDownloadMongoBinary()) {
    return { enabled: true };
  }

  return {
    enabled: false,
    reason:
      "Mongo-backed integration tests require TEST_MONGO_URI, an explicit MONGO_MEMORY_BINARY, or MONGO_MEMORY_ALLOW_DOWNLOAD=true.",
  };
};

export const connectMongoTestDatabase = async (): Promise<TestDatabaseHandle> => {
  const externalMongoUri = process.env.TEST_MONGO_URI?.trim();
  if (externalMongoUri) {
    await mongoose.connect(externalMongoUri);
    return {
      stop: async () => {
        if (mongoose.connection.readyState !== 0) {
          await mongoose.disconnect();
        }
      },
    };
  }

  const mongoServer = await createMongoMemoryServer();
  await mongoose.connect(mongoServer.getUri());

  return {
    stop: async () => {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }
      await mongoServer.stop();
    },
  };
};
