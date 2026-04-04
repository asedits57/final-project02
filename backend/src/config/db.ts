import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("✅ MongoDB Atlas connected");
  } catch (err) {
    console.warn("⚠️ Atlas DB failed to connect. Falling back to an in-memory MongoDB sandbox...");
    try {
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log("✅ MongoDB In-Memory Server connected locally!");
    } catch (memErr) {
      console.error("❌ Fatal DB error: In-Memory DB also failed", memErr);
    }
  }
};
