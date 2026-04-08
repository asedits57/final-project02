import express from "express";
import { getRoot, getApiStatus, getTest } from "../controllers/rootController";

const router = express.Router();

router.get("/", getRoot);
router.get("/api", getApiStatus);
router.get("/api/test", getTest);

export default router;
