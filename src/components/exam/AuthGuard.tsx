import type { ReactNode } from "react";

interface AuthGuardProps {
    children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps): JSX.Element {
    const user: { isLoggedIn: boolean } | null = { isLoggedIn: true };
    const loading = false;

    if (loading) return <div>Loading...</div>;

    if (!user) return <div>Please login</div>;

    return <>{children}</>;
}
