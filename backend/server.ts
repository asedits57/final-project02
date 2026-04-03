import express from "express";
import cors from "cors";

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend working ✅" });
});

// Simple login route
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  if (email === "admin@gmail.com" && password === "1234") {
    res.json({ message: "Login success ✅" });
  } else {
    res.status(401).json({ message: "Invalid credentials ❌" });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});