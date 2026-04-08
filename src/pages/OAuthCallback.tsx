import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@store/useAuthStore";
import { useToast } from "@hooks/use-toast";

const OAuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setUser } = useAuthStore();
    const { toast } = useToast();

    useEffect(() => {
        const token = searchParams.get("token");
        const userData = searchParams.get("user");
        const error = searchParams.get("error");

        if (token && userData) {
            try {
                const user = JSON.parse(decodeURIComponent(userData));
                localStorage.setItem("token", token);
                setUser(user);
                
                toast({
                    title: "Successfully authenticated",
                    description: `Welcome back, ${user.fullName || user.username || "User"}!`,
                });
                
                setTimeout(() => navigate("/"), 500);
            } catch (err) {
                console.error("OAuth Data Parse Error:", err);
                toast({
                    title: "Authentication Error",
                    description: "Failed to process login data.",
                    variant: "destructive",
                });
                navigate("/login");
            }
        } else if (error) {
            toast({
                title: "Login Failed",
                description: decodeURIComponent(error),
                variant: "destructive",
            });
            navigate("/login");
        } else {
            // If no token/user but we're on this page, something is wrong
            // but let's wait a second in case of slow redirects
            const timeout = setTimeout(() => {
                navigate("/login");
            }, 5000);
            return () => clearTimeout(timeout);
        }
    }, [searchParams, navigate, setUser, toast]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950/50 backdrop-blur-xl">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto shadow-[0_0_20px_rgba(139,92,246,0.3)]"></div>
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
