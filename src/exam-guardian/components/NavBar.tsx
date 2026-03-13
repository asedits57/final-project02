import { Camera, Mic, Monitor, Clock, BarChart3, Shield } from "lucide-react";
import { useEffect, useState } from "react";

interface NavBarProps {
  timeLeft: number;
  progress: number;
}

const NavBar = ({ timeLeft, progress }: NavBarProps) => {
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <nav className="glass-strong neon-border px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Shield className="w-6 h-6 text-primary" />
        <span className="font-display font-bold text-lg text-glow">AI English Test</span>
      </div>

      <div className="flex items-center gap-6">
        <StatusDot icon={Camera} label="Camera" active />
        <StatusDot icon={Mic} label="Mic" active />
        <StatusDot icon={Monitor} label="Screen" active />
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span className="font-mono font-semibold text-foreground">{formatTime(timeLeft)}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <BarChart3 className="w-4 h-4 text-muted-foreground" />
          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-muted-foreground">{progress}%</span>
        </div>
      </div>

      <div className="flex items-center gap-2 animate-pulse-neon rounded-full px-4 py-1.5 bg-primary/10 border border-primary/30">
        <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
        <span className="text-xs font-medium text-primary">AI Monitoring Active</span>
      </div>
    </nav>
  );
};

const StatusDot = ({ icon: Icon, label, active }: { icon: any; label: string; active: boolean }) => (
  <div className="flex items-center gap-1.5 text-sm">
    <div className={`w-2 h-2 rounded-full ${active ? "bg-success animate-pulse" : "bg-danger"}`} />
    <Icon className="w-4 h-4 text-muted-foreground" />
    <span className="text-muted-foreground hidden lg:inline">{label}</span>
  </div>
);

export default NavBar;
