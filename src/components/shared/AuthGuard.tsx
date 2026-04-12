import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "@hooks/useUser";
import Spinner from "@components/ui/Spinner";
import ErrorMessage from "@components/ui/ErrorMessage";
import { getOtpSession } from "@lib/otpSession";

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading, isError, refetch } = useUser();
  const location = useLocation();

  if (isLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F0A1E]">
        <Spinner />
      </div>
    );
  }

  // If there's no token or auth failed and there's no cached user → redirect to login.
  // A 401 simply means "not logged in", not a connection error.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const requiresGoogleVerification = user.oauthProvider === "google" && !user.isVerified;
  if (requiresGoogleVerification && location.pathname !== "/verify-otp") {
    const otpSession = getOtpSession();
    const search = otpSession?.requestId ? `?requestId=${encodeURIComponent(otpSession.requestId)}` : "";
    return <Navigate to={`/verify-otp${search}`} replace />;
  }

  if (location.pathname === "/verify-otp" && user.oauthProvider !== "google") {
    return <Navigate to="/home" replace />;
  }

  const requiresGoogleProfileCompletion =
    user.oauthProvider === "google" &&
    user.isVerified &&
    !user.hasPassword;

  if (requiresGoogleProfileCompletion && location.pathname !== "/complete-profile") {
    return <Navigate to="/complete-profile" replace />;
  }

  if (location.pathname === "/complete-profile" && !requiresGoogleProfileCompletion) {
    return <Navigate to="/home" replace />;
  }

  // Query failed but we still have a cached user (transient network error) → show error UI
  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F0A1E] p-6">
        <ErrorMessage 
          message="Failed to load your profile. Please check your connection." 
          onRetry={() => refetch()} 
        />
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
