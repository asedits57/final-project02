import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) throw new Error("No MONGO_URI in .env");
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 2000 });
    console.log("✅ MongoDB Atlas connected");
  } catch (err) {
    console.log("⚠️ Atlas DB unavailable. Falling back to an in-memory MongoDB sandbox...");
    try {
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log("✅ MongoDB In-Memory Server connected locally!");

      // Seed core data if from memory (so buttons work)
      const questionsPath = path.join(__dirname, "../../../backend/data/questions.json");
      if (fs.existsSync(questionsPath)) {
        const Question = mongoose.model("Question"); 
        const count = await Question.countDocuments();
        if (count === 0) {
          const rawData = JSON.parse(fs.readFileSync(questionsPath, "utf-8"));
          const flattened: any[] = [];
          
          for (const [moduleName, items] of Object.entries(rawData)) {
            if (Array.isArray(items)) {
              items.forEach((item: any) => {
                flattened.push({
                  ...item,
                  module: moduleName, // grammar, reading, etc.
                  text: item.question || item.text || item.title || "No text available", // Handle variations
                  difficulty: item.difficulty || "beginner"
                });
              });
            }
          }
          
          if (flattened.length > 0) {
            await Question.insertMany(flattened);
            console.log(`🌱 Seeded ${flattened.length} questions into In-Memory DB`);
          }
        }
      }
    } catch (memErr) {
      console.error("❌ Fatal DB error: In-Memory DB also failed", memErr);
    }
  }
};
