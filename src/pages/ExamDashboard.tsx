import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import NavBar from "@components/exam/NavBar";
import CameraPanel from "@components/exam/CameraPanel";
import VoicePanel from "@components/exam/VoicePanel";
import AlertsPanel from "@components/exam/AlertsPanel";
import Timeline from "@components/exam/Timeline";
import RiskScore from "@components/exam/RiskScore";
import ScreenPanel from "@components/exam/ScreenPanel";
import { ProctoringProvider } from "@components/exam/ProctoringContext";
import { useProctoring } from "@components/exam/proctoring";
import Spinner from "@components/ui/Spinner";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Textarea } from "@components/ui/textarea";
import { useToast } from "@hooks/use-toast";
import { getFinalTestLoadState } from "@lib/finalTestLoadState";
import { apiService as api } from "@services/apiService";
import type { FinalTestConfigResponseRecord } from "@services/finalTestService";
import type { CapturedRecordingAsset } from "@lib/mediaRecorder";

const renderOptionValue = (option: string, index: number) => `${String.fromCharCode(65 + index)}. ${option}`;
const createClientRequestId = () =>
  (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function")
    ? crypto.randomUUID()
    : `final-test-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const ExamDashboardContent = () => {
  const [config, setConfig] = useState<FinalTestConfigResponseRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [recordingActive, setRecordingActive] = useState(false);
  const [videoRecording, setVideoRecording] = useState<CapturedRecordingAsset | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { alerts, events, riskScore } = useProctoring();
  const [clientRequestId] = useState(() => createClientRequestId());

  const loadConfig = useCallback(async (options?: { silent?: boolean }) => {
    try {
      if (!options?.silent) {
        setLoading(true);
      }
      setError(null);
      const response = await api.getFinalTestConfig();

      setConfig(response.data);
      setCurrentIndex(0);
      setTimeLeft(response.data.timeLimitMinutes * 60);
      setAnswers(
        response.data.questions.reduce<Record<string, string>>((result, question) => {
          result[question._id] = "";
          return result;
        }, {}),
      );
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load the final test.");
      setConfig(null);
    } finally {
      if (!options?.silent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadConfig();
  }, [loadConfig]);

  useEffect(() => {
    const handleConfigChanged = () => {
      void loadConfig();
    };

    window.addEventListener("app:final-test-config-changed", handleConfigChanged);

    return () => {
      window.removeEventListener("app:final-test-config-changed", handleConfigChanged);
    };
  }, [loadConfig]);

  useEffect(() => {
    if (!config || loading || isSubmitting) {
      return;
    }

    const timer = window.setInterval(() => {
      setTimeLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [config, isSubmitting, loading]);

  const questions = useMemo(() => config?.questions ?? [], [config]);
  const currentQuestion = questions[currentIndex];
  const answeredCount = useMemo(
    () => questions.filter((question) => answers[question._id]?.trim()).length,
    [answers, questions],
  );
  const progress = questions.length ? Math.round((answeredCount / questions.length) * 100) : 0;
  const allQuestionsAnswered = useMemo(
    () => questions.length > 0 && questions.every((question) => answers[question._id]?.trim().length > 0),
    [answers, questions],
  );

  const buildTranscript = useCallback(
    () => questions
      .map((question, index) => `Q${index + 1}: ${question.questionText}\nA: ${answers[question._id] || ""}`)
      .join("\n\n"),
    [answers, questions],
  );

  const handleSubmit = useCallback(async () => {
    if (!config || isSubmitting) {
      return;
    }

    if (!allQuestionsAnswered) {
      toast({
        title: "Complete all questions",
        description: "Answer every final-test question before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.submitFinalTest({
        clientRequestId,
        configId: config._id,
        testTitle: config.title,
        testCategory: "final-test",
        answers: questions.map((question) => ({
          questionId: question._id,
          answer: answers[question._id],
        })),
        aiEvaluation: {
          answeredCount,
          totalQuestions: questions.length,
        },
        score: 0,
        flags: alerts.map((alert) => alert.message),
        responseTranscript: buildTranscript(),
        proctoring: {
          riskScore,
          events,
        },
        recordings: {
          ...(videoRecording ? { video: videoRecording } : {}),
        },
      });

      toast({
        title: "Final test submitted",
        description: response.transportFallbackUsed
          ? (response.transportMessage || "Your answers were saved, but recorded media was omitted to keep submission stable.")
          : "Your answers and proctoring evidence were saved successfully.",
      });

      navigate("/exam-results", {
        state: {
          submission: response.data,
          config,
        },
      });
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Could not submit the final test.";
      toast({
        title: "Submission failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    alerts,
    allQuestionsAnswered,
    answeredCount,
    answers,
    buildTranscript,
    config,
    events,
    isSubmitting,
    navigate,
    questions,
    riskScore,
    toast,
    videoRecording,
    clientRequestId,
  ]);

  useEffect(() => {
    if (timeLeft !== 0 || !config || loading) {
      return;
    }

    void handleSubmit();
  }, [config, handleSubmit, loading, timeLeft]);

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-6">
        <Spinner />
      </div>
    );
  }

  const loadFailureMessage =
    error ||
    (!config
      ? "Could not load the final test."
      : !currentQuestion
        ? "The final test is not ready yet because it does not contain any published questions."
        : null);

  if (loadFailureMessage) {
    const loadState = getFinalTestLoadState(loadFailureMessage);

    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-6">
        <Card className="w-full max-w-2xl border-white/10 bg-[#090c18] text-slate-100">
          <CardHeader className="space-y-3">
            <div className="inline-flex w-fit rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-400">
              Final test access
            </div>
            <CardTitle>{loadState.title}</CardTitle>
            <CardDescription className="text-slate-400">
              {loadState.message}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button onClick={() => navigate(loadState.primaryActionPath)}>
              {loadState.primaryActionLabel}
            </Button>
            {loadState.showRetry ? (
              <Button
                variant="outline"
                className="border-white/10 bg-white/[0.03] text-slate-100 hover:bg-white/[0.08]"
                onClick={() => void loadConfig()}
              >
                {loadState.retryLabel}
              </Button>
            ) : null}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!config.canRetake) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-6">
        <Card className="w-full max-w-2xl border-white/10 bg-[#090c18] text-slate-100">
          <CardHeader>
            <CardTitle>Final test already attempted</CardTitle>
            <CardDescription className="text-slate-400">
              Retakes are disabled for the current final-test configuration.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-300">
              Previous attempts: {config.previousAttemptCount}
            </p>
            <Button onClick={() => navigate("/task")}>Back to Task Hub</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg flex flex-col gap-4 p-3 sm:p-4 lg:p-6">
      <button
        onClick={() => navigate("/task")}
        className="flex items-center gap-2 text-violet-300 hover:text-white transition-colors w-fit px-2 py-1"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Back to Tasks</span>
      </button>

      <NavBar timeLeft={timeLeft} progress={progress} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.25fr,0.75fr]">
        <Card className="border-white/10 bg-[#090c18] text-slate-100">
          <CardHeader className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>{config.title}</CardTitle>
                <CardDescription className="text-slate-400">
                  {config.instructions}
                </CardDescription>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-300">
                Question {currentIndex + 1} of {questions.length}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-slate-300">
                {currentQuestion.category}
              </span>
              <span className="rounded-full border border-violet-300/20 bg-violet-500/10 px-3 py-1 text-violet-100">
                {currentQuestion.difficulty}
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-slate-300">
                {currentQuestion.points} points
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-slate-300">
                {currentQuestion.questionType.replace(/_/g, " ")}
              </span>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-lg font-medium text-white">{currentQuestion.questionText}</p>
            </div>

            {(currentQuestion.questionType === "multiple_choice" || currentQuestion.questionType === "true_false") ? (
              <div className="grid gap-3">
                {currentQuestion.options.map((option, index) => {
                  const selected = answers[currentQuestion._id] === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setAnswers((current) => ({ ...current, [currentQuestion._id]: option }))}
                      className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                        selected
                          ? "border-violet-400/60 bg-violet-500/16 text-white"
                          : "border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.06]"
                      }`}
                    >
                      {renderOptionValue(option, index)}
                    </button>
                  );
                })}
              </div>
            ) : (
              <Textarea
                value={answers[currentQuestion._id] || ""}
                onChange={(event) => setAnswers((current) => ({ ...current, [currentQuestion._id]: event.target.value }))}
                placeholder={currentQuestion.questionType === "fill_blank" ? "Fill in the blank here" : "Write your answer here"}
                className="min-h-[180px] rounded-3xl border-white/10 bg-white/[0.03] text-slate-100"
              />
            )}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button
                variant="outline"
                className="border-white/10 bg-white/[0.03] text-slate-100 hover:bg-white/[0.08]"
                onClick={() => setCurrentIndex((current) => Math.max(0, current - 1))}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              <div className="text-sm text-slate-400">
                {answeredCount} / {questions.length} answered
              </div>

              {currentIndex < questions.length - 1 ? (
                <Button
                  className="bg-violet-600 text-white hover:bg-violet-500"
                  onClick={() => setCurrentIndex((current) => Math.min(questions.length - 1, current + 1))}
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  className="bg-violet-600 text-white hover:bg-violet-500"
                  onClick={() => void handleSubmit()}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Submit Final Test
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card className="border-white/10 bg-[#090c18] text-slate-100">
            <CardHeader>
              <CardTitle className="text-base">Final Test Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-300">
              <div className="flex items-center justify-between">
                <span>Question count</span>
                <span>{config.questionCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Total marks</span>
                <span>{config.totalMarks}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Passing score</span>
                <span>{config.passingScore}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Retakes</span>
                <span>{config.allowRetake ? "Allowed" : "Disabled"}</span>
              </div>
            </CardContent>
          </Card>

          <CameraPanel
            recordingActive={recordingActive}
            onRecordingComplete={setVideoRecording}
          />
          <ScreenPanel />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <VoicePanel />
        <AlertsPanel />
        <Timeline />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <RiskScore />
        <Card className="border-white/10 bg-[#090c18] text-slate-100 xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Submission Controls</CardTitle>
            <CardDescription className="text-slate-400">
              Start recording evidence when you begin answering, then submit when all questions are complete.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Button
              variant="outline"
              className="border-white/10 bg-white/[0.03] text-slate-100 hover:bg-white/[0.08]"
              onClick={() => setRecordingActive((current) => !current)}
            >
              {recordingActive ? "Stop camera recording" : "Start camera recording"}
            </Button>
            <Button
              className="bg-violet-600 text-white hover:bg-violet-500"
              onClick={() => void handleSubmit()}
              disabled={isSubmitting || !allQuestionsAnswered}
            >
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Submit final test
            </Button>
          </CardContent>
        </Card>
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
