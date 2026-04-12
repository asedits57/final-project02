import express from "express";
import helmet from "helmet";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import morgan from "morgan";
import { globalLimiter } from "./middleware/rateLimiter";
import cookieParser from "cookie-parser";
import compression from "compression";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import aiRoutes from "./routes/aiRoutes";
import questionRoutes from "./routes/questionRoutes";
import rootRoutes from "./routes/rootRoutes";
import adminRoutes from "./routes/adminRoutes";
import taskRoutes from "./routes/taskRoutes";
import dailyTaskRoutes from "./routes/dailyTaskRoutes";
import videoRoutes from "./routes/videoRoutes";
import learningRoutes from "./routes/learningRoutes";
import finalTestRoutes from "./routes/finalTestRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import ApiError from "./utils/ApiError";
import { sanitizationMiddleware } from "./middleware/sanitizationMiddleware";
import { ensureDatabaseReady } from "./middleware/databaseMiddleware";
import { errorConverter, errorHandler } from "./middleware/errorMiddleware";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Trust proxy for rate limiting (needed when behind Vite proxy or load balancer)
app.set("trust proxy", 1);

app.use(compression());
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
app.use(express.json({ limit: "100mb" }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(sanitizationMiddleware); // Global XSS sanitization

// ✅ MOVED DIAGNOSTICS TO rootRoutes
app.use("/", rootRoutes);

app.use(globalLimiter);
app.use("/api/v1", ensureDatabaseReady);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1", userRoutes);
app.use("/api/v1", aiRoutes);
app.use("/api/v1", questionRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1", taskRoutes);
app.use("/api/v1", dailyTaskRoutes);
app.use("/api/v1", videoRoutes);
app.use("/api/v1", learningRoutes);
app.use("/api/v1", finalTestRoutes);
app.use("/api/v1", notificationRoutes);


// ✅ SETUP PRODUCTION STATIC SERVE
const uploadsPath = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use("/uploads", express.static(uploadsPath));

const distPath = path.join(__dirname, "../../dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  // Keep /api routes separate
  app.use((req, res, next) => {
    if (req.method !== "GET" || req.url.startsWith("/api") || req.url.startsWith("/uploads")) return next();
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(404, "Not found"));
});


// ✅ ERROR CONVERTER AND HANDLER
app.use(errorConverter);
app.use(errorHandler);

export default app;
