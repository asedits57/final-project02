import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import NavBar from "@components/exam/NavBar";
import QuestionPanel, { type EvaluationResult } from "@components/exam/QuestionPanel";
import CameraPanel from "@components/exam/CameraPanel";
import VoicePanel from "@components/exam/VoicePanel";
import AlertsPanel from "@components/exam/AlertsPanel";
import Timeline from "@components/exam/Timeline";
import RiskScore from "@components/exam/RiskScore";
import ScreenPanel from "@components/exam/ScreenPanel";
import { ProctoringProvider, useProctoring } from "@components/exam/ProctoringContext";
import { useToast } from "@hooks/use-toast";
import { apiService as api } from "@services/apiService";
import type { CapturedRecordingAsset } from "@lib/mediaRecorder";

const ExamDashboardContent = () => {
  const [timeLeft, setTimeLeft] = useState(1800);
  const [progress, setProgress] = useState(35);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [recordingActive, setRecordingActive] = useState(false);
  const [videoRecording, setVideoRecording] = useState<CapturedRecordingAsset | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { alerts, events, riskScore } = useProctoring();

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft((current) => Math.max(0, current - 1)), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async () => {
    if (!evaluation) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.submitFinalTest({
        testTitle: "Sandysquad Final Speaking Assessment",
        testCategory: "final-speaking",
        answers: evaluation.transcript ? [{ answer: evaluation.transcript }] : [],
        aiEvaluation: {
          score: evaluation.score,
          feedback: evaluation.feedback,
        },
        score: evaluation.score,
        flags: alerts.map((alert) => alert.message),
        recommendation: evaluation.feedback,
        responseTranscript: evaluation.transcript,
        proctoring: {
          riskScore,
          events,
        },
        recordings: {
          ...(evaluation.audioRecording ? { audio: evaluation.audioRecording } : {}),
          ...(videoRecording ? { video: videoRecording } : {}),
        },
      });

      toast({
        title: "Final test submitted",
        description: "Your attempt was saved for admin review.",
      });

      navigate("/exam-results", {
        state: {
          evaluation,
          submission: response.data,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not submit the final test.";
      toast({
        title: "Submission failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
          <QuestionPanel
            onRecordingStateChange={setRecordingActive}
            onComplete={(result) => {
              setEvaluation(result);
              setProgress(100);
            }}
          />
        </div>
        <div>
          <CameraPanel
            recordingActive={recordingActive}
            onRecordingComplete={setVideoRecording}
          />
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
            onClick={() => void handleSubmit()}
            disabled={!evaluation || isSubmitting}
            className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/80 transition-all neon-glow font-display disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Submitting..." : "Submit Test"}
          </button>
          <span className="text-xs text-muted-foreground text-center">
            {evaluation
              ? "Evaluation and recordings are ready for admin review."
              : "Complete the speaking task to generate the final-test submission."}
          </span>
        </div>
      </div>
    </div>
  );
};

const ExamDashboard = () => (
  <ProctoringProvider>
    <ExamDashboardContent />
  </ProctoringProvider>
);

export default ExamDashboard;
