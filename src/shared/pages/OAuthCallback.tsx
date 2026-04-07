import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "@shared/api";
import { useAuthStore as useStore } from "@core/useAuthStore";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser } = useStore();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get("code");
        const state = searchParams.get("state") || "";
        const providerFromState = state.split("=")[1];
        const provider = searchParams.get("provider") || providerFromState || (window.location.pathname.includes("github") ? "github" : "google");
        const redirectUri = `${window.location.origin}${window.location.pathname}`;

        if (!code) {
          setError("No authorization code received");
          setIsProcessing(false);
          return;
        }

        // Call backend to exchange code for token
        let response;
        if (provider === "google") {
          response = await api.googleCallback(code, redirectUri);
        } else if (provider === "github") {
          response = await api.githubCallback(code, redirectUri);
        } else {
          throw new Error("Unknown OAuth provider");
        }

        if (response.success) {
          localStorage.setItem("token", response.token);
          if (response.user) setUser(response.user);
          
          // Redirect to dashboard or level selection
          setTimeout(() => navigate("/dashboard"), 500);
        } else {
          setError(response.message || "Authentication failed");
          setIsProcessing(false);
        }
      } catch (err: any) {
        setError(err.message || "An error occurred during authentication");
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [searchParams, navigate, setUser]);

  return (
    <div className="min-h-screen animated-bg flex items-center justify-center p-6 text-foreground">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        {isProcessing ? (
          <>
            <RefreshCw className="w-12 h-12 animate-spin mx-auto mb-4 text-violet-400" />
            <h2 className="text-2xl font-bold mb-2 font-poppins">Completing sign in...</h2>
            <p className="text-muted-foreground font-poppins">Please wait while we authenticate you</p>
          </>
        ) : error ? (
          <>
            <h2 className="text-2xl font-bold mb-2 text-red-500 font-poppins">Authentication Failed</h2>
            <p className="text-muted-foreground mb-6 font-poppins">{error}</p>
            <button
              onClick={() => navigate("/auth")}
              className="px-6 py-2 rounded-2xl bg-violet-600 hover:bg-violet-700 font-poppins font-semibold transition-all"
            >
              Back to Login
            </button>
          </>
        ) : null}
      </motion.div>
    </div>
  );
}
