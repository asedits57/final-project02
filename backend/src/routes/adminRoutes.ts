import express from "express";

import { protect } from "../middleware/authMiddleware";
import { isAdmin } from "../middleware/adminMiddleware";
import {
  adjustLeaderboardPoints,
  changeUserRole,
  changeUserStatus,
  generateCertificate,
  getCertificate,
  getDashboard,
  getFinalTest,
  getLeaderboard,
  getUser,
  inviteAdmin,
  listCertificates,
  listFinalTests,
  listUsers,
  recalculateLeaderboard,
  regenerateCertificate,
  resetLeaderboard,
  reviewFinalTest,
} from "../controllers/adminController";
import {
  changeQuestionStatus,
  createQuestion,
  duplicateQuestion,
  getQuestion,
  listQuestions,
  removeQuestion,
  updateQuestion,
} from "../controllers/questionBankController";
import {
  createTask,
  getTask,
  listTasks,
  publishTask,
  removeTask,
  unpublishTask,
  updateTask,
} from "../controllers/taskController";
import {
  createDailyTask,
  getDailyTask,
  listDailyTasks,
  publishDailyTask,
  removeDailyTask,
  unpublishDailyTask,
  updateDailyTask,
} from "../controllers/dailyTaskController";
import {
  createVideo,
  getVideo,
  listVideos,
  publishVideo,
  removeVideo,
  unpublishVideo,
  updateVideo,
} from "../controllers/videoController";
import {
  getFinalTestConfig,
  publishFinalTestConfig,
  unpublishFinalTestConfig,
  upsertFinalTestConfig,
} from "../controllers/finalTestConfigController";
import {
  createNotification,
  listNotifications,
} from "../controllers/notificationController";

const router = express.Router();

router.use(protect, isAdmin);

router.get("/dashboard", getDashboard);

router.get("/users", listUsers);
router.get("/users/:id", getUser);
router.patch("/users/:id/role", changeUserRole);
router.patch("/users/:id/status", changeUserStatus);
router.post("/invitations", inviteAdmin);

router.get("/questions", listQuestions);
router.get("/questions/:id", getQuestion);
router.post("/questions", createQuestion);
router.patch("/questions/:id", updateQuestion);
router.delete("/questions/:id", removeQuestion);
router.post("/questions/:id/duplicate", duplicateQuestion);
router.patch("/questions/:id/status", changeQuestionStatus);

router.get("/tasks", listTasks);
router.get("/tasks/:id", getTask);
router.post("/tasks", createTask);
router.patch("/tasks/:id", updateTask);
router.delete("/tasks/:id", removeTask);
router.patch("/tasks/:id/publish", publishTask);
router.patch("/tasks/:id/unpublish", unpublishTask);

router.get("/daily-tasks", listDailyTasks);
router.get("/daily-tasks/:id", getDailyTask);
router.post("/daily-tasks", createDailyTask);
router.patch("/daily-tasks/:id", updateDailyTask);
router.delete("/daily-tasks/:id", removeDailyTask);
router.patch("/daily-tasks/:id/publish", publishDailyTask);
router.patch("/daily-tasks/:id/unpublish", unpublishDailyTask);

router.get("/videos", listVideos);
router.get("/videos/:id", getVideo);
router.post("/videos", createVideo);
router.patch("/videos/:id", updateVideo);
router.delete("/videos/:id", removeVideo);
router.patch("/videos/:id/publish", publishVideo);
router.patch("/videos/:id/unpublish", unpublishVideo);

router.get("/notifications", listNotifications);
router.post("/notifications", createNotification);

router.get("/leaderboard", getLeaderboard);
router.post("/leaderboard/recalculate", recalculateLeaderboard);
router.post("/leaderboard/reset", resetLeaderboard);
router.patch("/leaderboard/users/:userId/points", adjustLeaderboardPoints);

router.get("/final-test-config", getFinalTestConfig);
router.put("/final-test-config", upsertFinalTestConfig);
router.patch("/final-test-config/publish", publishFinalTestConfig);
router.patch("/final-test-config/unpublish", unpublishFinalTestConfig);

router.get("/final-tests", listFinalTests);
router.get("/final-tests/:id", getFinalTest);
router.patch("/final-tests/:id/review", reviewFinalTest);

router.get("/certificates", listCertificates);
router.get("/certificates/:id", getCertificate);
router.post("/certificates/generate", generateCertificate);
router.post("/certificates/:id/regenerate", regenerateCertificate);

export default router;
