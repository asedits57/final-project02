import { Navigate } from "react-router-dom";
import { useUser } from "@hooks/useUser";
import Spinner from "@components/ui/Spinner";

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F0A1E]">
        <Spinner />
      </div>
    );
  }

  // Only redirect when there is truly no user (query done, store empty)
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
