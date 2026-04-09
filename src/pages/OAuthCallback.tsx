import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@store/useAuthStore";
import { useToast } from "@hooks/use-toast";
import { authService } from "@services/authService";
import { clearOtpSession, setOtpSession } from "@lib/otpSession";
import { setAccessToken } from "@services/apiClient";
import { getPostLoginPath, preloadPostLoginRoute } from "@lib/authRedirect";
import {
  clearStoredGoogleRedirectUri,
  getStoredGoogleRedirectUri,
  resolveGoogleOAuthConfig,
} from "@lib/googleAuth";

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  return "Google login failed.";
};

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const { toast } = useToast();

  useEffect(() => {
    const token = searchParams.get("token");
    const userData = searchParams.get("user");
    const error = searchParams.get("error");
    const code = searchParams.get("code");
    const isGoogleCallback = window.location.pathname.endsWith("/auth/google/callback");
    let isCancelled = false;

    const handleGoogleCallback = async () => {
      try {
        if (!code) {
          throw new Error("Google authorization code is missing.");
        }

        const resolvedGoogleConfig = await resolveGoogleOAuthConfig().catch(() => null);
        const redirectUri =
          getStoredGoogleRedirectUri() || resolvedGoogleConfig?.redirectUri || `${window.location.origin}/auth/google/callback`;
        const response = await authService.handleGoogleCallback(code, redirectUri);

        if (isCancelled) {
          return;
        }

        localStorage.setItem("token", response.accessToken);
        setUser(response.user);

        if (response.verified) {
          clearOtpSession();
          clearStoredGoogleRedirectUri();
          await preloadPostLoginRoute(response.user);
          toast({
            title: "Successfully authenticated",
            description: `Welcome back, ${response.user.fullName || response.user.username || "User"}!`,
          });
          navigate(response.redirectTo || getPostLoginPath(response.user), { replace: true });
          return;
        }

        if (!response.requestId || !response.email || !response.expiresAt || !response.resendAvailableAt) {
          throw new Error("OTP session could not be created for this Google login.");
        }

        setOtpSession({
          requestId: response.requestId,
          email: response.email,
          expiresAt: response.expiresAt,
          resendAvailableAt: response.resendAvailableAt,
        });
        clearStoredGoogleRedirectUri();

        toast({
          title: "OTP Sent",
          description: "We sent a verification code to your Google email.",
        });

        navigate(response.redirectTo, { replace: true });
      } catch (err: unknown) {
        clearOtpSession();
        clearStoredGoogleRedirectUri();
        localStorage.removeItem("token");
        setAccessToken(null);
        setUser(null);
        toast({
          title: "Login Failed",
          description: getErrorMessage(err),
          variant: "destructive",
        });
        navigate("/login", { replace: true });
      }
    };

    if (error) {
      clearOtpSession();
      clearStoredGoogleRedirectUri();
      localStorage.removeItem("token");
      setAccessToken(null);
      setUser(null);
      toast({
        title: "Login Failed",
        description: decodeURIComponent(error),
        variant: "destructive",
      });
      navigate("/login", { replace: true });
      return;
    }

    if (isGoogleCallback && code) {
      void handleGoogleCallback();
      return () => {
        isCancelled = true;
      };
    }

    if (token && userData) {
      try {
        const user = JSON.parse(decodeURIComponent(userData));
        localStorage.setItem("token", token);
        setAccessToken(token);
        setUser(user);
        clearStoredGoogleRedirectUri();

        toast({
          title: "Successfully authenticated",
          description: `Welcome back, ${user.fullName || user.username || "User"}!`,
        });

        void preloadPostLoginRoute(user);
        navigate(getPostLoginPath(user), { replace: true });
      } catch (err) {
        console.error("OAuth Data Parse Error:", err);
        localStorage.removeItem("token");
        setAccessToken(null);
        setUser(null);
        toast({
          title: "Authentication Error",
          description: "Failed to process login data.",
          variant: "destructive",
        });
        navigate("/login", { replace: true });
      }
    } else {
      const timeout = setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1200);
      return () => clearTimeout(timeout);
    }
  }, [searchParams, navigate, setUser, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950/50 backdrop-blur-xl">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto shadow-[0_0_20px_rgba(139,92,246,0.3)]" />
        <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
          Authenticating
        </h2>
        <p className="text-muted-foreground animate-pulse text-sm">
          Finalizing your secure session...
        </p>
      </div>
    </div>
  );
};

export default OAuthCallback;
