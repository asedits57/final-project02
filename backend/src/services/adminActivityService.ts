import AdminActivity from "../models/AdminActivity";

type RecordAdminActivityInput = {
  actorId?: string;
  action: string;
  targetType: string;
  targetId?: string;
  description: string;
  metadata?: Record<string, unknown>;
};

export const recordAdminActivity = async ({
  actorId,
  action,
  targetType,
  targetId,
  description,
  metadata,
}: RecordAdminActivityInput) => {
  await AdminActivity.create({
    actor: actorId,
    action,
    targetType,
    targetId,
    description,
    metadata,
  });
};

export const getRecentAdminActivity = async (limit = 8) => {
  return AdminActivity.find()
    .populate("actor", "email fullName role")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};
