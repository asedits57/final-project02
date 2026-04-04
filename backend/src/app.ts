import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import aiRoutes from "./routes/aiRoutes";
import { protect } from "./middleware/authMiddleware";
import { isAdmin } from "./middleware/adminMiddleware";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(limiter);

app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", aiRoutes);

// ✅ ADMIN ONLY
app.get("/api/admin/stats", protect, isAdmin, (req, res) => {
  res.json({ message: "Admin stats accessed successfully 🔐", totalUsers: 1337 });
});

// ✅ TEST ROUTE
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend working ✅" });
});

// ✅ GET ALL QUESTIONS
app.get("/api/questions", (req, res) => {
  try {
    const dataPath = path.join(__dirname, "data", "questions.json");
    if (!fs.existsSync(dataPath)) {
      return res.status(404).json({ error: "Questions data not found" });
    }
    const rawData = fs.readFileSync(dataPath, "utf-8");
    const questions = JSON.parse(rawData);
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default app;
