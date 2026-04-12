import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowUp, BookOpenText, Camera, Eye, FileText, Loader2, Mic, PlusCircle, RefreshCcw, Save, Search, Settings2, Shield, ShieldAlert, Trophy, Users, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { apiService as api } from "@services/apiService";
import { adminService as adminApi } from "@services/adminService";
import type { AdminDashboardOverview, AdminDailyTaskRecord, AdminFinalTestRecord, AdminQuestionRecord, AdminTaskRecord, AdminUserRecord, AdminVideoRecord, FinalTestConfigRecord } from "@services/adminService";
import { useAuthStore } from "@store/useAuthStore";
import { useToast } from "@hooks/use-toast";
import { cn } from "@lib/utils";
import Spinner from "@components/ui/Spinner";
import ErrorMessage from "@components/ui/ErrorMessage";
import AdminManagementActions from "@components/admin/AdminManagementActions";
import { Avatar, AvatarFallback } from "@components/ui/avatar";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@components/ui/dialog";
import { Input } from "@components/ui/input";
import { Progress } from "@components/ui/progress";
import { ScrollArea } from "@components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Skeleton } from "@components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { Textarea } from "@components/ui/textarea";

const glass = "rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] shadow-[0_20px_70px_rgba(3,7,18,0.45)] backdrop-blur-2xl";
const control = "border-white/10 bg-white/[0.05] text-slate-100 placeholder:text-slate-400 focus-visible:ring-violet-500/60 focus-visible:ring-offset-0";
const reviewTone: Record<AdminFinalTestRecord["reviewStatus"], string> = { pending: "border-amber-400/25 bg-amber-500/12 text-amber-200", approved: "border-emerald-400/25 bg-emerald-500/12 text-emerald-200", rejected: "border-rose-400/25 bg-rose-500/12 text-rose-200", reviewed: "border-sky-400/25 bg-sky-500/12 text-sky-200", re_evaluation_requested: "border-violet-400/25 bg-violet-500/12 text-violet-200" };
const userTone: Record<AdminUserRecord["status"], string> = { active: "border-emerald-400/25 bg-emerald-500/12 text-emerald-200", suspended: "border-rose-400/25 bg-rose-500/12 text-rose-200" };
const questionTone: Record<AdminQuestionRecord["difficulty"], string> = { easy: "border-emerald-400/25 bg-emerald-500/12 text-emerald-200", medium: "border-violet-400/25 bg-violet-500/12 text-violet-200", hard: "border-fuchsia-400/25 bg-fuchsia-500/12 text-fuchsia-200" };
const n = (v: number) => new Intl.NumberFormat("en-US").format(v);
const d = (v?: string) => (v ? new Date(v).toLocaleString() : "Not available");
const rs = (v: AdminFinalTestRecord["reviewStatus"]) => v.replace(/_/g, " ");
const normalizeAssignedQuestions = (assignedQuestions: FinalTestConfigRecord["assignedQuestions"]) =>
  [...assignedQuestions]
    .sort((left, right) => left.order - right.order)
    .map((item, index) => ({
      questionId: item.questionId,
      order: index,
    }));

const buildFinalTestConfigPayload = (config: FinalTestConfigRecord) => ({
  title: config.title,
  enabled: config.enabled,
  status: config.status,
  questionCount: config.questionCount,
  assignedQuestions: normalizeAssignedQuestions(config.assignedQuestions),
  filters: config.filters,
  timeLimitMinutes: config.timeLimitMinutes,
  passingScore: config.passingScore,
  instructions: config.instructions,
  allowRetake: config.allowRetake,
});

export default function AdminWorkspacePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const me = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadWarning, setLoadWarning] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<AdminDashboardOverview | null>(null);
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [questions, setQuestions] = useState<AdminQuestionRecord[]>([]);
  const [tasks, setTasks] = useState<AdminTaskRecord[]>([]);
  const [dailyTasks, setDailyTasks] = useState<AdminDailyTaskRecord[]>([]);
  const [videos, setVideos] = useState<AdminVideoRecord[]>([]);
  const [finalTests, setFinalTests] = useState<AdminFinalTestRecord[]>([]);
  const [finalTestConfig, setFinalTestConfig] = useState<FinalTestConfigRecord | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "user" | "admin">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended">("all");
  const [difficultyFilter, setDifficultyFilter] = useState<"all" | "easy" | "medium" | "hard">("all");
  const [taskOpenRequest, setTaskOpenRequest] = useState(0);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFinalTest, setSelectedFinalTest] = useState<AdminFinalTestRecord | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<AdminFinalTestRecord["reviewStatus"]>("reviewed");
  const [reviewNotes, setReviewNotes] = useState("");
  const [reviewBusy, setReviewBusy] = useState(false);
  const [configBusy, setConfigBusy] = useState(false);

  const load = useCallback(async (silent = false) => {
    try {
      if (silent) setRefreshing(true); else setLoading(true);
      setError(null);
      setLoadWarning(null);

      const labels = ["dashboard", "users", "questions", "tasks", "daily tasks", "videos", "final tests", "final test config"] as const;
      const requests = [
        api.getDashboard(),
        api.listUsers({ page: 1, limit: 100 }),
        api.listQuestions({ page: 1, limit: 100 }),
        api.listTasks({ page: 1, limit: 100 }),
        api.listDailyTasks({ page: 1, limit: 100 }),
        api.listVideos({ page: 1, limit: 100 }),
        api.listFinalTests({ page: 1, limit: 50 }),
        adminApi.getFinalTestConfig(),
      ] as const;

      const settled = await Promise.allSettled(requests);
      const failures = settled
        .map((result, index) => ({ result, label: labels[index] }))
        .filter((entry): entry is { result: PromiseRejectedResult; label: (typeof labels)[number] } => entry.result.status === "rejected");

      const firstFailure = failures[0]?.result.reason;
      const allFailed = failures.length === labels.length;

      if (allFailed) {
        throw firstFailure instanceof Error ? firstFailure : new Error("Failed to load admin data.");
      }

      const [
        dashboardResult,
        usersResult,
        questionsResult,
        tasksResult,
        dailyTasksResult,
        videosResult,
        finalTestsResult,
        finalTestConfigResult,
      ] = settled;

      if (dashboardResult.status === "fulfilled") setDashboard(dashboardResult.value.data);
      if (usersResult.status === "fulfilled") setUsers(usersResult.value.items);
      if (questionsResult.status === "fulfilled") setQuestions(questionsResult.value.items);
      if (tasksResult.status === "fulfilled") setTasks(tasksResult.value.items);
      if (dailyTasksResult.status === "fulfilled") setDailyTasks(dailyTasksResult.value.items);
      if (videosResult.status === "fulfilled") setVideos(videosResult.value.items);
      if (finalTestsResult.status === "fulfilled") setFinalTests(finalTestsResult.value.items);
      if (finalTestConfigResult.status === "fulfilled") setFinalTestConfig(finalTestConfigResult.value.data);

      if (failures.length > 0) {
        setLoadWarning(`Some admin sections could not load: ${failures.map((failure) => failure.label).join(", ")}.`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load admin data.");
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    const handleRealtimeRefresh = () => {
      void load(true);
    };

    window.addEventListener("app:questions-changed", handleRealtimeRefresh);
    window.addEventListener("app:tasks-changed", handleRealtimeRefresh);
    window.addEventListener("app:daily-tasks-changed", handleRealtimeRefresh);
    window.addEventListener("app:videos-changed", handleRealtimeRefresh);
    window.addEventListener("app:final-test-config-changed", handleRealtimeRefresh);
    window.addEventListener("app:admin-event", handleRealtimeRefresh);

    return () => {
      window.removeEventListener("app:questions-changed", handleRealtimeRefresh);
      window.removeEventListener("app:tasks-changed", handleRealtimeRefresh);
      window.removeEventListener("app:daily-tasks-changed", handleRealtimeRefresh);
      window.removeEventListener("app:videos-changed", handleRealtimeRefresh);
      window.removeEventListener("app:final-test-config-changed", handleRealtimeRefresh);
      window.removeEventListener("app:admin-event", handleRealtimeRefresh);
    };
  }, [load]);

  const q = search.trim().toLowerCase();
  const filteredUsers = useMemo(() => users.filter((u) => (!q || `${u.fullName || ""} ${u.email} ${u.dept || ""}`.toLowerCase().includes(q)) && (roleFilter === "all" || u.role === roleFilter) && (statusFilter === "all" || u.status === statusFilter)), [q, roleFilter, statusFilter, users]);
  const filteredQuestions = useMemo(() => questions.filter((x) => (!q || `${x.title} ${x.questionText} ${x.category} ${x.tags.join(" ")}`.toLowerCase().includes(q)) && (difficultyFilter === "all" || x.difficulty === difficultyFilter)), [difficultyFilter, q, questions]);
  const sortedFinalTests = useMemo(() => [...finalTests].sort((a, b) => (a.reviewStatus === "pending" ? -1 : 1) - (b.reviewStatus === "pending" ? -1 : 1) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [finalTests]);
  const reviewChart = useMemo(() => Object.entries(finalTests.reduce<Record<string, number>>((acc, item) => ({ ...acc, [item.reviewStatus]: (acc[item.reviewStatus] || 0) + 1 }), {})).map(([label, value]) => ({ label: rs(label as AdminFinalTestRecord["reviewStatus"]), value })), [finalTests]);
  const contentChart = useMemo(() => [{ label: "Questions", value: dashboard?.totalQuestions || 0 }, { label: "Tasks", value: dashboard?.totalTasks || 0 }, { label: "Daily", value: dashboard?.totalDailyTasks || 0 }, { label: "Videos", value: dashboard?.totalLearningVideos || 0 }, { label: "Tests", value: dashboard?.totalFinalTestSubmissions || 0 }, { label: "Certs", value: dashboard?.certificatesIssued || 0 }], [dashboard]);
  const openTaskDialog = () => setTaskOpenRequest((current) => current + 1);
  const finalTestQuestionPool = useMemo(
    () => questions.filter((question) => question.status === "published" && ["final-test", "both", "all"].includes(question.targetType)),
    [questions],
  );
  const assignedFinalTestQuestionIds = useMemo(
    () => new Set((finalTestConfig?.assignedQuestions || []).map((item) => item.questionId)),
    [finalTestConfig],
  );
  const assignedFinalTestQuestions = useMemo(
    () => normalizeAssignedQuestions(finalTestConfig?.assignedQuestions || [])
      .map((item) => ({
        ...item,
        question: finalTestQuestionPool.find((question) => question._id === item.questionId) || questions.find((question) => question._id === item.questionId),
      }))
      .filter((item) => item.question),
    [finalTestConfig, finalTestQuestionPool, questions],
  );

  const handleRole = async (user: AdminUserRecord, role: "user" | "admin") => { setBusyUserId(user._id); try { const res = await api.updateUserRole(user._id, role); setUsers((cur) => cur.map((item) => item._id === user._id ? res.data : item)); await load(true); toast({ title: "Role updated", description: `${user.email} is now ${role}.` }); } catch (e) { toast({ title: "Role update failed", description: e instanceof Error ? e.message : "Could not update role.", variant: "destructive" }); } finally { setBusyUserId(null); } };
  const handleStatus = async (user: AdminUserRecord, status: "active" | "suspended") => { setBusyUserId(user._id); try { const res = await api.updateUserStatus(user._id, status); setUsers((cur) => cur.map((item) => item._id === user._id ? res.data : item)); await load(true); toast({ title: "Status updated", description: `${user.email} is now ${status}.` }); } catch (e) { toast({ title: "Status update failed", description: e instanceof Error ? e.message : "Could not update status.", variant: "destructive" }); } finally { setBusyUserId(null); } };
  const openFinalTest = async (id: string) => { setDialogOpen(true); setDetailLoading(true); try { const res = await api.getFinalTest(id); setSelectedFinalTest(res.data); setReviewStatus(res.data.reviewStatus); setReviewNotes(res.data.adminNotes || ""); } catch (e) { toast({ title: "Could not open submission", description: e instanceof Error ? e.message : "Failed to load final test.", variant: "destructive" }); setDialogOpen(false); } finally { setDetailLoading(false); } };
  const saveReview = async () => { if (!selectedFinalTest) return; setReviewBusy(true); try { const res = await api.reviewFinalTest(selectedFinalTest._id, { reviewStatus, adminNotes: reviewNotes.trim() || undefined }); setSelectedFinalTest(res.data); setFinalTests((cur) => cur.map((item) => item._id === res.data._id ? res.data : item)); await load(true); toast({ title: "Review saved", description: `Marked as ${rs(res.data.reviewStatus)}.` }); } catch (e) { toast({ title: "Review failed", description: e instanceof Error ? e.message : "Could not save review.", variant: "destructive" }); } finally { setReviewBusy(false); } };
  const toggleFinalTestQuestion = (questionId: string) => setFinalTestConfig((current) => {
    if (!current) {
      return current;
    }

    const exists = current.assignedQuestions.some((item) => item.questionId === questionId);
    const assignedQuestions = exists
      ? current.assignedQuestions.filter((item) => item.questionId !== questionId)
      : [...current.assignedQuestions, { questionId, order: current.assignedQuestions.length }];

    return {
      ...current,
      assignedQuestions: normalizeAssignedQuestions(assignedQuestions),
    };
  });
  const moveFinalTestQuestion = (questionId: string, direction: "up" | "down") => setFinalTestConfig((current) => {
    if (!current) {
      return current;
    }

    const items = normalizeAssignedQuestions(current.assignedQuestions);
    const index = items.findIndex((item) => item.questionId === questionId);
    if (index === -1) {
      return current;
    }

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) {
      return current;
    }

    const nextItems = [...items];
    [nextItems[index], nextItems[targetIndex]] = [nextItems[targetIndex], nextItems[index]];

    return {
      ...current,
      assignedQuestions: normalizeAssignedQuestions(nextItems),
    };
  });
  const saveFinalTestConfig = async () => {
    if (!finalTestConfig) {
      return;
    }

    setConfigBusy(true);
    try {
      const response = await adminApi.updateFinalTestConfig(buildFinalTestConfigPayload(finalTestConfig));
      setFinalTestConfig(response.data);
      await load(true);
      toast({
        title: "Final test config saved",
        description: "The final test setup is now updated in the backend.",
      });
    } catch (e) {
      toast({
        title: "Could not save final test config",
        description: e instanceof Error ? e.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setConfigBusy(false);
    }
  };
  const publishFinalTestConfig = async () => {
    if (!finalTestConfig) {
      return;
    }

    setConfigBusy(true);
    try {
      const response = await adminApi.publishFinalTestConfig(true);
      setFinalTestConfig(response.data);
      await load(true);
      toast({
        title: "Final test published",
        description: "Learners can now open the final test page.",
      });
    } catch (e) {
      toast({
        title: "Could not publish final test",
        description: e instanceof Error ? e.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setConfigBusy(false);
    }
  };
  const unpublishFinalTestConfig = async () => {
    setConfigBusy(true);
    try {
      const response = await adminApi.unpublishFinalTestConfig();
      setFinalTestConfig(response.data);
      await load(true);
      toast({
        title: "Final test moved back to draft",
        description: "The learner final-test page is now disabled until you publish again.",
      });
    } catch (e) {
      toast({
        title: "Could not unpublish final test",
        description: e instanceof Error ? e.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setConfigBusy(false);
    }
  };

  const stats = dashboard ? [{ label: "Total Users", value: n(dashboard.totalUsers), help: `${n(dashboard.activeUsers)} active`, progress: dashboard.totalUsers ? (dashboard.activeUsers / dashboard.totalUsers) * 100 : 0, icon: Users }, { label: "Question Bank", value: n(dashboard.totalQuestions), help: `${n(dashboard.publishedQuestions)} published`, progress: dashboard.totalQuestions ? (dashboard.publishedQuestions / dashboard.totalQuestions) * 100 : 0, icon: BookOpenText }, { label: "Tasks", value: n(dashboard.totalTasks), help: `${n(dashboard.totalDailyTasks)} daily tasks`, progress: Math.min(100, dashboard.totalDailyTasks * 10), icon: FileText }, { label: "Videos", value: n(dashboard.totalLearningVideos), help: "Live learning content", progress: Math.min(100, dashboard.totalLearningVideos * 12), icon: Video }, { label: "Final Tests", value: n(dashboard.totalFinalTestSubmissions), help: `${n(dashboard.pendingFinalTestReviews)} pending`, progress: dashboard.totalFinalTestSubmissions ? ((dashboard.totalFinalTestSubmissions - dashboard.pendingFinalTestReviews) / dashboard.totalFinalTestSubmissions) * 100 : 0, icon: ShieldAlert }, { label: "Certificates", value: n(dashboard.certificatesIssued), help: `${n(dashboard.leaderboard.activeUsers)} on leaderboard`, progress: Math.min(100, dashboard.certificatesIssued * 8), icon: Trophy }] : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070812] p-6 text-slate-100">
        <div className="mx-auto max-w-[1680px] space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className={glass}>
              <CardContent className="space-y-4 p-5">
                <Skeleton className="h-4 w-24 bg-white/10" />
                <Skeleton className="h-10 w-32 bg-white/10" />
                <Skeleton className="h-2 w-full bg-white/10" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070812] text-slate-100">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -left-24 top-[-8rem] h-[28rem] w-[28rem] rounded-full bg-violet-500/14 blur-3xl" />
        <div className="absolute right-[-8rem] top-1/3 h-[24rem] w-[24rem] rounded-full bg-fuchsia-500/12 blur-3xl" />
      </div>
      <div className="relative z-10 px-4 py-6 md:px-6 xl:px-8">
        <div className={cn(glass, "mx-auto mb-6 flex max-w-[1680px] flex-col gap-4 px-4 py-4 sm:px-5 md:flex-row md:items-center md:justify-between")}>
          <div className="flex items-center gap-4">
            <Button variant="outline" className="h-10 rounded-2xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]" onClick={() => navigate("/home")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to App
            </Button>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-violet-200/80">Sandysquad</p>
              <h1 className="text-2xl font-semibold text-white">Admin Console</h1>
              <p className="text-sm text-slate-400">Signed in as {me?.fullName || me?.email || "Admin"}</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative w-full md:min-w-[280px] md:max-w-sm">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users, content, and submissions" className={cn("h-11 rounded-2xl pl-10", control)} />
            </div>
            <Button onClick={openTaskDialog} className="h-11 w-full rounded-2xl bg-fuchsia-600 text-white hover:bg-fuchsia-500 md:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Task
            </Button>
            <Button onClick={() => void load(true)} className="h-11 w-full rounded-2xl bg-violet-600 text-white hover:bg-violet-500 md:w-auto" disabled={refreshing}>
              {refreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
              Refresh
            </Button>
          </div>
        </div>

        <div className="mx-auto max-w-[1680px] space-y-6">
          {error ? <ErrorMessage message={error} onRetry={() => void load()} /> : null}
          {!error ? (
            <>
              {loadWarning ? (
                <div className="rounded-3xl border border-amber-400/20 bg-amber-500/10 px-5 py-4 text-sm text-amber-100">
                  {loadWarning}
                </div>
              ) : null}
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {stats.map((card) => (
                  <Card key={card.label} className={glass}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{card.label}</p>
                          <p className="mt-3 text-3xl font-semibold text-white">{card.value}</p>
                          <p className="mt-2 text-sm text-slate-400">{card.help}</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3">
                          <card.icon className="h-5 w-5 text-violet-200" />
                        </div>
                      </div>
                      <Progress value={card.progress} className="mt-5 h-2 bg-white/10" />
                    </CardContent>
                  </Card>
                ))}
              </div>

              <AdminManagementActions
                questions={questions}
                onSuccess={() => load(true)}
                openTaskRequest={taskOpenRequest}
              />

              <div className="grid gap-6 xl:grid-cols-[1.35fr,0.95fr]">
                <Card className={glass}>
                  <CardHeader className="gap-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <CardTitle className="text-white">User Management</CardTitle>
                        <CardDescription className="text-slate-400">Live authenticated users with real role, status, and last-active details.</CardDescription>
                      </div>
                      <div className="grid gap-3 sm:flex sm:items-center">
                        <Badge className="h-10 rounded-2xl border-white/10 bg-white/[0.05] px-4 text-slate-200">
                          {filteredUsers.length} visible users
                        </Badge>
                        <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as typeof roleFilter)}>
                          <SelectTrigger className={cn("h-10 w-full rounded-2xl sm:w-[140px]", control)}><SelectValue /></SelectTrigger>
                          <SelectContent className="border-white/10 bg-slate-950 text-slate-100">
                            <SelectItem value="all">All roles</SelectItem>
                            <SelectItem value="user">Users</SelectItem>
                            <SelectItem value="admin">Admins</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
                          <SelectTrigger className={cn("h-10 w-full rounded-2xl sm:w-[150px]", control)}><SelectValue /></SelectTrigger>
                          <SelectContent className="border-white/10 bg-slate-950 text-slate-100">
                            <SelectItem value="all">All statuses</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="suspended">Suspended</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {filteredUsers.length === 0 ? (
                      <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center text-sm text-slate-400">No users matched the current filters.</div>
                    ) : (
                      <div className="overflow-x-auto rounded-3xl border border-white/10">
                        <Table className="min-w-[720px]">
                          <TableHeader>
                            <TableRow className="border-white/10 bg-white/[0.03] hover:bg-white/[0.03]">
                              <TableHead className="text-slate-300">User</TableHead>
                              <TableHead className="text-slate-300">Access</TableHead>
                              <TableHead className="text-slate-300">Progress</TableHead>
                              <TableHead className="text-right text-slate-300">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredUsers.map((u) => (
                              <TableRow key={u._id} className="border-white/10 hover:bg-white/[0.03]">
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10 border border-white/10"><AvatarFallback className="bg-violet-500/15 text-violet-100">{(u.fullName || u.email).slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                                    <div>
                                      <p className="font-medium text-white">{u.fullName || u.email}</p>
                                      <p className="text-xs text-slate-400">{u.email}</p>
                                      <p className="mt-1 text-[11px] text-slate-500">
                                        {u.dept ? `Dept ${u.dept}` : "No department"} / Last active {d(u.lastActive)}
                                      </p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-wrap gap-2">
                                    <Badge className={cn("capitalize", u.role === "admin" ? "border-violet-400/25 bg-violet-500/12 text-violet-200" : "border-white/10 bg-white/[0.05] text-slate-200")}>{u.role}</Badge>
                                    <Badge className={cn("capitalize", userTone[u.status])}>{u.status}</Badge>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <p className="text-sm text-white">Score {n(u.score || 0)}</p>
                                  <p className="text-xs text-slate-400">Level {u.level || 1} • Streak {u.streak || 0}</p>
                                </TableCell>
                                <TableCell className="text-right">
                                   <div className="flex flex-col justify-end gap-2 sm:flex-row">
                                     <Button size="sm" className="rounded-2xl bg-violet-600 text-white hover:bg-violet-500" disabled={busyUserId === u._id} onClick={() => void handleRole(u, u.role === "admin" ? "user" : "admin")}>{busyUserId === u._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="mr-2 h-4 w-4" />}{u.role === "admin" ? "Remove Admin" : "Make Admin"}</Button>
                                     <Button variant="outline" size="sm" className="rounded-2xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]" disabled={busyUserId === u._id} onClick={() => void handleStatus(u, u.status === "active" ? "suspended" : "active")}>{u.status === "active" ? "Suspend" : "Activate"}</Button>
                                   </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="grid gap-6">
                  <Card className={glass}>
                    <CardHeader className="gap-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2 text-white">
                            <Settings2 className="h-5 w-5 text-violet-200" />
                            Final Test Control
                          </CardTitle>
                          <CardDescription className="text-slate-400">
                            Save the final-test setup here, assign published questions, then publish to make the learner exam page work.
                          </CardDescription>
                        </div>
                        {finalTestConfig ? (
                          <div className="flex flex-wrap gap-2">
                            <Badge className="border-white/10 bg-white/[0.05] text-slate-200 capitalize">
                              {finalTestConfig.status}
                            </Badge>
                            <Badge className={cn(finalTestConfig.enabled ? "border-emerald-400/25 bg-emerald-500/12 text-emerald-200" : "border-amber-400/25 bg-amber-500/12 text-amber-200")}>
                              {finalTestConfig.enabled ? "Enabled" : "Disabled"}
                            </Badge>
                          </div>
                        ) : null}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {!finalTestConfig ? (
                        <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center text-sm text-slate-400">
                          Final-test configuration could not be loaded yet.
                        </div>
                      ) : (
                        <>
                          <div className="grid gap-3 md:grid-cols-2">
                            <Input
                              value={finalTestConfig.title}
                              onChange={(event) => setFinalTestConfig((current) => current ? ({ ...current, title: event.target.value }) : current)}
                              placeholder="Final test title"
                              className={cn("rounded-2xl", control)}
                            />
                            <Input
                              type="number"
                              min={1}
                              max={100}
                              value={finalTestConfig.questionCount}
                              onChange={(event) => setFinalTestConfig((current) => current ? ({ ...current, questionCount: Math.max(1, Number(event.target.value || 1)) }) : current)}
                              placeholder="Question count"
                              className={cn("rounded-2xl", control)}
                            />
                            <Input
                              type="number"
                              min={1}
                              max={240}
                              value={finalTestConfig.timeLimitMinutes}
                              onChange={(event) => setFinalTestConfig((current) => current ? ({ ...current, timeLimitMinutes: Math.max(1, Number(event.target.value || 1)) }) : current)}
                              placeholder="Time limit"
                              className={cn("rounded-2xl", control)}
                            />
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              value={finalTestConfig.passingScore}
                              onChange={(event) => setFinalTestConfig((current) => current ? ({ ...current, passingScore: Math.max(0, Math.min(100, Number(event.target.value || 0))) }) : current)}
                              placeholder="Passing score"
                              className={cn("rounded-2xl", control)}
                            />
                            <Select value={finalTestConfig.allowRetake ? "yes" : "no"} onValueChange={(value) => setFinalTestConfig((current) => current ? ({ ...current, allowRetake: value === "yes" }) : current)}>
                              <SelectTrigger className={cn("rounded-2xl", control)}><SelectValue /></SelectTrigger>
                              <SelectContent className="border-white/10 bg-slate-950 text-slate-100">
                                <SelectItem value="yes">Retakes allowed</SelectItem>
                                <SelectItem value="no">Retakes disabled</SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                              {assignedFinalTestQuestions.length} assigned / {finalTestQuestionPool.length} eligible questions
                            </div>
                          </div>

                          <Textarea
                            value={finalTestConfig.instructions}
                            onChange={(event) => setFinalTestConfig((current) => current ? ({ ...current, instructions: event.target.value }) : current)}
                            placeholder="Instructions shown to learners before they start the final test"
                            className={cn("min-h-[120px] rounded-3xl border-white/10 bg-white/[0.05] text-slate-100 placeholder:text-slate-500", control)}
                          />

                          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="text-sm font-medium text-white">Eligible question bank items</p>
                                <p className="text-xs text-slate-400">
                                  Published questions with target type `final-test`, `both`, or `all` can be assigned here.
                                </p>
                              </div>
                              <Badge className="w-fit border-white/10 bg-white/[0.05] text-slate-200">
                                {assignedFinalTestQuestions.length} selected
                              </Badge>
                            </div>
                            {finalTestQuestionPool.length ? (
                              <ScrollArea className="mt-3 h-[320px] pr-4">
                                <div className="grid gap-2">
                                  {finalTestQuestionPool.map((question) => {
                                    const selected = assignedFinalTestQuestionIds.has(question._id);
                                    return (
                                      <button
                                        key={question._id}
                                        type="button"
                                        onClick={() => toggleFinalTestQuestion(question._id)}
                                        className={cn(
                                          "rounded-2xl border px-4 py-3 text-left transition",
                                          selected
                                            ? "border-violet-400/35 bg-violet-500/12"
                                            : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]",
                                        )}
                                      >
                                        <div className="flex flex-wrap items-center gap-2">
                                          <p className="font-medium text-white">{question.title}</p>
                                          <Badge className={cn("capitalize", questionTone[question.difficulty])}>{question.difficulty}</Badge>
                                          <Badge className="border-white/10 bg-white/[0.05] text-slate-200 capitalize">{question.targetType}</Badge>
                                          {selected ? (
                                            <Badge className="border-violet-300/20 bg-violet-500/12 text-violet-100">
                                              Selected
                                            </Badge>
                                          ) : null}
                                        </div>
                                        <p className="mt-2 text-sm text-slate-400">{question.questionText}</p>
                                      </button>
                                    );
                                  })}
                                </div>
                              </ScrollArea>
                            ) : (
                              <div className="mt-3 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-6 text-sm text-slate-400">
                                Create and publish at least one question for the final test first, then assign it here.
                              </div>
                            )}
                          </div>

                          {assignedFinalTestQuestions.length ? (
                            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                              <p className="text-sm font-medium text-white">Assigned order</p>
                              <div className="mt-3 space-y-2">
                                {assignedFinalTestQuestions.map((item, index) => (
                                  <div key={item.questionId} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                      <p className="text-sm font-medium text-white">
                                        {index + 1}. {item.question?.title}
                                      </p>
                                      <p className="mt-1 text-xs text-slate-400">
                                        {item.question?.category} / {item.question?.questionType.replace(/_/g, " ")} / {item.question?.points} pts
                                      </p>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="rounded-2xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]"
                                        onClick={() => moveFinalTestQuestion(item.questionId, "up")}
                                        disabled={index === 0}
                                      >
                                        <ArrowUp className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="rounded-2xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]"
                                        onClick={() => moveFinalTestQuestion(item.questionId, "down")}
                                        disabled={index === assignedFinalTestQuestions.length - 1}
                                      >
                                        <ArrowDown className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="rounded-2xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]"
                                        onClick={() => toggleFinalTestQuestion(item.questionId)}
                                      >
                                        Remove
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null}

                          <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
                            <Button className="rounded-2xl bg-violet-600 text-white hover:bg-violet-500" onClick={() => void saveFinalTestConfig()} disabled={configBusy}>
                              {configBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                              Save config
                            </Button>
                            <Button className="rounded-2xl bg-emerald-600 text-white hover:bg-emerald-500" onClick={() => void publishFinalTestConfig()} disabled={configBusy || assignedFinalTestQuestions.length === 0}>
                              Publish and enable
                            </Button>
                            <Button variant="outline" className="rounded-2xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]" onClick={() => void unpublishFinalTestConfig()} disabled={configBusy}>
                              Move to draft
                            </Button>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  <Card className={glass}>
                    <CardHeader>
                      <CardTitle className="text-white">Final Test Review Queue</CardTitle>
                      <CardDescription className="text-slate-400">Admins can inspect transcript, proctoring events, and saved audio/video evidence.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {sortedFinalTests.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center text-sm text-slate-400">No final tests yet. Submit one from the proctored exam flow.</div>
                      ) : (
                        <div className="space-y-3">
                          {sortedFinalTests.slice(0, 5).map((item) => (
                            <div key={item._id} className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="font-medium text-white">{item.testTitle}</p>
                                    <Badge className={cn("capitalize", reviewTone[item.reviewStatus])}>{rs(item.reviewStatus)}</Badge>
                                  </div>
                                  <p className="mt-1 text-sm text-slate-400">{item.user?.fullName || item.user?.email || "Learner"} • Score {item.score}/100</p>
                                  <p className="mt-2 text-xs text-slate-500">Risk {Math.round(item.proctoring?.riskScore || 0)} • {item.flags.length} flags • {d(item.createdAt)}</p>
                                </div>
                                <Button variant="outline" className="rounded-2xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]" onClick={() => void openFinalTest(item._id)}><Eye className="mr-2 h-4 w-4" />Review</Button>
                              </div>
                              <div className="mt-3 flex gap-2 text-xs">
                                <Badge className="border-white/10 bg-white/[0.05] text-slate-200"><Mic className="mr-1 h-3 w-3" />{item.recordings?.audio?.url ? "Audio saved" : "No audio"}</Badge>
                                <Badge className="border-white/10 bg-white/[0.05] text-slate-200"><Camera className="mr-1 h-3 w-3" />{item.recordings?.video?.url ? "Video saved" : "No video"}</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className={glass}>
                    <CardHeader>
                      <CardTitle className="text-white">Recent Activity</CardTitle>
                      <CardDescription className="text-slate-400">Live backend activity from admin actions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[280px] pr-4">
                        <div className="space-y-3">
                          {dashboard?.recentActivity.length ? dashboard.recentActivity.map((item) => (
                            <div key={item._id} className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                              <p className="text-sm font-medium text-white">{item.description}</p>
                              <p className="mt-1 text-xs text-slate-400">{item.actor?.fullName || item.actor?.email || "System"} • {d(item.createdAt)}</p>
                            </div>
                          )) : <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center text-sm text-slate-400">No admin activity yet.</div>}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
                <Card className={glass}>
                  <CardHeader>
                    <CardTitle className="text-white">Content Control Center</CardTitle>
                    <CardDescription className="text-slate-400">Questions, tasks, daily tasks, and videos are now loaded from the backend.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <Tabs defaultValue="questions" className="space-y-4">
                      <TabsList className="grid h-auto w-full grid-cols-2 rounded-2xl bg-white/[0.04] sm:grid-cols-4">
                        <TabsTrigger value="questions">Questions</TabsTrigger>
                        <TabsTrigger value="tasks">Tasks</TabsTrigger>
                        <TabsTrigger value="daily">Daily</TabsTrigger>
                        <TabsTrigger value="videos">Videos</TabsTrigger>
                      </TabsList>
                        <TabsContent value="questions" className="space-y-4">
                        <Select value={difficultyFilter} onValueChange={(v) => setDifficultyFilter(v as typeof difficultyFilter)}>
                          <SelectTrigger className={cn("h-10 w-full rounded-2xl sm:w-[180px]", control)}><SelectValue /></SelectTrigger>
                          <SelectContent className="border-white/10 bg-slate-950 text-slate-100">
                            <SelectItem value="all">All difficulties</SelectItem>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                        {filteredQuestions.length ? <div className="grid gap-3">{filteredQuestions.slice(0, 8).map((x) => <div key={x._id} className="rounded-3xl border border-white/10 bg-white/[0.03] p-4"><div className="flex flex-wrap items-center gap-2"><p className="font-medium text-white">{x.title}</p><Badge className={cn("capitalize", questionTone[x.difficulty])}>{x.difficulty}</Badge><Badge className="border-white/10 bg-white/[0.05] text-slate-200 capitalize">{x.status}</Badge></div><p className="mt-2 text-sm text-slate-400">{x.questionText}</p><div className="mt-3 flex flex-wrap gap-2 text-xs"><Badge className="border-white/10 bg-white/[0.05] text-slate-200">{x.category}</Badge><Badge className="border-white/10 bg-white/[0.05] text-slate-200">{x.questionType}</Badge><Badge className="border-white/10 bg-white/[0.05] text-slate-200">{x.points} pts</Badge></div></div>)}</div> : <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center text-sm text-slate-400">No questions matched the current filter.</div>}
                      </TabsContent>
                      <TabsContent value="tasks" className="space-y-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-medium text-white">Practice tasks</p>
                            <p className="text-xs text-slate-400">Quick-add tasks now pull in matching question-bank items automatically.</p>
                          </div>
                          <Button onClick={openTaskDialog} className="rounded-2xl bg-fuchsia-600 text-white hover:bg-fuchsia-500">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Task
                          </Button>
                        </div>
                        {tasks.length ? <div className="grid gap-3">{tasks.map((x) => <div key={x._id} className="rounded-3xl border border-white/10 bg-white/[0.03] p-4"><div className="flex flex-wrap items-center gap-2"><p className="font-medium text-white">{x.title}</p><Badge className="border-white/10 bg-white/[0.05] text-slate-200 capitalize">{x.status}</Badge></div><p className="mt-2 text-sm text-slate-400">{x.description}</p><p className="mt-3 text-xs text-slate-500">Category {x.category} • Reward {x.rewardPoints} • Due {x.dueDate ? d(x.dueDate) : "Open"}</p></div>)}</div> : <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center text-sm text-slate-400">No tasks have been created yet.</div>}
                      </TabsContent>
                      <TabsContent value="daily">{dailyTasks.length ? <div className="grid gap-3">{dailyTasks.map((x) => <div key={x._id} className="rounded-3xl border border-white/10 bg-white/[0.03] p-4"><div className="flex flex-wrap items-center gap-2"><p className="font-medium text-white">{x.title}</p><Badge className="border-white/10 bg-white/[0.05] text-slate-200 capitalize">{x.status}</Badge></div><p className="mt-2 text-sm text-slate-400">{x.description}</p><p className="mt-3 text-xs text-slate-500">Active {d(x.activeDate)} • Expires {d(x.expiryDate)} • Reward {x.rewardPoints}</p></div>)}</div> : <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center text-sm text-slate-400">No daily tasks are scheduled yet.</div>}</TabsContent>
                      <TabsContent value="videos">{videos.length ? <div className="grid gap-3">{videos.map((x) => <div key={x._id} className="rounded-3xl border border-white/10 bg-white/[0.03] p-4"><div className="flex flex-wrap items-center gap-2"><p className="font-medium text-white">{x.title}</p><Badge className="border-white/10 bg-white/[0.05] text-slate-200 capitalize">{x.status}</Badge><Badge className="border-white/10 bg-white/[0.05] text-slate-200 capitalize">{x.visibility}</Badge></div><p className="mt-2 text-sm text-slate-400">{x.description}</p><p className="mt-3 text-xs text-slate-500">Level {x.level} • Category {x.category} • Duration {x.duration || 0}s</p></div>)}</div> : <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center text-sm text-slate-400">No videos are available yet.</div>}</TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                <div className="grid gap-6">
                  <Card className={glass}><CardHeader><CardTitle className="text-white">Platform Analytics</CardTitle><CardDescription className="text-slate-400">Live collection counts from the current backend state.</CardDescription></CardHeader><CardContent className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={contentChart}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" /><XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16 }} /><Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></CardContent></Card>
                  <Card className={glass}><CardHeader><CardTitle className="text-white">Review Status Mix</CardTitle><CardDescription className="text-slate-400">Current final-test review distribution.</CardDescription></CardHeader><CardContent className="h-56">{reviewChart.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={reviewChart}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" /><XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16 }} /><Bar dataKey="value" fill="#c026d3" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer> : <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center text-sm text-slate-400">No review data yet.</div>}</CardContent></Card>
                  <Card className={glass}><CardHeader><CardTitle className="text-white">Leaderboard Snapshot</CardTitle><CardDescription className="text-slate-400">Top learners from the current leaderboard cache.</CardDescription></CardHeader><CardContent className="space-y-3">{dashboard?.leaderboard.topUsers.length ? dashboard.leaderboard.topUsers.map((entry, i) => <div key={`${entry.email}-${i}`} className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-sm font-semibold text-white">#{i + 1}</div><div><p className="break-all text-sm font-medium text-white">{entry.email}</p><p className="text-xs text-slate-400">Level {entry.level} • Streak {entry.streak}</p></div></div><Badge className="w-fit border-white/10 bg-white/[0.05] text-slate-200">{n(entry.score)}</Badge></div>) : <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center text-sm text-slate-400">No leaderboard entries yet.</div>}</CardContent></Card>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] w-[calc(100vw-1rem)] max-w-5xl overflow-y-auto border-white/10 bg-[#090c18] text-slate-100 sm:w-full">
          <DialogHeader>
            <DialogTitle>Final Test Review</DialogTitle>
            <DialogDescription className="text-slate-400">Inspect transcript, flags, proctoring events, and saved media evidence.</DialogDescription>
          </DialogHeader>
          {detailLoading || !selectedFinalTest ? (
            <div className="py-10"><Spinner /></div>
          ) : (
            <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
              <div className="space-y-4">
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-lg font-semibold text-white">{selectedFinalTest.testTitle}</p>
                    <Badge className={cn("capitalize", reviewTone[selectedFinalTest.reviewStatus])}>{rs(selectedFinalTest.reviewStatus)}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{selectedFinalTest.user?.fullName || selectedFinalTest.user?.email || "Learner"} • Score {selectedFinalTest.score}/100 • {d(selectedFinalTest.createdAt)}</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <Card className="border-white/10 bg-white/[0.03]"><CardContent className="p-4"><p className="text-xs uppercase tracking-[0.2em] text-slate-400">Risk</p><p className="mt-2 text-2xl font-semibold text-white">{Math.round(selectedFinalTest.proctoring?.riskScore || 0)}</p></CardContent></Card>
                    <Card className="border-white/10 bg-white/[0.03]"><CardContent className="p-4"><p className="text-xs uppercase tracking-[0.2em] text-slate-400">Flags</p><p className="mt-2 text-2xl font-semibold text-white">{selectedFinalTest.flags.length}</p></CardContent></Card>
                    <Card className="border-white/10 bg-white/[0.03]"><CardContent className="p-4"><p className="text-xs uppercase tracking-[0.2em] text-slate-400">Reviewer</p><p className="mt-2 text-sm font-semibold text-white">{selectedFinalTest.reviewedBy?.fullName || selectedFinalTest.reviewedBy?.email || "Not reviewed yet"}</p></CardContent></Card>
                  </div>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <Card className="border-white/10 bg-white/[0.03]"><CardHeader><CardTitle className="text-base text-white">Video</CardTitle></CardHeader><CardContent>{selectedFinalTest.recordings?.video?.url ? <video controls src={selectedFinalTest.recordings.video.url} className="aspect-video w-full rounded-2xl border border-white/10 bg-black" /> : <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center text-sm text-slate-400">No saved camera video.</div>}</CardContent></Card>
                  <Card className="border-white/10 bg-white/[0.03]"><CardHeader><CardTitle className="text-base text-white">Audio</CardTitle></CardHeader><CardContent>{selectedFinalTest.recordings?.audio?.url ? <div className="space-y-3"><audio controls src={selectedFinalTest.recordings.audio.url} className="w-full" /><p className="text-xs text-slate-400">MIME {selectedFinalTest.recordings.audio.mimeType || "Unknown"} • Duration {selectedFinalTest.recordings.audio.durationSeconds || 0}s</p></div> : <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center text-sm text-slate-400">No saved audio clip.</div>}</CardContent></Card>
                </div>
                <Card className="border-white/10 bg-white/[0.03]"><CardHeader><CardTitle className="text-base text-white">Transcript</CardTitle></CardHeader><CardContent><p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">{selectedFinalTest.responseTranscript || "No transcript stored."}</p><p className="mt-4 text-sm leading-relaxed text-slate-400">{selectedFinalTest.recommendation || "No AI recommendation stored."}</p></CardContent></Card>
                <Card className="border-white/10 bg-white/[0.03]"><CardHeader><CardTitle className="text-base text-white">Proctoring Events</CardTitle></CardHeader><CardContent>{selectedFinalTest.proctoring?.events?.length ? <ScrollArea className="h-56 pr-4"><div className="space-y-3">{selectedFinalTest.proctoring.events.map((event, i) => <div key={`${event.time}-${i}`} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><div className="flex flex-wrap items-center gap-2"><Badge className={cn("capitalize", event.type === "danger" ? "border-rose-400/25 bg-rose-500/12 text-rose-200" : event.type === "warning" ? "border-amber-400/25 bg-amber-500/12 text-amber-200" : "border-white/10 bg-white/[0.05] text-slate-200")}>{event.type}</Badge><Badge className="border-white/10 bg-white/[0.05] text-slate-200 capitalize">{event.source}</Badge><span className="text-xs text-slate-500">{event.time}</span></div><p className="mt-2 text-sm text-slate-200">{event.message}</p></div>)}</div></ScrollArea> : <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center text-sm text-slate-400">No proctoring events stored for this attempt.</div>}</CardContent></Card>
              </div>
              <div className="space-y-4">
                <Card className="border-white/10 bg-white/[0.03]"><CardHeader><CardTitle className="text-base text-white">Flags</CardTitle></CardHeader><CardContent className="space-y-3">{selectedFinalTest.flags.length ? selectedFinalTest.flags.map((flag) => <div key={flag} className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-3 text-sm text-amber-100">{flag}</div>) : <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center text-sm text-slate-400">No explicit flags for this attempt.</div>}</CardContent></Card>
                <Card className="border-white/10 bg-white/[0.03]">
                  <CardHeader><CardTitle className="text-base text-white">Admin Decision</CardTitle><CardDescription className="text-slate-400">Update review status and notes.</CardDescription></CardHeader>
                  <CardContent className="space-y-4">
                    <Select value={reviewStatus} onValueChange={(v) => setReviewStatus(v as AdminFinalTestRecord["reviewStatus"])}>
                      <SelectTrigger className={cn("h-11 rounded-2xl", control)}><SelectValue /></SelectTrigger>
                      <SelectContent className="border-white/10 bg-slate-950 text-slate-100">
                        <SelectItem value="pending">Pending</SelectItem><SelectItem value="reviewed">Reviewed</SelectItem><SelectItem value="approved">Approved</SelectItem><SelectItem value="rejected">Rejected</SelectItem><SelectItem value="re_evaluation_requested">Re-evaluation requested</SelectItem>
                      </SelectContent>
                    </Select>
                    <Textarea value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} placeholder="Add admin notes for this submission" className={cn("min-h-[180px] rounded-3xl border-white/10 bg-white/[0.05] text-slate-100 placeholder:text-slate-500", control)} />
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" className="rounded-2xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]" onClick={() => setDialogOpen(false)}>Close</Button>
            <Button className="rounded-2xl bg-violet-600 text-white hover:bg-violet-500" onClick={() => void saveReview()} disabled={reviewBusy || detailLoading || !selectedFinalTest}>{reviewBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Shield className="mr-2 h-4 w-4" />}Save Review</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
