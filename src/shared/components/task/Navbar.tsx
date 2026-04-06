import { BookOpen, BarChart3, Trophy, Settings, Zap } from "lucide-react";
import { useState } from "react";

const navItems = [
    { label: "Dashboard", icon: BarChart3, active: true },
    { label: "Practice", icon: BookOpen },
    { label: "Challenges", icon: Trophy },
    { label: "Settings", icon: Settings },
];

const Navbar = () => {
    const [active, setActive] = useState("Dashboard");

    return (
        <nav className="glass-strong sticky top-0 z-50 border-b border-border/50">
            <div className="container mx-auto flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 glow-border-cyan">
                        <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-display text-xl font-bold text-glow">FluentAI</span>
                </div>

                <div className="hidden items-center gap-1 md:flex">
                    {navItems.map((item) => (
                        <button
                            key={item.label}
                            onClick={() => setActive(item.label)}
                            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 ${active === item.label
                                    ? "glass glow-border-cyan text-primary"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                }`}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 rounded-full glass px-3 py-1.5">
                        <div className="h-2 w-2 rounded-full bg-primary pulse-ring" />
                        <span className="text-xs font-medium text-primary">12 day streak</span>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-glow-cyan to-glow-violet" />
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
