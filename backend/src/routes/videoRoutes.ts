import express from "express";

import { getVisibleVideo, listVisibleVideos } from "../controllers/videoController";

const router = express.Router();

router.get("/videos", listVisibleVideos);
router.get("/videos/:id", getVisibleVideo);

export default router;
