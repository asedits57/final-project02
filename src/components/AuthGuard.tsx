import { Navigate } from "react-router-dom";

const AuthGuard = ({ children }: any) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default AuthGuard;