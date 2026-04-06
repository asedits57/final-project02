import { useLocation, useNavigate } from "react-router-dom";
import { Download, RefreshCw, Eye, Shield, Trophy } from "lucide-react";
import { EvaluationResult } from "../components/QuestionPanel";

const Results = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const evaluation = location.state?.evaluation as EvaluationResult | undefined;
  
  const overall = evaluation?.score || 0;
  const feedback = evaluation?.feedback || "No feedback available.";

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-6">
      <div className="glass-strong neon-border p-8 max-w-2xl w-full space-y-8">
        <div className="text-center space-y-2">
          <Trophy className="w-12 h-12 text-primary mx-auto animate-float" />
          <h1 className="font-display text-3xl font-bold text-glow">Test Complete!</h1>
          <p className="text-muted-foreground text-sm">AI Evaluation Dashboard</p>
        </div>

        {/* Overall */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="2.5"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                className="stroke-primary transition-all duration-1000"
                strokeWidth="2.5"
                strokeDasharray={`${overall}, 100`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-glow">{overall}</span>
              <span className="text-xs text-muted-foreground">/ 100</span>
            </div>
          </div>
          <span className="font-display font-semibold text-primary text-glow mb-4">Final Score</span>
        </div>

        {/* AI Feedback */}
        <div className="glass rounded-lg p-5">
            <h3 className="font-bold mb-2">AI Feedback & Analysis</h3>
            <p className="text-sm text-foreground leading-relaxed">{feedback}</p>
        </div>

        {/* AI Integrity */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-success/10 border border-success/20">
          <Shield className="w-5 h-5 text-success" />
          <div>
            <div className="text-sm font-semibold text-success">AI Integrity Verified</div>
            <div className="text-xs text-muted-foreground">No suspicious activity detected during the exam</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-center">
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/80 transition-all neon-glow">
            <Download className="w-4 h-4" /> Download Certificate
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-all">
            <Eye className="w-4 h-4" /> Review Answers
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-all"
          >
            <RefreshCw className="w-4 h-4" /> Retake Test
          </button>
        </div>
      </div>
    </div>
  );
};

export default Results;
