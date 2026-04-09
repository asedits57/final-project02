import { Request, Response } from "express";

import catchAsync from "../utils/catchAsync";
import { getAuthenticatedUserId } from "../utils/authRequest";
import {
  adminDashboardQuerySchema,
  adminUsersListQuerySchema,
  adjustLeaderboardPointsSchema,
  certificateListQuerySchema,
  createAdminInviteSchema,
  finalTestListQuerySchema,
  generateCertificateSchema,
  leaderboardListQuerySchema,
  objectIdParamSchema,
  resetLeaderboardSchema,
  reviewFinalTestSchema,
  updateUserRoleSchema,
  updateUserStatusSchema,
  userIdParamSchema,
} from "../validators/adminValidator";
import {
  adjustAdminUserPoints,
  generateAdminCertificate,
  getAdminCertificateById,
  getAdminDashboardOverview,
  getAdminFinalTestById,
  getAdminLeaderboard,
  getAdminUserById,
  listAdminCertificates,
  listAdminFinalTests,
  listAdminUsers,
  recalculateAdminLeaderboard,
  regenerateAdminCertificate,
  resetAdminLeaderboard,
  reviewAdminFinalTest,
  updateAdminUserRole,
  updateAdminUserStatus,
} from "../services/adminService";
import { inviteAdminByEmail } from "../services/adminInviteService";

export const getDashboard = catchAsync(async (req: Request, res: Response) => {
  const { recentActivityLimit } = adminDashboardQuerySchema.parse(req.query);
  const dashboard = await getAdminDashboardOverview(recentActivityLimit);
  res.json({ success: true, data: dashboard });
});

export const listUsers = catchAsync(async (req: Request, res: Response) => {
  const query = adminUsersListQuerySchema.parse(req.query);
  const result = await listAdminUsers(query);
  res.json({ success: true, ...result });
});

export const getUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = objectIdParamSchema.parse(req.params);
  const user = await getAdminUserById(id);
  res.json({ success: true, data: user });
});

export const changeUserRole = catchAsync(async (req: Request, res: Response) => {
  const { id } = objectIdParamSchema.parse(req.params);
  const { role } = updateUserRoleSchema.parse(req.body);
  const user = await updateAdminUserRole(id, role, getAuthenticatedUserId(req));
  res.json({ success: true, data: user });
});

export const changeUserStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = objectIdParamSchema.parse(req.params);
  const { status } = updateUserStatusSchema.parse(req.body);
  const user = await updateAdminUserStatus(id, status, getAuthenticatedUserId(req));
  res.json({ success: true, data: user });
});

export const inviteAdmin = catchAsync(async (req: Request, res: Response) => {
  const payload = createAdminInviteSchema.parse(req.body);
  const invite = await inviteAdminByEmail(payload, getAuthenticatedUserId(req));
  res.status(201).json({ success: true, data: invite });
});

export const getLeaderboard = catchAsync(async (req: Request, res: Response) => {
  const query = leaderboardListQuerySchema.parse(req.query);
  const result = await getAdminLeaderboard(query);
  res.json({ success: true, ...result });
});

export const recalculateLeaderboard = catchAsync(async (req: Request, res: Response) => {
  const snapshot = await recalculateAdminLeaderboard(getAuthenticatedUserId(req));
  res.json({ success: true, data: snapshot });
});

export const resetLeaderboard = catchAsync(async (req: Request, res: Response) => {
  const { resetScores } = resetLeaderboardSchema.parse(req.body || {});
  const snapshot = await resetAdminLeaderboard(resetScores, getAuthenticatedUserId(req));
  res.json({ success: true, data: snapshot });
});

export const adjustLeaderboardPoints = catchAsync(async (req: Request, res: Response) => {
  const { userId } = userIdParamSchema.parse(req.params);
  const payload = adjustLeaderboardPointsSchema.parse(req.body);
  const user = await adjustAdminUserPoints(userId, payload, getAuthenticatedUserId(req));
  res.json({ success: true, data: user });
});

export const listFinalTests = catchAsync(async (req: Request, res: Response) => {
  const query = finalTestListQuerySchema.parse(req.query);
  const result = await listAdminFinalTests(query);
  res.json({ success: true, ...result });
});

export const getFinalTest = catchAsync(async (req: Request, res: Response) => {
  const { id } = objectIdParamSchema.parse(req.params);
  const submission = await getAdminFinalTestById(id);
  res.json({ success: true, data: submission });
});

export const reviewFinalTest = catchAsync(async (req: Request, res: Response) => {
  const { id } = objectIdParamSchema.parse(req.params);
  const payload = reviewFinalTestSchema.parse(req.body);
  const submission = await reviewAdminFinalTest(id, payload, getAuthenticatedUserId(req));
  res.json({ success: true, data: submission });
});

export const listCertificates = catchAsync(async (req: Request, res: Response) => {
  const query = certificateListQuerySchema.parse(req.query);
  const result = await listAdminCertificates(query);
  res.json({ success: true, ...result });
});

export const getCertificate = catchAsync(async (req: Request, res: Response) => {
  const { id } = objectIdParamSchema.parse(req.params);
  const certificate = await getAdminCertificateById(id);
  res.json({ success: true, data: certificate });
});

export const generateCertificate = catchAsync(async (req: Request, res: Response) => {
  const payload = generateCertificateSchema.parse(req.body);
  const certificate = await generateAdminCertificate(payload, getAuthenticatedUserId(req));
  res.status(201).json({ success: true, data: certificate });
});

export const regenerateCertificate = catchAsync(async (req: Request, res: Response) => {
  const { id } = objectIdParamSchema.parse(req.params);
  const certificate = await regenerateAdminCertificate(id, getAuthenticatedUserId(req));
  res.json({ success: true, data: certificate });
});
