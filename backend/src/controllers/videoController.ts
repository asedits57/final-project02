import { Request, Response } from "express";

import {
  createVideoSchema,
  objectIdParamSchema,
  updateVideoSchema,
  videoListQuerySchema,
} from "../validators/adminValidator";
import { sanitizeObject } from "../utils/sanitization";
import catchAsync from "../utils/catchAsync";
import { getAuthenticatedUserId } from "../utils/authRequest";
import {
  createAdminVideo,
  deleteAdminVideo,
  getAdminVideoById,
  getUserVideoById,
  listAdminVideos,
  listUserVideos,
  publishAdminVideo,
  unpublishAdminVideo,
  updateAdminVideo,
} from "../services/videoService";

export const listVideos = catchAsync(async (req: Request, res: Response) => {
  const query = videoListQuerySchema.parse(req.query);
  const result = await listAdminVideos(query);
  res.json({ success: true, ...result });
});

export const getVideo = catchAsync(async (req: Request, res: Response) => {
  const { id } = objectIdParamSchema.parse(req.params);
  const video = await getAdminVideoById(id);
  res.json({ success: true, data: video });
});

export const createVideo = catchAsync(async (req: Request, res: Response) => {
  const parsedPayload = createVideoSchema.parse(req.body);
  const payload = {
    ...sanitizeObject({
      ...parsedPayload,
      upload: undefined,
    }),
    ...(parsedPayload.upload ? { upload: parsedPayload.upload } : {}),
  };
  const video = await createAdminVideo(payload, getAuthenticatedUserId(req));
  res.status(201).json({ success: true, data: video });
});

export const updateVideo = catchAsync(async (req: Request, res: Response) => {
  const { id } = objectIdParamSchema.parse(req.params);
  const parsedPayload = updateVideoSchema.parse(req.body);
  const payload = {
    ...sanitizeObject({
      ...parsedPayload,
      upload: undefined,
    }),
    ...(parsedPayload.upload ? { upload: parsedPayload.upload } : {}),
  };
  const video = await updateAdminVideo(id, payload, getAuthenticatedUserId(req));
  res.json({ success: true, data: video });
});

export const removeVideo = catchAsync(async (req: Request, res: Response) => {
  const { id } = objectIdParamSchema.parse(req.params);
  await deleteAdminVideo(id, getAuthenticatedUserId(req));
  res.json({ success: true, message: "Video deleted successfully" });
});

export const publishVideo = catchAsync(async (req: Request, res: Response) => {
  const { id } = objectIdParamSchema.parse(req.params);
  const video = await publishAdminVideo(id, getAuthenticatedUserId(req));
  res.json({ success: true, data: video });
});

export const unpublishVideo = catchAsync(async (req: Request, res: Response) => {
  const { id } = objectIdParamSchema.parse(req.params);
  const video = await unpublishAdminVideo(id, getAuthenticatedUserId(req));
  res.json({ success: true, data: video });
});

export const listVisibleVideos = catchAsync(async (_req: Request, res: Response) => {
  const videos = await listUserVideos();
  res.json({ success: true, data: videos });
});

export const getVisibleVideo = catchAsync(async (req: Request, res: Response) => {
  const { id } = objectIdParamSchema.parse(req.params);
  const video = await getUserVideoById(id);
  res.json({ success: true, data: video });
});
