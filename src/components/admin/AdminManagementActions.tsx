import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { BookOpenText, Loader2, MailPlus, PlusCircle, Video } from "lucide-react";

import { apiService as api } from "@services/apiService";
import type {
  CreateAdminQuestionPayload,
  AdminQuestionRecord,
  CreateAdminTaskPayload,
  CreateAdminVideoPayload,
} from "@services/adminService";
import { useToast } from "@hooks/use-toast";
import { MAX_ADMIN_VIDEO_UPLOAD_BYTES, formatBytesToMb } from "@lib/uploadLimits";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@components/ui/dialog";
import { Input } from "@components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Textarea } from "@components/ui/textarea";

const controlClassName = "border-white/10 bg-white/[0.05] text-slate-100 placeholder:text-slate-500 focus-visible:ring-violet-500/60 focus-visible:ring-offset-0";
const defaultTaskCategories = ["grammar", "reading", "listening", "speaking", "writing", "mock-test", "vocabulary", "general"];
const defaultVideoCategories = ["grammar", "reading", "listening", "speaking", "writing", "strategy", "vocabulary", "general"];
const normalizeCategory = (value: string) => value.trim().toLowerCase();

const defaultTaskForm: CreateAdminTaskPayload = {
  title: "",
  description: "",
  category: "general",
  difficulty: "medium",
  rewardPoints: 20,
  status: "published",
  assignedQuestions: [],
};

const defaultVideoForm: CreateAdminVideoPayload = {
  title: "",
  description: "",
  category: "general",
  level: "intermediate",
  thumbnail: "",
  videoUrl: "",
  duration: 0,
  tags: [],
  visibility: "authenticated",
  status: "published",
};

const defaultQuestionForm: CreateAdminQuestionPayload = {
  title: "",
  questionText: "",
  questionType: "multiple_choice",
  options: [],
  correctAnswer: 0,
  explanation: "",
  difficulty: "medium",
  category: "general",
  tags: [],
  points: 1,
  status: "published",
  targetType: "both",
  priority: 0,
};

type Props = {
  questions: AdminQuestionRecord[];
  onSuccess: () => Promise<void> | void;
  openTaskRequest?: number;
};

export default function AdminManagementActions({ questions, onSuccess, openTaskRequest = 0 }: Props) {
  const { toast } = useToast();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [questionOpen, setQuestionOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteBusy, setInviteBusy] = useState(false);

  const [taskForm, setTaskForm] = useState<CreateAdminTaskPayload>(defaultTaskForm);
  const [taskQuestionsText, setTaskQuestionsText] = useState("");
  const [taskBusy, setTaskBusy] = useState(false);

  const [questionForm, setQuestionForm] = useState<CreateAdminQuestionPayload>(defaultQuestionForm);
  const [questionOptionsText, setQuestionOptionsText] = useState("Option 1\nOption 2");
  const [questionTagsText, setQuestionTagsText] = useState("");
  const [questionCorrectOptionNumber, setQuestionCorrectOptionNumber] = useState("1");
  const [questionCorrectText, setQuestionCorrectText] = useState("");
  const [questionBusy, setQuestionBusy] = useState(false);

  const [videoForm, setVideoForm] = useState<CreateAdminVideoPayload>(defaultVideoForm);
  const [videoTags, setVideoTags] = useState("");
  const [videoFileName, setVideoFileName] = useState("");
  const [videoFileSize, setVideoFileSize] = useState<number | null>(null);
  const [videoBusy, setVideoBusy] = useState(false);

  const taskCategoryOptions = useMemo(
    () => Array.from(new Set([...defaultTaskCategories, ...questions.map((question) => question.category.trim().toLowerCase()).filter(Boolean)])),
    [questions],
  );

  const videoCategoryOptions = useMemo(
    () => Array.from(new Set([...defaultVideoCategories, ...questions.map((question) => question.category.trim().toLowerCase()).filter(Boolean)])),
    [questions],
  );
  const questionCategoryOptions = useMemo(
    () => Array.from(new Set(["general", ...defaultTaskCategories, ...defaultVideoCategories, ...questions.map((question) => question.category.trim().toLowerCase()).filter(Boolean)])),
    [questions],
  );
  const parsedQuestionOptions = useMemo(
    () => questionOptionsText.split("\n").map((line) => line.trim()).filter(Boolean),
    [questionOptionsText],
  );

  const resetTaskForm = () => {
    setTaskForm(defaultTaskForm);
    setTaskQuestionsText("");
  };

  const resetQuestionForm = () => {
    setQuestionForm(defaultQuestionForm);
    setQuestionOptionsText("Option 1\nOption 2");
    setQuestionTagsText("");
    setQuestionCorrectOptionNumber("1");
    setQuestionCorrectText("");
  };

  useEffect(() => {
    if (openTaskRequest > 0) {
      setTaskOpen(true);
    }
  }, [openTaskRequest]);

  const resetVideoForm = () => {
    setVideoForm(defaultVideoForm);
    setVideoTags("");
    setVideoFileName("");
    setVideoFileSize(null);
  };

  const handleVideoFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      setVideoForm((current) => ({ ...current, upload: undefined }));
      setVideoFileName("");
      setVideoFileSize(null);
      return;
    }

    if (!file.type.startsWith("video/")) {
      toast({
        title: "Unsupported file",
        description: "Please choose a valid video file.",
        variant: "destructive",
      });
      event.target.value = "";
      return;
    }

    if (file.size > MAX_ADMIN_VIDEO_UPLOAD_BYTES) {
      toast({
        title: "Video is too large",
        description: `Use a file under ${formatBytesToMb(MAX_ADMIN_VIDEO_UPLOAD_BYTES)} or add an external video URL instead.`,
        variant: "destructive",
      });
      event.target.value = "";
      setVideoForm((current) => ({ ...current, upload: undefined }));
      setVideoFileName("");
      setVideoFileSize(null);
      return;
    }

    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(new Error("Could not read the selected video."));
        reader.readAsDataURL(file);
      });

      setVideoForm((current) => ({
        ...current,
        videoUrl: "",
        upload: {
          dataUrl,
          mimeType: file.type || undefined,
          fileName: file.name,
          sizeBytes: file.size,
        },
      }));
      setVideoFileName(file.name);
      setVideoFileSize(file.size);
    } catch (error) {
      toast({
        title: "Video upload failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleInvite = async () => {
    setInviteBusy(true);
    try {
      const response = await api.inviteAdmin({
        email: inviteEmail.trim(),
        message: inviteMessage.trim() || undefined,
      });
      await Promise.resolve(onSuccess());
      setInviteOpen(false);
      setInviteEmail("");
      setInviteMessage("");
      toast({
        title: "Admin invitation sent",
        description: `${response.data.email} must click Accept in the email before admin access is granted.`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Please try again.";
      toast({
        title: message.includes("test domain") ? "Email provider setup needed" : "Could not send admin invite",
        description: message,
        variant: "destructive",
      });
    } finally {
      setInviteBusy(false);
    }
  };

  const handleQuestionSubmit = async () => {
    setQuestionBusy(true);
    try {
      const trimmedTitle = questionForm.title.trim();
      const trimmedQuestionText = questionForm.questionText.trim();
      const trimmedCategory = questionForm.category.trim();
      const trimmedExplanation = questionForm.explanation?.trim() || undefined;
      const parsedTags = questionTagsText.split(",").map((item) => item.trim()).filter(Boolean);

      let correctAnswer: CreateAdminQuestionPayload["correctAnswer"];
      let options: string[] = [];

      if (questionForm.questionType === "multiple_choice") {
        options = parsedQuestionOptions;

        if (options.length < 2) {
          throw new Error("Add at least two options for a multiple-choice question.");
        }

        const optionNumber = Number(questionCorrectOptionNumber);
        if (!Number.isInteger(optionNumber) || optionNumber < 1 || optionNumber > options.length) {
          throw new Error("Enter a valid correct option number.");
        }

        correctAnswer = optionNumber - 1;
      } else if (questionForm.questionType === "true_false") {
        options = ["True", "False"];
        const normalized = (questionCorrectText || "true").trim().toLowerCase();

        if (normalized !== "true" && normalized !== "false") {
          throw new Error("For true/false questions, the correct answer must be True or False.");
        }

        correctAnswer = normalized === "true";
      } else {
        options = parsedQuestionOptions;
        correctAnswer = questionCorrectText.trim() || undefined;
      }

      await api.createQuestion({
        ...questionForm,
        title: trimmedTitle,
        questionText: trimmedQuestionText,
        category: trimmedCategory,
        options,
        correctAnswer,
        explanation: trimmedExplanation,
        tags: parsedTags,
        timeLimit: questionForm.timeLimit ? Number(questionForm.timeLimit) : undefined,
        priority: Number(questionForm.priority || 0),
      });
      await Promise.resolve(onSuccess());
      setQuestionOpen(false);
      resetQuestionForm();
      toast({
        title: "Question created",
        description: "The new question is now part of the real question bank.",
      });
    } catch (error) {
      toast({
        title: "Could not create question",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setQuestionBusy(false);
    }
  };

  const handleTaskSubmit = async () => {
    setTaskBusy(true);
    try {
      await api.createTask({
        ...taskForm,
        dueDate: taskForm.dueDate?.trim() ? taskForm.dueDate : undefined,
        simpleQuestions: taskQuestionsText
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .map((questionText) => ({
            questionText,
            points: 1,
          })),
      });
      await Promise.resolve(onSuccess());
      setTaskOpen(false);
      resetTaskForm();
      toast({
        title: "Task created",
        description: "The new practice task is now saved in the admin backend.",
      });
    } catch (error) {
      toast({
        title: "Could not create task",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setTaskBusy(false);
    }
  };

  const handleVideoSubmit = async () => {
    setVideoBusy(true);
    try {
      await api.createVideo({
        ...videoForm,
        videoUrl: videoForm.videoUrl?.trim() || undefined,
        thumbnail: videoForm.thumbnail?.trim() || undefined,
        tags: videoTags.split(",").map((item) => item.trim()).filter(Boolean),
      });
      await Promise.resolve(onSuccess());
      setVideoOpen(false);
      resetVideoForm();
      toast({
        title: "Learning video created",
        description: "The learning section can now use this video when it is published.",
      });
    } catch (error) {
      toast({
        title: "Could not create video",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setVideoBusy(false);
    }
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card className="rounded-3xl border border-white/10 bg-white/[0.04] shadow-[0_20px_70px_rgba(3,7,18,0.35)] backdrop-blur-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <MailPlus className="h-5 w-5 text-violet-200" />
            Invite Another Admin
          </CardTitle>
          <CardDescription className="text-slate-400">
            Send admin access to an existing user or invite a new email to join with admin rights.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button className="h-11 w-full rounded-2xl bg-violet-600 text-white hover:bg-violet-500">
                Send Admin Request
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] border-white/10 bg-[#090c18] text-slate-100">
              <DialogHeader>
                <DialogTitle>Send admin invitation</DialogTitle>
                <DialogDescription className="text-slate-400">
                  The same normal login system will be used. Admin access is granted only after the recipient clicks Accept.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-xs leading-relaxed text-amber-100">
                  Real email delivery needs a verified sender domain in your email provider. If the backend still uses Resend&apos;s test sender, only limited addresses can receive invites.
                </div>
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(event) => setInviteEmail(event.target.value)}
                  placeholder="person@example.com"
                  className={controlClassName}
                />
                <Textarea
                  value={inviteMessage}
                  onChange={(event) => setInviteMessage(event.target.value)}
                  placeholder="Optional note for the invited admin"
                  className={`min-h-[140px] rounded-3xl ${controlClassName}`}
                />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  className="rounded-2xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]"
                  onClick={() => setInviteOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="rounded-2xl bg-violet-600 text-white hover:bg-violet-500"
                  onClick={() => void handleInvite()}
                  disabled={inviteBusy || !inviteEmail.trim()}
                >
                  {inviteBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Send Invite
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border border-white/10 bg-white/[0.04] shadow-[0_20px_70px_rgba(3,7,18,0.35)] backdrop-blur-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <BookOpenText className="h-5 w-5 text-violet-200" />
            Add Question Bank
          </CardTitle>
          <CardDescription className="text-slate-400">
            Create real question-bank items for grammar, reading, listening, tasks, and daily practice.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={questionOpen} onOpenChange={setQuestionOpen}>
            <DialogTrigger asChild>
              <Button className="h-11 w-full rounded-2xl bg-violet-600 text-white hover:bg-violet-500">
                Add Question
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[88vh] max-w-3xl overflow-y-auto border-white/10 bg-[#090c18] text-slate-100">
              <DialogHeader>
                <DialogTitle>Create question-bank item</DialogTitle>
                <DialogDescription className="text-slate-400">
                  This saves directly into the real admin question bank and becomes available for tasks, daily tasks, and filters.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 md:grid-cols-2">
                <Input
                  value={questionForm.title}
                  onChange={(event) => setQuestionForm((current) => ({ ...current, title: event.target.value }))}
                  placeholder="Question title"
                  className={controlClassName}
                />
                <Select
                  value={questionForm.category}
                  onValueChange={(value) => setQuestionForm((current) => ({ ...current, category: value }))}
                >
                  <SelectTrigger className={`rounded-2xl ${controlClassName}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-slate-950 text-slate-100">
                    {questionCategoryOptions.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={questionForm.questionType}
                  onValueChange={(value) => setQuestionForm((current) => ({ ...current, questionType: value as CreateAdminQuestionPayload["questionType"] }))}
                >
                  <SelectTrigger className={`rounded-2xl ${controlClassName}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-slate-950 text-slate-100">
                    <SelectItem value="multiple_choice">multiple choice</SelectItem>
                    <SelectItem value="true_false">true false</SelectItem>
                    <SelectItem value="short_answer">short answer</SelectItem>
                    <SelectItem value="fill_blank">fill blank</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={questionForm.difficulty}
                  onValueChange={(value) => setQuestionForm((current) => ({ ...current, difficulty: value as CreateAdminQuestionPayload["difficulty"] }))}
                >
                  <SelectTrigger className={`rounded-2xl ${controlClassName}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-slate-950 text-slate-100">
                    <SelectItem value="easy">easy</SelectItem>
                    <SelectItem value="medium">medium</SelectItem>
                    <SelectItem value="hard">hard</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min={0}
                  value={questionForm.points}
                  onChange={(event) => setQuestionForm((current) => ({ ...current, points: Number(event.target.value || 0) }))}
                  placeholder="Points"
                  className={controlClassName}
                />
                <Input
                  type="number"
                  min={0}
                  value={questionForm.timeLimit ?? ""}
                  onChange={(event) => setQuestionForm((current) => ({ ...current, timeLimit: event.target.value ? Number(event.target.value) : undefined }))}
                  placeholder="Time limit in seconds"
                  className={controlClassName}
                />
                <Select
                  value={questionForm.status}
                  onValueChange={(value) => setQuestionForm((current) => ({ ...current, status: value as CreateAdminQuestionPayload["status"] }))}
                >
                  <SelectTrigger className={`rounded-2xl ${controlClassName}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-slate-950 text-slate-100">
                    <SelectItem value="draft">draft</SelectItem>
                    <SelectItem value="published">published</SelectItem>
                    <SelectItem value="archived">archived</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={questionForm.targetType}
                  onValueChange={(value) => setQuestionForm((current) => ({ ...current, targetType: value as CreateAdminQuestionPayload["targetType"] }))}
                >
                  <SelectTrigger className={`rounded-2xl ${controlClassName}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-slate-950 text-slate-100">
                    <SelectItem value="task">task only</SelectItem>
                    <SelectItem value="daily-task">daily task only</SelectItem>
                    <SelectItem value="both">task and daily task</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Textarea
                value={questionForm.questionText}
                onChange={(event) => setQuestionForm((current) => ({ ...current, questionText: event.target.value }))}
                placeholder="Write the full question text"
                className={`min-h-[130px] rounded-3xl ${controlClassName}`}
              />
              {questionForm.questionType === "multiple_choice" ? (
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-white">Options</p>
                    <Badge className="border-white/10 bg-white/[0.05] text-slate-200">
                      {parsedQuestionOptions.length} options
                    </Badge>
                  </div>
                  <Textarea
                    value={questionOptionsText}
                    onChange={(event) => setQuestionOptionsText(event.target.value)}
                    placeholder={`Write one option per line\nOption 1\nOption 2\nOption 3`}
                    className={`mt-3 min-h-[130px] rounded-3xl ${controlClassName}`}
                  />
                  <Input
                    type="number"
                    min={1}
                    max={Math.max(parsedQuestionOptions.length, 1)}
                    value={questionCorrectOptionNumber}
                    onChange={(event) => setQuestionCorrectOptionNumber(event.target.value)}
                    placeholder="Correct option number"
                    className={`mt-3 ${controlClassName}`}
                  />
                </div>
              ) : questionForm.questionType === "true_false" ? (
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm font-medium text-white">Correct answer</p>
                  <Select value={questionCorrectText || "true"} onValueChange={setQuestionCorrectText}>
                    <SelectTrigger className={`mt-3 rounded-2xl ${controlClassName}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-white/10 bg-slate-950 text-slate-100">
                      <SelectItem value="true">True</SelectItem>
                      <SelectItem value="false">False</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <Input
                  value={questionCorrectText}
                  onChange={(event) => setQuestionCorrectText(event.target.value)}
                  placeholder={questionForm.questionType === "fill_blank" ? "Correct word or phrase for the blank" : "Expected answer"}
                  className={controlClassName}
                />
              )}
              <div className="grid gap-3 md:grid-cols-[1fr,220px]">
                <Textarea
                  value={questionForm.explanation || ""}
                  onChange={(event) => setQuestionForm((current) => ({ ...current, explanation: event.target.value }))}
                  placeholder="Optional explanation shown for review"
                  className={`min-h-[110px] rounded-3xl ${controlClassName}`}
                />
                <div className="space-y-3">
                  <Input
                    value={questionTagsText}
                    onChange={(event) => setQuestionTagsText(event.target.value)}
                    placeholder="Tags separated by commas"
                    className={controlClassName}
                  />
                  <Input
                    type="number"
                    min={0}
                    value={questionForm.priority ?? 0}
                    onChange={(event) => setQuestionForm((current) => ({ ...current, priority: Number(event.target.value || 0) }))}
                    placeholder="Priority"
                    className={controlClassName}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  className="rounded-2xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]"
                  onClick={() => setQuestionOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="rounded-2xl bg-violet-600 text-white hover:bg-violet-500"
                  onClick={() => void handleQuestionSubmit()}
                  disabled={questionBusy || !questionForm.title.trim() || !questionForm.questionText.trim() || !questionForm.category.trim()}
                >
                  {questionBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Save Question
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border border-white/10 bg-white/[0.04] shadow-[0_20px_70px_rgba(3,7,18,0.35)] backdrop-blur-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <PlusCircle className="h-5 w-5 text-violet-200" />
            Add Practice Task
          </CardTitle>
          <CardDescription className="text-slate-400">
            Create a task quickly with the core details learners need to see right away.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={taskOpen} onOpenChange={setTaskOpen}>
            <DialogTrigger asChild>
              <Button className="h-11 w-full rounded-2xl bg-fuchsia-600 text-white hover:bg-fuchsia-500">
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] max-w-xl overflow-y-auto border-white/10 bg-[#090c18] text-slate-100">
              <DialogHeader>
                <DialogTitle>Quick add task</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Keep it simple: add the task name, category, and short instruction. Typed questions are optional extras.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 md:grid-cols-2">
                <Input
                  value={taskForm.title}
                  onChange={(event) => setTaskForm((current) => ({ ...current, title: event.target.value }))}
                  placeholder="Task title"
                  className={controlClassName}
                />
                <Select
                  value={taskForm.category}
                  onValueChange={(value) => setTaskForm((current) => ({ ...current, category: value }))}
                >
                  <SelectTrigger className={`rounded-2xl ${controlClassName}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-slate-950 text-slate-100">
                    {taskCategoryOptions.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={taskForm.difficulty}
                  onValueChange={(value) => setTaskForm((current) => ({ ...current, difficulty: value as CreateAdminTaskPayload["difficulty"] }))}
                >
                  <SelectTrigger className={`rounded-2xl ${controlClassName}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-slate-950 text-slate-100">
                    <SelectItem value="easy">easy</SelectItem>
                    <SelectItem value="medium">medium</SelectItem>
                    <SelectItem value="hard">hard</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min={0}
                  value={taskForm.rewardPoints}
                  onChange={(event) => setTaskForm((current) => ({ ...current, rewardPoints: Number(event.target.value || 0) }))}
                  placeholder="Reward points"
                  className={controlClassName}
                />
              </div>
              <Textarea
                value={taskForm.description}
                onChange={(event) => setTaskForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="Describe what the learner should do"
                className={`min-h-[88px] rounded-3xl ${controlClassName}`}
              />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-white">Extra typed questions</p>
                  <Badge className="border-white/10 bg-white/[0.05] text-slate-200">
                    {taskQuestionsText.split("\n").map((line) => line.trim()).filter(Boolean).length} questions
                  </Badge>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                  <Textarea
                    value={taskQuestionsText}
                    onChange={(event) => setTaskQuestionsText(event.target.value)}
                    placeholder={`Write one question per line\nWhat is a noun?\nFill in the blank: She ___ to school yesterday.\nWrite 3 sentences about your favorite place.`}
                    className={`min-h-[150px] rounded-3xl ${controlClassName}`}
                  />
                  <p className="text-xs text-slate-400">
                    Each new line becomes a separate extra question automatically.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  className="rounded-2xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]"
                  onClick={() => setTaskOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="rounded-2xl bg-fuchsia-600 text-white hover:bg-fuchsia-500"
                  onClick={() => void handleTaskSubmit()}
                  disabled={taskBusy || !taskForm.title.trim() || !taskForm.description.trim() || !taskForm.category.trim()}
                >
                  {taskBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Add Task
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border border-white/10 bg-white/[0.04] shadow-[0_20px_70px_rgba(3,7,18,0.35)] backdrop-blur-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Video className="h-5 w-5 text-violet-200" />
            Add Learning Video
          </CardTitle>
          <CardDescription className="text-slate-400">
            Push new learning videos into the real learning section with publish, level, visibility, and tags.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
            <DialogTrigger asChild>
              <Button className="h-11 w-full rounded-2xl bg-indigo-600 text-white hover:bg-indigo-500">
                Create Video
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[88vh] max-w-3xl overflow-y-auto border-white/10 bg-[#090c18] text-slate-100">
              <DialogHeader>
                <DialogTitle>Create learning video</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Published videos are loaded by the learning page automatically.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  value={videoForm.title}
                  onChange={(event) => setVideoForm((current) => ({ ...current, title: event.target.value }))}
                  placeholder="Video title"
                  className={controlClassName}
                />
                <Select
                  value={videoForm.category}
                  onValueChange={(value) => setVideoForm((current) => ({ ...current, category: value }))}
                >
                  <SelectTrigger className={`rounded-2xl ${controlClassName}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-slate-950 text-slate-100">
                    {videoCategoryOptions.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={videoForm.level}
                  onChange={(event) => setVideoForm((current) => ({ ...current, level: event.target.value }))}
                  placeholder="Level"
                  className={controlClassName}
                />
                <Input
                  type="number"
                  min={0}
                  value={videoForm.duration}
                  onChange={(event) => setVideoForm((current) => ({ ...current, duration: Number(event.target.value || 0) }))}
                  placeholder="Duration in seconds"
                  className={controlClassName}
                />
                <Select
                  value={videoForm.visibility}
                  onValueChange={(value) => setVideoForm((current) => ({ ...current, visibility: value as CreateAdminVideoPayload["visibility"] }))}
                >
                  <SelectTrigger className={`rounded-2xl ${controlClassName}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-slate-950 text-slate-100">
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="authenticated">Authenticated</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={videoForm.status}
                  onValueChange={(value) => setVideoForm((current) => ({ ...current, status: value as CreateAdminVideoPayload["status"] }))}
                >
                  <SelectTrigger className={`rounded-2xl ${controlClassName}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-slate-950 text-slate-100">
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Upload video file</p>
                    <p className="mt-1 text-xs text-slate-400">
                      Choose a local video file under {formatBytesToMb(MAX_ADMIN_VIDEO_UPLOAD_BYTES)} and the backend will store it under `/uploads/learning-videos`.
                    </p>
                  </div>
                  <Input
                    type="file"
                    accept="video/*"
                    onChange={(event) => void handleVideoFileChange(event)}
                    className={`${controlClassName} w-full md:max-w-sm file:mr-3 file:rounded-xl file:border-0 file:bg-violet-500/15 file:px-3 file:py-2 file:text-sm file:font-medium file:text-violet-100`}
                  />
                </div>
                {videoFileName ? (
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <Badge className="border-white/10 bg-white/[0.05] text-slate-200">{videoFileName}</Badge>
                    {videoFileSize !== null ? (
                      <Badge className="border-white/10 bg-white/[0.05] text-slate-200">
                        {(videoFileSize / (1024 * 1024)).toFixed(2)} MB
                      </Badge>
                    ) : null}
                  </div>
                ) : null}
              </div>
              <Input
                value={videoForm.videoUrl}
                onChange={(event) => setVideoForm((current) => ({ ...current, videoUrl: event.target.value, upload: event.target.value ? undefined : current.upload }))}
                placeholder="Optional external video URL"
                className={controlClassName}
              />
              <Input
                value={videoForm.thumbnail || ""}
                onChange={(event) => setVideoForm((current) => ({ ...current, thumbnail: event.target.value }))}
                placeholder="Optional thumbnail URL"
                className={controlClassName}
              />
              <Input
                value={videoTags}
                onChange={(event) => setVideoTags(event.target.value)}
                placeholder="Tags separated by commas"
                className={controlClassName}
              />
              <Textarea
                value={videoForm.description}
                onChange={(event) => setVideoForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="Describe what this learner will gain from the video"
                className={`min-h-[140px] rounded-3xl ${controlClassName}`}
              />
              <DialogFooter>
                <Button
                  variant="outline"
                  className="rounded-2xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]"
                  onClick={() => setVideoOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="rounded-2xl bg-indigo-600 text-white hover:bg-indigo-500"
                  onClick={() => void handleVideoSubmit()}
                  disabled={videoBusy || !videoForm.title.trim() || !videoForm.description.trim() || !videoForm.category.trim() || (!videoForm.videoUrl?.trim() && !videoForm.upload)}
                >
                  {videoBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Save Video
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
