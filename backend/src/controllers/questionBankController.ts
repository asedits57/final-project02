import { Request, Response } from "express";

import {
  createQuestionSchema,
  duplicateQuestionParamSchema,
  objectIdParamSchema,
  questionListQuerySchema,
  questionStatusSchema,
  updateQuestionSchema,
} from "../validators/adminValidator";
import { sanitizeObject } from "../utils/sanitization";
import catchAsync from "../utils/catchAsync";
import { getAuthenticatedUserId } from "../utils/authRequest";
import {
  createAdminQuestion,
  deleteAdminQuestion,
  duplicateAdminQuestion,
  getAdminQuestionById,
  listAdminQuestions,
  updateAdminQuestion,
  updateAdminQuestionStatus,
} from "../services/questionBankService";

export const listQuestions = catchAsync(async (req: Request, res: Response) => {
  const query = questionListQuerySchema.parse(req.query);
  const result = await listAdminQuestions(query);
  res.json({ success: true, ...result });
});

export const getQuestion = catchAsync(async (req: Request, res: Response) => {
  const { id } = objectIdParamSchema.parse(req.params);
  const question = await getAdminQuestionById(id);
  res.json({ success: true, data: question });
});

export const createQuestion = catchAsync(async (req: Request, res: Response) => {
  const payload = sanitizeObject(createQuestionSchema.parse(req.body));
  const question = await createAdminQuestion(payload, getAuthenticatedUserId(req));
  res.status(201).json({ success: true, data: question });
});

export const updateQuestion = catchAsync(async (req: Request, res: Response) => {
  const { id } = objectIdParamSchema.parse(req.params);
  const payload = sanitizeObject(updateQuestionSchema.parse(req.body));
  const question = await updateAdminQuestion(id, payload, getAuthenticatedUserId(req));
  res.json({ success: true, data: question });
});

export const removeQuestion = catchAsync(async (req: Request, res: Response) => {
  const { id } = objectIdParamSchema.parse(req.params);
  await deleteAdminQuestion(id, getAuthenticatedUserId(req));
  res.json({ success: true, message: "Question deleted successfully" });
});

export const duplicateQuestion = catchAsync(async (req: Request, res: Response) => {
  const { id } = duplicateQuestionParamSchema.parse(req.params);
  const question = await duplicateAdminQuestion(id, getAuthenticatedUserId(req));
  res.status(201).json({ success: true, data: question });
});

export const changeQuestionStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = objectIdParamSchema.parse(req.params);
  const { status } = questionStatusSchema.parse(req.body);
  const question = await updateAdminQuestionStatus(id, status, getAuthenticatedUserId(req));
  res.json({ success: true, data: question });
});
