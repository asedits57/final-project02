import express from "express";
import helmet from "helmet";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes";
import oauthRoutes from "./routes/oauthRoutes";
import userRoutes from "./routes/userRoutes";
import aiRoutes from "./routes/aiRoutes";
import questionRoutes from "./routes/questionRoutes";
import { protect } from "./middleware/authMiddleware";
import { isAdmin } from "./middleware/adminMiddleware";
import { sanitizationMiddleware } from "./middleware/sanitizationMiddleware";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "img-src": ["'self'", "data:", "https://api.dicebear.com"],
    },
  },
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : ["http://localhost:5173", "http://localhost:8080"],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(sanitizationMiddleware); // Global XSS sanitization

// ✅ DIAGNOSTIC ROUTES (FOR VERIFICATION)
app.get("/", (req, res) => {
  res.send("API Running 🚀");
});

app.get("/api", (req, res) => {
  res.json({ status: "API Working", version: "1.0.0" });
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(limiter);

<<<<<<< HEAD
app.use("/api/v1", authRoutes);
app.use("/api/v1", userRoutes);
app.use("/api/v1", aiRoutes);
app.use("/api/v1", questionRoutes);
=======
app.use("/api", authRoutes);
app.use("/api/oauth", oauthRoutes);
app.use("/api", userRoutes);
app.use("/api", aiRoutes);
app.use("/api", questionRoutes);
>>>>>>> 281a3d42ae587c21bb64ca07d5c45aeb7c8b7153

// ✅ ADMIN ONLY
app.get("/api/admin/stats", protect, isAdmin, (req, res) => {
  res.json({ message: "Admin stats accessed successfully 🔐", totalUsers: 1337 });
});

// ✅ TEST ROUTE
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend working ✅" });
});

// ✅ SETUP PRODUCTION STATIC SERVE
const distPath = path.join(__dirname, "../../dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  // Keep /api routes separate
  app.get("*", (req, res, next) => {
    if (req.url.startsWith("/api")) return next();
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// ✅ GLOBAL ERROR HANDLER
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Error: ", err.message || err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

export default app;
