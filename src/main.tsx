import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// ✅ Restore in-memory access token from localStorage before React mounts.
createRoot(document.getElementById("root")!).render(<App />);
