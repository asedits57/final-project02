import { useState, ReactNode } from "react";

interface AuthGuardProps {
    children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps): JSX.Element {
    const [user] = useState<any | null>({ isLoggedIn: true });
    const [loading] = useState<boolean>(false);

    if (loading) return <div>Loading...</div>;

    if (!user) return <div>Please login</div>;

    return <>{children}</>;
}
