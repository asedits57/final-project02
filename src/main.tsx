import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { setAccessToken } from "@services/apiClient";

// ✅ Restore in-memory access token from localStorage before React mounts.
// This ensures apiClient has the token set before React Query fires any requests.
const storedToken = localStorage.getItem("token");
if (storedToken && storedToken !== "undefined") {
  setAccessToken(storedToken);
}

createRoot(document.getElementById("root")!).render(<App />);
