import { Navigate } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import Spinner from "./ui/Spinner";

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading, isError } = useUser();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F0A1E]">
        <Spinner />
      </div>
    );
  }

  if (isError || !user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
