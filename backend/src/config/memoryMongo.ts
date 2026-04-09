import fs from "fs";
import path from "path";
import os from "os";
import { MongoMemoryServer } from "mongodb-memory-server";

const MEMORY_ROOT_FOLDER = "final-project02-mongo-memory";
const MIN_REQUIRED_FREE_BYTES = 512 * 1024 * 1024;
const WIRED_TIGER_CACHE_SIZE_GB = "0.25";
const DEFAULT_BINARY_VERSION = "8.2.1";

const getDriveFreeBytes = (targetPath: string) => {
  try {
    const rootPath = path.parse(path.resolve(targetPath)).root;
    const stats = fs.statfsSync(rootPath);
    return stats.bavail * stats.bsize;
  } catch {
    return 0;
  }
};

const ensureDirectory = (targetPath: string) => {
  fs.mkdirSync(targetPath, { recursive: true });
  return targetPath;
};

const canUseDirectory = (targetPath: string) => {
  try {
    const resolvedPath = ensureDirectory(path.resolve(targetPath));
    fs.accessSync(resolvedPath, fs.constants.R_OK | fs.constants.W_OK);

    const probeRoot = fs.mkdtempSync(path.join(resolvedPath, "probe-"));
    fs.rmSync(probeRoot, { recursive: true, force: true });

    return true;
  } catch {
    return false;
  }
};

const getConfiguredMemoryRoot = () => {
  const configuredPath = process.env.MONGO_MEMORY_ROOT?.trim();
  if (!configuredPath) {
    return null;
  }

  return path.resolve(configuredPath);
};

const getFallbackMemoryRoots = () => {
  const candidates = [
    path.resolve(process.cwd(), ".cache", MEMORY_ROOT_FOLDER),
    path.join(os.tmpdir(), MEMORY_ROOT_FOLDER),
    path.join("D:\\", MEMORY_ROOT_FOLDER),
    path.join("C:\\", MEMORY_ROOT_FOLDER),
  ];

  return candidates.filter((candidate, index) => candidates.indexOf(candidate) === index);
};

export const resolveMongoMemoryRoot = () => {
  const configuredRoot = getConfiguredMemoryRoot();
  if (configuredRoot && canUseDirectory(configuredRoot)) {
    return ensureDirectory(configuredRoot);
  }

  const rankedRoots = getFallbackMemoryRoots()
    .filter((candidate) => canUseDirectory(candidate))
    .map((candidate) => ({
      candidate,
      freeBytes: getDriveFreeBytes(candidate),
    }))
    .sort((left, right) => right.freeBytes - left.freeBytes);

  const bestRoot = rankedRoots.find((entry) => entry.freeBytes >= MIN_REQUIRED_FREE_BYTES) || rankedRoots[0];
  if (!bestRoot) {
    throw new Error(
      "Unable to determine a writable storage root for Mongo memory mode. Set MONGO_MEMORY_ROOT to a writable folder.",
    );
  }

  return ensureDirectory(bestRoot.candidate);
};

export const resolveMongoMemoryBinary = () => {
  const configuredBinary = process.env.MONGO_MEMORY_BINARY?.trim();
  if (configuredBinary && fs.existsSync(configuredBinary)) {
    return configuredBinary;
  }

  const homeBinary = path.join(
    process.env.USERPROFILE || "",
    ".cache",
    "mongodb-binaries",
    "mongod-x64-win32-8.2.1.exe",
  );

  return fs.existsSync(homeBinary) ? homeBinary : undefined;
};

export const createMongoMemoryServer = async () => {
  const memoryRoot = resolveMongoMemoryRoot();
  const instanceRoot = fs.mkdtempSync(path.join(memoryRoot, "instance-"));
  const binaryRoot = ensureDirectory(path.join(memoryRoot, "binaries"));
  const systemBinary = resolveMongoMemoryBinary();

  if (systemBinary) {
    process.env.MONGOMS_SYSTEM_BINARY_VERSION_CHECK = "false";
  }

  const options = {
    binary: {
      version: process.env.MONGO_MEMORY_VERSION?.trim() || DEFAULT_BINARY_VERSION,
      downloadDir: binaryRoot,
      systemBinary,
    },
    instance: {
      dbPath: instanceRoot,
      storageEngine: "wiredTiger" as const,
      args: ["--wiredTigerCacheSizeGB", WIRED_TIGER_CACHE_SIZE_GB],
    },
  };

  return MongoMemoryServer.create(options);
};
