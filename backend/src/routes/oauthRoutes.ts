import express, { Router } from "express";
import * as oauthController from "../controllers/oauthController";

const router: Router = express.Router();

router.post("/google/callback", oauthController.googleCallback);
router.post("/github/callback", oauthController.githubCallback);

export default router;
