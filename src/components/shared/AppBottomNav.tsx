import { motion } from "framer-motion";
import { BookOpen, CheckSquare, Home, Trophy, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@lib/utils";

export const appNavItems = [
  { label: "Home", icon: Home, path: "/" },
  { label: "Task", icon: CheckSquare, path: "/task" },
  { label: "Learn", icon: BookOpen, path: "/learning" },
  { label: "Leaderboard", icon: Trophy, path: "/leaderboard" },
  { label: "Profile", icon: User, path: "/profile" },
];

interface AppBottomNavProps {
  className?: string;
}

const AppBottomNav = ({ className }: AppBottomNavProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <motion.nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-4 py-3",
        className,
      )}
      style={{
        background: "rgba(9, 8, 23, 0.84)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderTop: "1px solid rgba(139, 92, 246, 0.16)",
        boxShadow: "0 -12px 40px rgba(10, 10, 30, 0.4)",
      }}
      initial={{ opacity: 0, y: 36 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {appNavItems.map(({ label, icon: Icon, path }) => {
        const active = location.pathname === path;

        return (
          <motion.button
            key={label}
            onClick={() => navigate(path)}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            aria-label={`Go to ${label}`}
            className="flex flex-col items-center gap-1 rounded-2xl px-4 py-2 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
            style={{
              background: active ? "rgba(139, 92, 246, 0.18)" : "transparent",
              border: active ? "1px solid rgba(139, 92, 246, 0.36)" : "1px solid transparent",
            }}
          >
            <Icon
              className="h-5 w-5 transition-all duration-200"
              style={{
                color: active ? "hsl(270, 80%, 78%)" : "rgba(175, 160, 215, 0.58)",
                filter: active ? "drop-shadow(0 0 8px hsl(270 80% 65%))" : "none",
              }}
            />
            <span
              className="text-[10px] font-medium leading-none"
              style={{
                color: active ? "hsl(270, 80%, 84%)" : "rgba(175, 160, 215, 0.48)",
              }}
            >
              {label}
            </span>
          </motion.button>
        );
      })}
    </motion.nav>
  );
};

export default AppBottomNav;
