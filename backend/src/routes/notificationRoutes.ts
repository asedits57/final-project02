import express from "express";

import { protect } from "../middleware/authMiddleware";
import { listUserVisibleNotifications, markNotificationRead } from "../controllers/notificationController";

const router = express.Router();

router.get("/notifications", protect, listUserVisibleNotifications);
router.patch("/notifications/:id/read", protect, markNotificationRead);

export default router;
