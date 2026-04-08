import express from "express";
import helmet from "helmet";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import compression from "compression";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import aiRoutes from "./routes/aiRoutes";
import questionRoutes from "./routes/questionRoutes";
import rootRoutes from "./routes/rootRoutes";
import { protect } from "./middleware/authMiddleware";
import ApiError from "./utils/ApiError";
import { isAdmin } from "./middleware/adminMiddleware";
import { sanitizationMiddleware } from "./middleware/sanitizationMiddleware";
import { errorConverter, errorHandler } from "./middleware/errorMiddleware";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

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
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(sanitizationMiddleware); // Global XSS sanitization

// ✅ MOVED DIAGNOSTICS TO rootRoutes
app.use("/", rootRoutes);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(limiter);

app.use("/api/v1", authRoutes);
app.use("/api/v1", userRoutes);
app.use("/api/v1", aiRoutes);
app.use("/api/v1", questionRoutes);


// ✅ SETUP PRODUCTION STATIC SERVE
const distPath = path.join(__dirname, "../../dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  // Keep /api routes separate
  app.use((req, res, next) => {
    if (req.method !== "GET" || req.url.startsWith("/api")) return next();
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
