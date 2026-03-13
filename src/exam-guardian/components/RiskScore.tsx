import { ShieldAlert } from "lucide-react";
import { useProctoring } from "./ProctoringContext";

const RiskScore = () => {
  const { riskScore: score } = useProctoring();

  const level = score < 30 ? "LOW" : score < 60 ? "MODERATE" : "HIGH";
  const color = score < 30 ? "text-success" : score < 60 ? "text-warning" : "text-danger";

  return (
    <div className="glass neon-border p-4">
      <div className="flex items-center gap-2 mb-3">
        <ShieldAlert className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold">AI Risk Score</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="3"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              className={`${score < 30 ? "stroke-success" : score < 60 ? "stroke-warning" : "stroke-danger"}`}
              strokeWidth="3"
              strokeDasharray={`${score}, 100`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-sm font-bold ${color}`}>{score}%</span>
          </div>
        </div>
        <div>
          <div className={`text-lg font-bold ${color}`}>{level}</div>
          <div className="text-xs text-muted-foreground">Risk Level</div>
        </div>
      </div>
    </div>
  );
};

export default RiskScore;
