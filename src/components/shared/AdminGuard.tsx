import { Navigate } from "react-router-dom";

import Spinner from "@components/ui/Spinner";
import ErrorMessage from "@components/ui/ErrorMessage";
import { useUser } from "@hooks/useUser";

const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading, isError, refetch } = useUser();

  if (isLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F0A1E]">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F0A1E] p-6">
        <ErrorMessage
          message="Failed to validate your admin session. Please try again."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  if (user.role !== "admin") {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};

export default AdminGuard;
