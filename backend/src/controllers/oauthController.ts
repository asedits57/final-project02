import { Request, Response, RequestHandler } from "express";
import axios from "axios";
import * as authService from "../services/authService";
import User from "../models/User";
import { generateToken } from "../utils/generateToken";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "";

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || "";
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || "";
const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI || "";

export const googleCallback: RequestHandler = async (req: Request, res: Response) => {
    try {
        const { code, redirectUri } = req.body;

        if (!code) {
            res.status(400).json({ success: false, message: "Authorization code is required" });
            return;
        }

        if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
            res.status(500).json({ success: false, message: "Google OAuth is not configured" });
            return;
        }

        const redirectUriToUse = redirectUri || GOOGLE_REDIRECT_URI;
        if (!redirectUriToUse) {
            res.status(500).json({ success: false, message: "Google redirect URI is not configured" });
            return;
        }

        // Exchange code for tokens
        const tokenResponse = await axios.post("https://oauth2.googleapis.com/token", {
            code,
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            redirect_uri: redirectUriToUse,
            grant_type: "authorization_code",
        });

        const accessToken = tokenResponse.data.access_token;

        // Get user info from Google
        const userResponse = await axios.get("https://www.googleapis.com/oauth2/v1/userinfo", {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        const { email, name, picture } = userResponse.data;

        // Find or create user
        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                email,
                fullName: name,
                username: email.split("@")[0],
                avatar: picture,
                oauthProvider: "google",
                password: "", // OAuth users don't have passwords
            });
        }

        // Generate JWT token
        const token = generateToken(user._id.toString());

        res.json({
            success: true,
            message: "Google login successful",
            token,
            user: {
                _id: user._id,
                email: user.email,
                fullName: user.fullName,
                username: user.username,
                avatar: user.avatar,
            },
        });
    } catch (err: any) {
        console.error("Google OAuth error:", err);
        res.status(400).json({ success: false, message: err.message || "Google login failed" });
    }
};

export const githubCallback: RequestHandler = async (req: Request, res: Response) => {
    try {
        const { code, redirectUri } = req.body;

        if (!code) {
            res.status(400).json({ success: false, message: "Authorization code is required" });
            return;
        }

        if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
            res.status(500).json({ success: false, message: "GitHub OAuth is not configured" });
            return;
        }

        const redirectUriToUse = redirectUri || GITHUB_REDIRECT_URI;
        if (!redirectUriToUse) {
            res.status(500).json({ success: false, message: "GitHub redirect URI is not configured" });
            return;
        }

        // Exchange code for access token
        const tokenResponse = await axios.post(
            "https://github.com/login/oauth/access_token",
            {
                client_id: GITHUB_CLIENT_ID,
                client_secret: GITHUB_CLIENT_SECRET,
                code,
                redirect_uri: redirectUriToUse,
            },
            { headers: { Accept: "application/json" } }
        );

        const accessToken = tokenResponse.data.access_token;

        // Get user info from GitHub
        const userResponse = await axios.get("https://api.github.com/user", {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        const { login, name, avatar_url, email: githubEmail } = userResponse.data;

        // Get email if not included in user response
        let email = githubEmail;
        if (!email) {
            const emailResponse = await axios.get("https://api.github.com/user/emails", {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            const primaryEmail = emailResponse.data.find((e: any) => e.primary);
            email = primaryEmail?.email || `${login}@github.com`;
        }

        // Find or create user
        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                email,
                fullName: name || login,
                username: login,
                avatar: avatar_url,
                oauthProvider: "github",
                password: "", // OAuth users don't have passwords
            });
        }

        // Generate JWT token
        const token = generateToken(user._id.toString());

        res.json({
            success: true,
            message: "GitHub login successful",
            token,
            user: {
                _id: user._id,
                email: user.email,
                fullName: user.fullName,
                username: user.username,
                avatar: user.avatar,
            },
        });
    } catch (err: any) {
        console.error("GitHub OAuth error:", err);
        res.status(400).json({ success: false, message: err.message || "GitHub login failed" });
    }
};
