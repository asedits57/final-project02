import path from "path";
import { promises as fs } from "fs";
import mongoose from "mongoose";

import LearningVideo from "../models/LearningVideo";
import ApiError from "../utils/ApiError";
import { logBestEffortFailure } from "../utils/bestEffort";
import { buildSearchRegex, getPagination } from "../utils/query";
import { recordAdminActivity } from "./adminActivityService";

type VideoFilters = {
  page: number;
  limit: number;
  search?: string;
  category?: string;
  level?: string;
  visibility?: string;
  status?: string;
};

type VideoPayload = {
  title?: string;
  description?: string;
  category?: string;
  level?: string;
  thumbnail?: string;
  videoUrl?: string;
  upload?: {
    dataUrl: string;
    mimeType?: string;
    fileName?: string;
    sizeBytes?: number;
  };
  duration?: number;
  tags?: string[];
  visibility?: string;
  status?: string;
};

const VIDEO_UPLOADS_ROOT = path.join(process.cwd(), "uploads", "learning-videos");
const MAX_VIDEO_UPLOAD_BYTES = 60 * 1024 * 1024;

const mimeExtensionMap: Record<string, string> = {
  "video/webm": ".webm",
  "video/mp4": ".mp4",
  "video/quicktime": ".mov",
  "video/x-matroska": ".mkv",
  "video/mpeg": ".mpeg",
};

const ensureUploadsRoot = async () => {
  await fs.mkdir(VIDEO_UPLOADS_ROOT, { recursive: true });
};

const parseDataUrl = (dataUrl: string) => {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);

  if (!match) {
    throw new ApiError(400, "Invalid video upload payload");
  }

  return {
    mimeType: match[1].trim().toLowerCase(),
    base64: match[2],
  };
};

const inferExtension = (mimeType: string) => mimeExtensionMap[mimeType] || ".mp4";

const isLocalUploadedVideo = (videoUrl?: string) => Boolean(videoUrl?.startsWith("/uploads/learning-videos/"));

const removeLocalUploadedVideo = async (videoUrl?: string) => {
  if (!isLocalUploadedVideo(videoUrl)) {
    return;
  }

  const filename = videoUrl!.split("/").pop();
  if (!filename) {
    return;
  }

  const absolutePath = path.join(VIDEO_UPLOADS_ROOT, filename);
  await fs.unlink(absolutePath).catch(() => undefined);
};

const writeUploadedVideoAsset = async (
  videoId: string,
  upload: NonNullable<VideoPayload["upload"]>,
) => {
  const parsed = parseDataUrl(upload.dataUrl);
  const mimeType = (upload.mimeType || parsed.mimeType).toLowerCase();
  const buffer = Buffer.from(parsed.base64, "base64");

  if ((upload.sizeBytes || buffer.byteLength) > MAX_VIDEO_UPLOAD_BYTES) {
    throw new ApiError(413, "Uploaded video is too large. Use a file under 60 MB or provide an external video URL.");
  }

  await ensureUploadsRoot();

  const extension = inferExtension(mimeType);
  const filename = `${videoId}-${Date.now()}${extension}`;
  const absolutePath = path.join(VIDEO_UPLOADS_ROOT, filename);
  await fs.writeFile(absolutePath, buffer);

  return {
    videoUrl: `/uploads/learning-videos/${filename}`,
    sourceType: "upload" as const,
    storage: {
      originalFileName: upload.fileName,
      mimeType,
      sizeBytes: upload.sizeBytes || buffer.byteLength,
    },
  };
};

const buildPersistableVideoPayload = async (videoId: string, payload: VideoPayload) => {
  if (payload.upload) {
    const uploadedAsset = await writeUploadedVideoAsset(videoId, payload.upload);
    return {
      ...payload,
      ...uploadedAsset,
      upload: undefined,
    };
  }

  const persistablePayload: Record<string, unknown> = {
    ...payload,
    upload: undefined,
  };

  if (payload.videoUrl) {
    persistablePayload.sourceType = "external";
    persistablePayload.storage = undefined;
  }

  return persistablePayload;
};

const buildVideoQuery = ({ search, category, level, visibility, status }: Omit<VideoFilters, "page" | "limit">) => {
  const searchRegex = buildSearchRegex(search);
  const query: Record<string, unknown> = {};

  if (category) query.category = category;
  if (level) query.level = level;
  if (visibility) query.visibility = visibility;
  if (status) query.status = status;
  if (searchRegex) {
    query.$or = [{ title: searchRegex }, { description: searchRegex }, { category: searchRegex }, { tags: searchRegex }];
  }

  return query;
};

export const listAdminVideos = async (filters: VideoFilters) => {
  const { page, limit, skip } = getPagination(filters.page, filters.limit);
  const query = buildVideoQuery(filters);

  const [items, total] = await Promise.all([
    LearningVideo.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    LearningVideo.countDocuments(query),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

export const getAdminVideoById = async (videoId: string) => {
  const video = await LearningVideo.findById(videoId)
    .populate("createdBy", "email fullName role")
    .populate("updatedBy", "email fullName role")
    .lean();

  if (!video) {
    throw new ApiError(404, "Learning video not found");
  }

  return video;
};

export const createAdminVideo = async (payload: VideoPayload, userId: string) => {
  const video = new LearningVideo({
    _id: new mongoose.Types.ObjectId(),
    createdBy: userId,
    updatedBy: userId,
    sourceType: payload.videoUrl ? "external" : "upload",
  });

  const persistablePayload = await buildPersistableVideoPayload(video._id.toString(), payload);
  Object.assign(video, persistablePayload, {
    createdBy: userId,
    updatedBy: userId,
  });
  await video.save();

  await recordAdminActivity({
    actorId: userId,
    action: "video.created",
    targetType: "video",
    targetId: video._id.toString(),
    description: `Created learning video ${video.title}`,
  });
  try {
    const { emitVideoRealtimeEvent } = await import("./socketService");
    emitVideoRealtimeEvent("created", { id: video._id.toString() });
  } catch (error) {
    logBestEffortFailure("Failed to emit video created realtime event", error);
  }

  return getAdminVideoById(video._id.toString());
};

export const updateAdminVideo = async (videoId: string, payload: VideoPayload, userId: string) => {
  const video = await LearningVideo.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Learning video not found");
  }

  const hadLocalUpload = isLocalUploadedVideo(video.videoUrl);
  const nextPayload = await buildPersistableVideoPayload(videoId, payload);

  if ((payload.upload || (payload.videoUrl && payload.videoUrl !== video.videoUrl)) && hadLocalUpload) {
    await removeLocalUploadedVideo(video.videoUrl);
  }

  Object.assign(video, nextPayload, { updatedBy: userId });
  await video.save();

  await recordAdminActivity({
    actorId: userId,
    action: "video.updated",
    targetType: "video",
    targetId: videoId,
    description: `Updated learning video ${video.title}`,
  });
  try {
    const { emitVideoRealtimeEvent } = await import("./socketService");
    emitVideoRealtimeEvent("updated", { id: videoId });
  } catch (error) {
    logBestEffortFailure("Failed to emit video updated realtime event", error);
  }

  return getAdminVideoById(videoId);
};

export const deleteAdminVideo = async (videoId: string, userId: string) => {
  const video = await LearningVideo.findByIdAndDelete(videoId);

  if (!video) {
    throw new ApiError(404, "Learning video not found");
  }

  await removeLocalUploadedVideo(video.videoUrl);

  await recordAdminActivity({
    actorId: userId,
    action: "video.deleted",
    targetType: "video",
    targetId: videoId,
    description: `Deleted learning video ${video.title}`,
  });
  try {
    const { emitVideoRealtimeEvent } = await import("./socketService");
    emitVideoRealtimeEvent("deleted", { id: videoId });
  } catch (error) {
    logBestEffortFailure("Failed to emit video deleted realtime event", error);
  }
};

export const publishAdminVideo = async (videoId: string, userId: string) => {
  return updateAdminVideo(videoId, { status: "published" }, userId);
};

export const unpublishAdminVideo = async (videoId: string, userId: string) => {
  return updateAdminVideo(videoId, { status: "draft" }, userId);
};

export const listUserVideos = async () => {
  return LearningVideo.find({
    status: "published",
    visibility: { $in: ["public", "authenticated"] },
  }).sort({ createdAt: -1 }).lean();
};

export const getUserVideoById = async (videoId: string) => {
  const video = await LearningVideo.findOne({
    _id: videoId,
    status: "published",
    visibility: { $in: ["public", "authenticated"] },
  }).lean();

  if (!video) {
    throw new ApiError(404, "Learning video not found");
  }

  return video;
};
