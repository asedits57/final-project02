import { motion } from "framer-motion";
import { Brain, Home, CheckSquare, Trophy, User, BookOpen } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import TranslateCard from "@/components/TranslateCard";
import GrammarCard from "@/components/GrammarCard";
import SentenceCard from "@/components/SentenceCard";
import SpellingCard from "@/components/SpellingCard";

const navItems = [
  { label: "Home", icon: Home, path: "/" },
  { label: "Task", icon: CheckSquare, path: "/task" },
  { label: "Learn", icon: BookOpen, path: "/learning" },
  { label: "Leaderboard", icon: Trophy, path: "/leaderboard" },
  { label: "Profile", icon: User, path: "/profile" },
];

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen animated-bg relative overflow-hidden text-foreground">
      {/* Scrollable content with bottom padding for nav bar */}
      <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 py-12 sm:py-16 pb-28">
        {/* Header */}
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Brain className="w-6 h-6 text-violet-bright" />
            </div>
            <h1 className="font-display text-3xl sm:text-5xl font-bold glow-text">
              Language Intelligence
            </h1>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
            AI-powered tools to master English — translate, check grammar, improve sentences, and fix spelling.
          </p>
        </motion.div>

        {/* 2×2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TranslateCard />
          <GrammarCard />
          <SentenceCard />
          <SpellingCard />
        </div>

        {/* Footer */}
        <motion.p
          className="text-center text-muted-foreground text-xs mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          Powered by Language Intelligence AI
        </motion.p>
      </div>

      {/* Bottom Navigation Bar */}
      <motion.nav
        className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-4 py-3"
        style={{
          background: "rgba(15, 10, 30, 0.75)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(139, 92, 246, 0.2)",
          boxShadow: "0 -4px 30px rgba(139, 92, 246, 0.1)",
        }}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        {navItems.map(({ label, icon: Icon, path }) => {
          const active = location.pathname === path;
          return (
            <button
              key={label}
              onClick={() => navigate(path)}
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-200 group"
              style={{
                background: active ? "rgba(139, 92, 246, 0.18)" : "transparent",
                border: active ? "1px solid rgba(139, 92, 246, 0.35)" : "1px solid transparent",
              }}
            >
              <Icon
                className="w-5 h-5 transition-all duration-200"
                style={{
                  color: active ? "hsl(270, 80%, 75%)" : "rgba(160, 140, 200, 0.6)",
                  filter: active ? "drop-shadow(0 0 6px hsl(270 80% 65%))" : "none",
                }}
              />
              <span
                className="text-[10px] font-medium leading-none transition-all duration-200"
                style={{
                  color: active ? "hsl(270, 80%, 80%)" : "rgba(160, 140, 200, 0.5)",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </motion.nav>
    </div>
  );
};

export default Index;
