import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import NavBar from "@components/exam/NavBar";
import QuestionPanel from "@components/exam/QuestionPanel";
import CameraPanel from "@components/exam/CameraPanel";
import VoicePanel from "@components/exam/VoicePanel";
import AlertsPanel from "@components/exam/AlertsPanel";
import Timeline from "@components/exam/Timeline";
import RiskScore from "@components/exam/RiskScore";
import ScreenPanel from "@components/exam/ScreenPanel";
import { ProctoringProvider } from "@components/exam/ProctoringContext";
import { useNavigate } from "react-router-dom";
import { EvaluationResult } from "@components/exam/QuestionPanel";

const ExamDashboard = () => {
  const [timeLeft, setTimeLeft] = useState(1800);
  const [progress, setProgress] = useState(35);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setInterval(() => setTimeLeft((p) => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <ProctoringProvider>
      <div className="min-h-screen gradient-bg p-4 flex flex-col gap-4">
        <button 
          onClick={() => navigate("/task")}
          className="flex items-center gap-2 text-violet-300 hover:text-white transition-colors w-fit px-2 py-1"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Tasks</span>
        </button>
        <NavBar timeLeft={timeLeft} progress={progress} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
          <div className="lg:col-span-2">
            <QuestionPanel onComplete={(res) => {
              setEvaluation(res);
              setProgress(100);
            }} />
          </div>
          <div>
            <CameraPanel />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ScreenPanel />
          <VoicePanel />
          <AlertsPanel />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Timeline />
          <RiskScore />
            <div className="glass neon-border p-4 flex flex-col items-center justify-center gap-3">
              <button
                onClick={() => navigate("/exam-results", { state: { evaluation } })}
                disabled={!evaluation}
                className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/80 transition-all neon-glow font-display disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Test
              </button>
              <span className="text-xs text-muted-foreground text-center">
                {evaluation ? "Evaluation ready. You can submit now." : "Complete speaking task to submit"}
              </span>
            </div>
          </div>
        </div>
      </ProctoringProvider>
    );
  };
  
  export default ExamDashboard;
