import { ReactNode } from "react";

const AuthGuard = ({ children }: { children: ReactNode }) => {
  return <>{children}</>;
};

export default AuthGuard;