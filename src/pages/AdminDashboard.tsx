import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Bell,
  Bot,
  CheckCircle2,
  ChevronDown,
  Clock3,
  CreditCard,
  Download,
  Eye,
  FileSpreadsheet,
  Flame,
  Mail,
  Megaphone,
  MoreHorizontal,
  Pencil,
  Plus,
  Radio,
  RotateCcw,
  Search,
  Server,
  ShieldAlert,
  Trash2,
  UserPlus,
  Users,
  Wifi,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, XAxis } from "recharts";

import { cn } from "@lib/utils";
import { Avatar, AvatarFallback } from "@components/ui/avatar";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@components/ui/chart";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@components/ui/dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@components/ui/drawer";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@components/ui/dropdown-menu";
import { Input } from "@components/ui/input";
import { Progress } from "@components/ui/progress";
import { ScrollArea } from "@components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { Skeleton } from "@components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";

const glassCard = "rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] shadow-[0_20px_70px_rgba(3,7,18,0.45)] backdrop-blur-2xl";
const controlClass = "border-white/10 bg-white/[0.05] text-slate-100 placeholder:text-slate-400 focus-visible:ring-violet-500/60 focus-visible:ring-offset-0";
const reveal = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } };

type UserStatus = "Active" | "Review" | "Suspended";
type UserRole = "Student" | "Moderator" | "Admin";
type Department = "Academics" | "Enterprise" | "Support" | "Scholarship";
type QuestionCategory = "grammar" | "reading" | "listening" | "writing" | "mockTests";
type QuestionDifficulty = "Easy" | "Medium" | "Hard";
type Severity = "Critical" | "High" | "Medium" | "Low";

type UserRecord = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  department: Department;
  level: string;
  score: number;
  streak: number;
  status: UserStatus;
  subscription: string;
  joinedAt: string;
  lastSeen: string;
  modules: Array<{ name: string; score: number }>;
};

type AlertRecord = {
  id: string;
  studentName: string;
  examName: string;
  behavior: string;
  timestamp: string;
  severity: Severity;
  summary: string;
  evidence: string[];
};

type SupportLog = {
  id: string;
  type: "Moderation" | "Support";
  subject: string;
  actor: string;
  model: string;
  latencyMs: number;
  status: "Resolved" | "Escalated" | "Queued";
  timestamp: string;
};

type ActivityItem = {
  id: string;
  title: string;
  detail: string;
  timestamp: string;
};

type QuestionRecord = {
  id: string;
  title: string;
  prompt: string;
  difficulty: QuestionDifficulty;
  tags: string[];
  usageCount: number;
};

type StatCard = {
  label: string;
  value: string;
  delta: string;
  deltaTone: "up" | "down";
  icon: typeof Users;
  sparkline: number[];
  accent: string;
  progress: number;
};

const stats: StatCard[] = [
  { label: "Total Users", value: "24,892", delta: "+12.4%", deltaTone: "up", icon: Users, sparkline: [12, 18, 16, 24, 25, 30, 36, 40], accent: "#8b5cf6", progress: 78 },
  { label: "Active Sessions", value: "3,184", delta: "+6.8%", deltaTone: "up", icon: Radio, sparkline: [9, 12, 11, 15, 17, 20, 19, 24], accent: "#6366f1", progress: 62 },
  { label: "Tests Completed", value: "18,406", delta: "+9.1%", deltaTone: "up", icon: CheckCircle2, sparkline: [8, 10, 14, 16, 18, 22, 21, 25], accent: "#c026d3", progress: 71 },
  { label: "Flagged Sessions", value: "46", delta: "-4.2%", deltaTone: "down", icon: ShieldAlert, sparkline: [24, 20, 18, 16, 14, 12, 10, 8], accent: "#fb7185", progress: 24 },
  { label: "AI Requests Today", value: "12,784", delta: "+18.7%", deltaTone: "up", icon: Bot, sparkline: [10, 12, 17, 16, 20, 26, 30, 34], accent: "#a855f7", progress: 88 },
  { label: "Pro Subscriptions", value: "1,284", delta: "+3.6%", deltaTone: "up", icon: CreditCard, sparkline: [6, 8, 9, 12, 12, 14, 16, 18], accent: "#818cf8", progress: 54 },
];

const initialUsers: UserRecord[] = [
  { id: "USR-101", fullName: "Nora Benson", email: "nora.benson@sandysquad.app", role: "Student", department: "Academics", level: "C1 Advanced", score: 9240, streak: 42, status: "Active", subscription: "Pro Annual", joinedAt: "Jan 18, 2026", lastSeen: "2 minutes ago", modules: [{ name: "Grammar", score: 92 }, { name: "Reading", score: 87 }, { name: "Listening", score: 79 }, { name: "Writing", score: 90 }] },
  { id: "USR-102", fullName: "Ibrahim Khan", email: "ibrahim.khan@sandysquad.app", role: "Student", department: "Enterprise", level: "B2 Upper-Intermediate", score: 7120, streak: 19, status: "Review", subscription: "Team Seat", joinedAt: "Feb 2, 2026", lastSeen: "17 minutes ago", modules: [{ name: "Grammar", score: 76 }, { name: "Reading", score: 81 }, { name: "Listening", score: 68 }, { name: "Writing", score: 72 }] },
  { id: "USR-103", fullName: "Claire Moreno", email: "claire.moreno@sandysquad.app", role: "Moderator", department: "Support", level: "Internal Staff", score: 0, streak: 0, status: "Active", subscription: "Staff", joinedAt: "Nov 12, 2025", lastSeen: "Online now", modules: [{ name: "Grammar", score: 100 }, { name: "Reading", score: 100 }, { name: "Listening", score: 100 }, { name: "Writing", score: 100 }] },
  { id: "USR-104", fullName: "Sanjay Patel", email: "sanjay.patel@sandysquad.app", role: "Student", department: "Scholarship", level: "B1 Intermediate", score: 5345, streak: 11, status: "Suspended", subscription: "Grant Cohort", joinedAt: "Mar 11, 2026", lastSeen: "1 day ago", modules: [{ name: "Grammar", score: 62 }, { name: "Reading", score: 64 }, { name: "Listening", score: 58 }, { name: "Writing", score: 60 }] },
  { id: "USR-105", fullName: "Emily Zhang", email: "emily.zhang@sandysquad.app", role: "Admin", department: "Enterprise", level: "Admin", score: 0, streak: 0, status: "Active", subscription: "Staff", joinedAt: "Aug 19, 2025", lastSeen: "42 minutes ago", modules: [{ name: "Grammar", score: 100 }, { name: "Reading", score: 100 }, { name: "Listening", score: 100 }, { name: "Writing", score: 100 }] },
  { id: "USR-106", fullName: "Leo Martins", email: "leo.martins@sandysquad.app", role: "Student", department: "Academics", level: "A2 Elementary", score: 2860, streak: 6, status: "Active", subscription: "Starter", joinedAt: "Apr 6, 2026", lastSeen: "9 minutes ago", modules: [{ name: "Grammar", score: 58 }, { name: "Reading", score: 54 }, { name: "Listening", score: 51 }, { name: "Writing", score: 49 }] },
];

const alertsData: AlertRecord[] = [
  { id: "ALT-301", studentName: "Ibrahim Khan", examName: "Mock Test 07", behavior: "Multiple faces detected", timestamp: "09:48 AM", severity: "Critical", summary: "Camera stream showed two distinct faces for 18 seconds during the speaking section.", evidence: ["Face confidence overlap exceeded 0.92 for 18 seconds.", "Tab focus remained active, suggesting in-room assistance rather than tab switching.", "Alert was triggered during a high-stakes speaking response."] },
  { id: "ALT-302", studentName: "Nora Benson", examName: "Placement Test", behavior: "Frequent gaze diversion", timestamp: "08:21 AM", severity: "Medium", summary: "The student looked away from the screen 7 times within a 3-minute interval.", evidence: ["Gaze threshold exceeded 7 times in 3 minutes.", "Audio remained clear and consistent.", "No additional faces or device switches detected."] },
  { id: "ALT-303", studentName: "Leo Martins", examName: "Listening Challenge", behavior: "Background voice detected", timestamp: "Yesterday", severity: "High", summary: "The microphone picked up another voice during the final listening answer.", evidence: ["Secondary voice confidence scored 0.84.", "Voice appeared 4 seconds before answer submission.", "Camera stream remained stable."] },
  { id: "ALT-304", studentName: "Sanjay Patel", examName: "Grammar Sprint", behavior: "Tab switching", timestamp: "Yesterday", severity: "Low", summary: "Browser focus left the test window twice during an untimed practice assessment.", evidence: ["Two focus changes lasting under 2 seconds each.", "This occurred during a non-proctored practice session.", "No keyboard shortcut anomalies detected."] },
];

const supportLogsData: SupportLog[] = [
  { id: "LOG-811", type: "Moderation", subject: "Essay toxicity false positive review", actor: "Claire Moreno", model: "gpt-4o-mini", latencyMs: 642, status: "Resolved", timestamp: "10:12 AM" },
  { id: "LOG-812", type: "Support", subject: "AI tutor answer quality complaint", actor: "Nora Benson", model: "gpt-4o-mini", latencyMs: 731, status: "Escalated", timestamp: "09:41 AM" },
  { id: "LOG-813", type: "Support", subject: "OTP delivery delay investigation", actor: "Leo Martins", model: "gpt-4o-mini", latencyMs: 514, status: "Queued", timestamp: "08:55 AM" },
  { id: "LOG-814", type: "Moderation", subject: "Question bank profanity scan", actor: "Scheduled job", model: "gpt-4o-mini", latencyMs: 428, status: "Resolved", timestamp: "07:30 AM" },
];

const initialActivity: ActivityItem[] = [
  { id: "ACT-01", title: "Moderator reviewed flagged speaking attempt", detail: "Claire Moreno marked ALT-301 for manual escalation.", timestamp: "Just now" },
  { id: "ACT-02", title: "Question edited in writing bank", detail: "Prompt difficulty moved from Medium to Hard for WR-07.", timestamp: "12 minutes ago" },
  { id: "ACT-03", title: "Leaderboard export generated", detail: "CSV report created for enterprise partners.", timestamp: "35 minutes ago" },
  { id: "ACT-04", title: "Redis cache warmed", detail: "Support answer cache reached 94% hit rate.", timestamp: "1 hour ago" },
];

const initialQuestionBank: Record<QuestionCategory, QuestionRecord[]> = {
  grammar: [
    { id: "GR-101", title: "Subject-verb agreement in complex clauses", prompt: "Choose the sentence with correct agreement when the subject is interrupted by a parenthetical phrase.", difficulty: "Medium", tags: ["Agreement", "Clauses"], usageCount: 1420 },
    { id: "GR-102", title: "Present perfect vs past simple", prompt: "Pick the sentence that correctly uses the present perfect for unfinished time.", difficulty: "Easy", tags: ["Tenses"], usageCount: 2314 },
    { id: "GR-103", title: "Inversion after negative adverbials", prompt: "Select the correct inverted structure after the phrase 'Rarely have...'.", difficulty: "Hard", tags: ["Advanced Grammar", "Inversion"], usageCount: 628 },
  ],
  reading: [
    { id: "RD-201", title: "Inference from research memo", prompt: "Read the memo and infer the author's attitude toward remote collaboration.", difficulty: "Medium", tags: ["Inference", "Business English"], usageCount: 1192 },
    { id: "RD-202", title: "Matching headings to paragraphs", prompt: "Match each heading to the most suitable paragraph in an article on climate policy.", difficulty: "Hard", tags: ["Headings", "Academic Reading"], usageCount: 884 },
  ],
  listening: [
    { id: "LS-301", title: "Lecture note completion", prompt: "Listen to the mini lecture and complete the missing phrases in the notes.", difficulty: "Medium", tags: ["Lecture", "Note Taking"], usageCount: 990 },
    { id: "LS-302", title: "Dialogue intent detection", prompt: "Identify the speaker's real intention in a customer support dialogue.", difficulty: "Easy", tags: ["Intent", "Conversation"], usageCount: 1745 },
  ],
  writing: [
    { id: "WR-401", title: "Argumentative paragraph expansion", prompt: "Write a well-structured paragraph arguing whether remote education improves access to quality learning.", difficulty: "Hard", tags: ["Argumentative", "Coherence"], usageCount: 802 },
    { id: "WR-402", title: "Email tone revision", prompt: "Rewrite an informal update email so it sounds appropriate for a hiring manager.", difficulty: "Medium", tags: ["Professional Writing", "Tone"], usageCount: 1118 },
  ],
  mockTests: [
    { id: "MK-501", title: "Full-length adaptive mock test", prompt: "A 45-minute diagnostic test covering grammar, reading, listening, and writing under timed conditions.", difficulty: "Hard", tags: ["Adaptive", "Timed"], usageCount: 1528 },
    { id: "MK-502", title: "Foundation placement mock", prompt: "A beginner-friendly mock test focused on early-level grammar and comprehension skills.", difficulty: "Easy", tags: ["Placement", "Beginner"], usageCount: 932 },
  ],
};

const growthData = [{ label: "Jan", users: 8400 }, { label: "Feb", users: 9800 }, { label: "Mar", users: 11400 }, { label: "Apr", users: 13200 }, { label: "May", users: 15650 }, { label: "Jun", users: 18210 }, { label: "Jul", users: 20640 }, { label: "Aug", users: 24892 }];
const dailyActiveData = [{ label: "Mon", dau: 2240 }, { label: "Tue", dau: 2384 }, { label: "Wed", dau: 2510 }, { label: "Thu", dau: 2478 }, { label: "Fri", dau: 2692 }, { label: "Sat", dau: 2411 }, { label: "Sun", dau: 3184 }];
const completionTrendData = [{ label: "Mon", completed: 1420 }, { label: "Tue", completed: 1515 }, { label: "Wed", completed: 1650 }, { label: "Thu", completed: 1592 }, { label: "Fri", completed: 1718 }, { label: "Sat", completed: 1840 }, { label: "Sun", completed: 1946 }];
const difficultModules = [{ name: "Listening", rate: 71, note: "Misheard distractors in multi-speaker passages" }, { name: "Writing", rate: 63, note: "Weak cohesion in timed argumentative responses" }, { name: "Reading", rate: 58, note: "Inference questions in academic passages" }, { name: "Grammar", rate: 44, note: "Advanced inversion and conditionals" }];
const systemHealth = [{ label: "API uptime", value: "99.98%", progress: 99, tone: "healthy" }, { label: "DB usage", value: "71%", progress: 71, tone: "watch" }, { label: "Redis status", value: "Healthy", progress: 93, tone: "healthy" }, { label: "AI latency", value: "612 ms", progress: 61, tone: "watch" }] as const;

const growthChartConfig = { users: { label: "Users", color: "#8b5cf6" } } satisfies ChartConfig;
const dauChartConfig = { dau: { label: "DAU", color: "#c026d3" } } satisfies ChartConfig;
const completionChartConfig = { completed: { label: "Completed", color: "#818cf8" } } satisfies ChartConfig;

const roleOptions: Array<"all" | UserRole> = ["all", "Student", "Moderator", "Admin"];
const statusOptions: Array<"all" | UserStatus> = ["all", "Active", "Review", "Suspended"];
const departmentOptions: Array<"all" | Department> = ["all", "Academics", "Enterprise", "Support", "Scholarship"];
const difficultyOptions: Array<"all" | QuestionDifficulty> = ["all", "Easy", "Medium", "Hard"];
const questionTabs: Array<{ value: QuestionCategory; label: string }> = [{ value: "grammar", label: "Grammar" }, { value: "reading", label: "Reading" }, { value: "listening", label: "Listening" }, { value: "writing", label: "Writing" }, { value: "mockTests", label: "Mock Tests" }];

const statusClassMap: Record<UserStatus, string> = { Active: "border-emerald-400/25 bg-emerald-500/12 text-emerald-200", Review: "border-amber-400/25 bg-amber-500/12 text-amber-200", Suspended: "border-rose-400/25 bg-rose-500/12 text-rose-200" };
const severityClassMap: Record<Severity, string> = { Critical: "border-rose-400/25 bg-rose-500/12 text-rose-200", High: "border-orange-400/25 bg-orange-500/12 text-orange-200", Medium: "border-amber-400/25 bg-amber-500/12 text-amber-200", Low: "border-sky-400/25 bg-sky-500/12 text-sky-200" };
const difficultyClassMap: Record<QuestionDifficulty, string> = { Easy: "border-emerald-400/25 bg-emerald-500/12 text-emerald-200", Medium: "border-violet-400/25 bg-violet-500/12 text-violet-200", Hard: "border-fuchsia-400/25 bg-fuchsia-500/12 text-fuchsia-200" };

const EmptyState = ({ icon: Icon, title, description }: { icon: typeof Search; title: string; description: string }) => (
  <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-12 text-center">
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3"><Icon className="h-5 w-5 text-slate-300" /></div>
    <h3 className="mt-4 text-base font-semibold text-white">{title}</h3>
    <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-400">{description}</p>
  </div>
);

const Sparkline = ({ values, color }: { values: number[]; color: string }) => {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const points = values.map((value, index) => `${(index / Math.max(values.length - 1, 1)) * 100},${28 - ((value - min) / Math.max(max - min, 1)) * 20}`).join(" ");
  return <svg viewBox="0 0 100 32" className="h-12 w-full"><polyline fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={points} /></svg>;
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [globalSearch, setGlobalSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | UserStatus>("all");
  const [departmentFilter, setDepartmentFilter] = useState<"all" | Department>("all");
  const [questionSearch, setQuestionSearch] = useState("");
  const [questionDifficulty, setQuestionDifficulty] = useState<"all" | QuestionDifficulty>("all");
  const [activeQuestionTab, setActiveQuestionTab] = useState<QuestionCategory>("grammar");
  const [users, setUsers] = useState<UserRecord[]>(initialUsers);
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>(initialActivity);
  const [questionBank, setQuestionBank] = useState<Record<QuestionCategory, QuestionRecord[]>>(initialQuestionBank);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [viewedUser, setViewedUser] = useState<UserRecord | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<AlertRecord | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<{ category: QuestionCategory; question: QuestionRecord } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ category: QuestionCategory; question: QuestionRecord } | null>(null);
  const [questionDraft, setQuestionDraft] = useState<QuestionRecord | null>(null);
  const [addAdminOpen, setAddAdminOpen] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ fullName: "", email: "", role: "Admin" as UserRole, department: "Support" as Department });

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 900);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    setQuestionDraft(editingQuestion ? { ...editingQuestion.question } : null);
  }, [editingQuestion]);

  const normalizedGlobal = globalSearch.trim().toLowerCase();
  const normalizedUserSearch = userSearch.trim().toLowerCase();

  const filteredUsers = useMemo(() => users.filter((user) => {
    const haystack = `${user.fullName} ${user.email} ${user.level} ${user.role} ${user.department}`.toLowerCase();
    return (!normalizedGlobal || haystack.includes(normalizedGlobal)) &&
      (!normalizedUserSearch || haystack.includes(normalizedUserSearch)) &&
      (roleFilter === "all" || user.role === roleFilter) &&
      (statusFilter === "all" || user.status === statusFilter) &&
      (departmentFilter === "all" || user.department === departmentFilter);
  }), [departmentFilter, normalizedGlobal, normalizedUserSearch, roleFilter, statusFilter, users]);

  const filteredAlerts = useMemo(() => alertsData.filter((alert) => {
    const haystack = `${alert.studentName} ${alert.examName} ${alert.behavior} ${alert.summary}`.toLowerCase();
    return !normalizedGlobal || haystack.includes(normalizedGlobal);
  }), [normalizedGlobal]);

  const filteredLogs = useMemo(() => supportLogsData.filter((log) => {
    const haystack = `${log.subject} ${log.actor} ${log.status} ${log.type}`.toLowerCase();
    return !normalizedGlobal || haystack.includes(normalizedGlobal);
  }), [normalizedGlobal]);

  const filteredQuestions = useMemo(() => {
    const local = questionSearch.trim().toLowerCase();
    return questionBank[activeQuestionTab].filter((question) => {
      const haystack = `${question.title} ${question.prompt} ${question.tags.join(" ")}`.toLowerCase();
      return (!normalizedGlobal || haystack.includes(normalizedGlobal)) &&
        (!local || haystack.includes(local)) &&
        (questionDifficulty === "all" || question.difficulty === questionDifficulty);
    });
  }, [activeQuestionTab, normalizedGlobal, questionBank, questionDifficulty, questionSearch]);

  const isAllVisibleUsersSelected = filteredUsers.length > 0 && filteredUsers.every((user) => selectedUserIds.includes(user.id));
  const notificationCount = alertsData.filter((alert) => alert.severity === "Critical" || alert.severity === "High").length +
    supportLogsData.filter((log) => log.status === "Escalated").length;
  const questionCategoryCounts = questionTabs.map((tab) => ({ ...tab, count: questionBank[tab.value].length }));

  const pushActivity = (title: string, detail: string) => {
    setActivityFeed((current) => [{ id: `${Date.now()}`, title, detail, timestamp: "Just now" }, ...current].slice(0, 8));
  };

  const toggleUser = (userId: string) => {
    setSelectedUserIds((current) => current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId]);
  };

  const toggleAllVisible = () => {
    if (isAllVisibleUsersSelected) {
      setSelectedUserIds((current) => current.filter((id) => !filteredUsers.some((user) => user.id === id)));
      return;
    }
    setSelectedUserIds((current) => Array.from(new Set([...current, ...filteredUsers.map((user) => user.id)])));
  };

  const suspendSelected = () => {
    if (!selectedUserIds.length) return;
    setUsers((current) => current.map((user) => selectedUserIds.includes(user.id) ? { ...user, status: "Suspended" } : user));
    pushActivity("Bulk suspension applied", `${selectedUserIds.length} account(s) moved to suspended state.`);
    setSelectedUserIds([]);
  };

  const promoteSelected = () => {
    if (!selectedUserIds.length) return;
    setUsers((current) => current.map((user) => selectedUserIds.includes(user.id) ? { ...user, role: "Admin", department: "Support" } : user));
    pushActivity("Bulk admin promotion completed", `${selectedUserIds.length} account(s) promoted to admin access.`);
    setSelectedUserIds([]);
  };

  const exportUsersCsv = () => {
    const rows = filteredUsers.map((user) => [user.id, user.fullName, user.email, user.role, user.department, user.level, user.score, user.streak, user.status].join(","));
    const blob = new Blob([["id,name,email,role,department,level,score,streak,status", ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sandysquad-users.csv";
    link.click();
    URL.revokeObjectURL(url);
    pushActivity("User export completed", `${filteredUsers.length} rows exported to CSV.`);
  };

  const saveQuestion = () => {
    if (!editingQuestion || !questionDraft) return;
    const existing = questionBank[editingQuestion.category].some((question) => question.id === questionDraft.id);
    setQuestionBank((current) => ({
      ...current,
      [editingQuestion.category]: existing
        ? current[editingQuestion.category].map((question) => question.id === questionDraft.id ? questionDraft : question)
        : [questionDraft, ...current[editingQuestion.category]],
    }));
    pushActivity(existing ? "Question updated" : "Question added", `${questionDraft.id} saved in the ${editingQuestion.category} bank.`);
    setEditingQuestion(null);
  };

  const deleteQuestion = () => {
    if (!deleteTarget) return;
    setQuestionBank((current) => ({ ...current, [deleteTarget.category]: current[deleteTarget.category].filter((q) => q.id !== deleteTarget.question.id) }));
    pushActivity("Question removed", `${deleteTarget.question.id} was deleted from ${deleteTarget.category}.`);
    setDeleteTarget(null);
  };

  const addAdmin = () => {
    if (!newAdmin.fullName.trim() || !newAdmin.email.trim()) return;
    setUsers((current) => [{
      id: `USR-${Math.floor(Math.random() * 900 + 100)}`,
      fullName: newAdmin.fullName.trim(),
      email: newAdmin.email.trim(),
      role: newAdmin.role,
      department: newAdmin.department,
      level: "Admin",
      score: 0,
      streak: 0,
      status: "Active",
      subscription: "Staff",
      joinedAt: "Today",
      lastSeen: "Invited just now",
      modules: [{ name: "Grammar", score: 100 }, { name: "Reading", score: 100 }, { name: "Listening", score: 100 }, { name: "Writing", score: 100 }],
    }, ...current]);
    pushActivity("New admin invited", `${newAdmin.fullName.trim()} was invited with ${newAdmin.department} access.`);
    setAddAdminOpen(false);
    setNewAdmin({ fullName: "", email: "", role: "Admin", department: "Support" });
  };

  const runQuickAction = (action: "announcement" | "reset" | "reports") => {
    const detail = action === "announcement" ? "Platform announcement drafted and scheduled for 04:30 PM." : action === "reset" ? "Leaderboard reset task queued with audit logging enabled." : "Quarterly reports package prepared for download.";
    pushActivity(action === "announcement" ? "Announcement created" : action === "reset" ? "Leaderboard reset requested" : "Report export started", detail);
  };

  const openNewQuestionDialog = () => {
    const categoryPrefixMap: Record<QuestionCategory, string> = {
      grammar: "GR",
      reading: "RD",
      listening: "LS",
      writing: "WR",
      mockTests: "MK",
    };
    const nextNumber = questionBank[activeQuestionTab].length + 1;

    setEditingQuestion({
      category: activeQuestionTab,
      question: {
        id: `${categoryPrefixMap[activeQuestionTab]}-${String(nextNumber).padStart(3, "0")}`,
        title: "",
        prompt: "",
        difficulty: "Medium",
        tags: ["AI Curated"],
        usageCount: 0,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070812] px-4 py-6 md:px-6 xl:px-8">
        <div className="mx-auto max-w-[1800px] space-y-6">
          <Skeleton className="h-20 rounded-3xl bg-white/10" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">{Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-44 rounded-3xl bg-white/10" />)}</div>
          <div className="grid gap-6 xl:grid-cols-12">
            <Skeleton className="h-[520px] rounded-3xl bg-white/10 xl:col-span-5" />
            <Skeleton className="h-[520px] rounded-3xl bg-white/10 xl:col-span-4" />
            <Skeleton className="h-[520px] rounded-3xl bg-white/10 xl:col-span-3" />
          </div>
          <Skeleton className="h-[420px] rounded-3xl bg-white/10" />
          <Skeleton className="h-[520px] rounded-3xl bg-white/10" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070812] text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(99,102,241,0.18),transparent_24%),radial-gradient(circle_at_bottom,rgba(192,38,211,0.12),transparent_30%)]" />
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#090b16]/78 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1800px] flex-col gap-4 px-4 py-4 md:px-6 lg:flex-row lg:items-center lg:justify-between xl:px-8">
          <div className="flex items-center gap-3">
            <Button variant="outline" className="h-10 rounded-2xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08] hover:text-white" onClick={() => navigate("/task")}>
              <ArrowLeft className="h-4 w-4" />
              Back to App
            </Button>
            <div>
              <p className="text-[11px] uppercase tracking-[0.32em] text-violet-200/60">Sandysquad</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">Admin Console</h1>
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-3 sm:flex-row lg:max-w-3xl lg:justify-end">
            <div className="relative flex-1 lg:max-w-xl">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                aria-label="Search dashboard"
                placeholder="Search users, alerts, question bank, or logs..."
                value={globalSearch}
                onChange={(event) => setGlobalSearch(event.target.value)}
                className={cn("h-11 rounded-2xl pl-11", controlClass)}
              />
            </div>
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <Button size="icon" variant="outline" className="relative h-11 w-11 rounded-2xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]" aria-label="Notifications">
                <Bell className="h-4 w-4" />
                <span className="absolute right-2 top-2 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-fuchsia-500 px-1 text-[10px] font-semibold text-white">{notificationCount}</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-11 rounded-2xl border-white/10 bg-white/[0.04] px-3 text-slate-100 hover:bg-white/[0.08]">
                    <Avatar className="h-8 w-8 border border-white/10"><AvatarFallback className="bg-violet-500/20 text-xs font-semibold text-violet-100">SQ</AvatarFallback></Avatar>
                    <div className="hidden text-left sm:block"><div className="text-sm font-medium text-white">Sandy Admin</div><div className="text-xs text-slate-400">Platform owner</div></div>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl border-white/10 bg-[#0c1020] text-slate-100 backdrop-blur-xl">
                  <DropdownMenuLabel>Admin profile</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem className="focus:bg-white/10" onClick={() => setAddAdminOpen(true)}>Invite admin</DropdownMenuItem>
                  <DropdownMenuItem className="focus:bg-white/10" onClick={() => runQuickAction("announcement")}>Create announcement</DropdownMenuItem>
                  <DropdownMenuItem className="focus:bg-white/10" onClick={exportUsersCsv}>Export user CSV</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>
      <motion.main
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
        className="mx-auto max-w-[1800px] space-y-6 px-4 py-6 md:px-6 xl:px-8"
      >
        <motion.section variants={reveal} className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <motion.div key={stat.label} variants={reveal} whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 280, damping: 24 }}>
                <Card className={cn(glassCard, "h-full border-white/10 bg-white/[0.04]")}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardDescription className="text-slate-400">{stat.label}</CardDescription>
                        <CardTitle className="mt-3 text-3xl font-semibold tracking-tight text-white">{stat.value}</CardTitle>
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
                          <Icon className="h-5 w-5" style={{ color: stat.accent }} />
                        </div>
                        <Badge className={cn("border-white/10 bg-white/[0.04] text-xs", stat.deltaTone === "up" ? "text-emerald-200" : "text-rose-200")}>
                          {stat.delta}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Sparkline values={stat.sparkline} color={stat.accent} />
                    <div>
                      <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                        <span>Daily target</span>
                        <span>{stat.progress}%</span>
                      </div>
                      <Progress value={stat.progress} className="h-1.5 bg-white/10" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.section>
        <motion.section variants={reveal} className="grid gap-6 xl:grid-cols-12">
          <Card className={cn(glassCard, "border-white/10 bg-white/[0.035] xl:col-span-5")}>
            <CardHeader className="space-y-4">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <CardTitle className="text-white">User Management</CardTitle>
                  <CardDescription className="mt-2 text-slate-400">Review learners, moderators, and admins with real-time status controls.</CardDescription>
                </div>
                <Badge className="w-fit border-violet-400/20 bg-violet-500/10 px-3 py-1 text-violet-100">{filteredUsers.length} visible users</Badge>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <div className="relative md:col-span-2">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    aria-label="Search users"
                    value={userSearch}
                    onChange={(event) => setUserSearch(event.target.value)}
                    placeholder="Search by user, email, level, or role"
                    className={cn("h-11 rounded-2xl pl-11", controlClass)}
                  />
                </div>
                <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as "all" | UserRole)}>
                  <SelectTrigger aria-label="Filter by role" className={cn("h-11 rounded-2xl", controlClass)}>
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-[#0c1020] text-slate-100">
                    {roleOptions.map((option) => <SelectItem key={option} value={option}>{option === "all" ? "All roles" : option}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as "all" | UserStatus)}>
                  <SelectTrigger aria-label="Filter by status" className={cn("h-11 rounded-2xl", controlClass)}>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-[#0c1020] text-slate-100">
                    {statusOptions.map((option) => <SelectItem key={option} value={option}>{option === "all" ? "All statuses" : option}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={departmentFilter} onValueChange={(value) => setDepartmentFilter(value as "all" | Department)}>
                  <SelectTrigger aria-label="Filter by department" className={cn("h-11 rounded-2xl", controlClass)}>
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-[#0c1020] text-slate-100">
                    {departmentOptions.map((option) => <SelectItem key={option} value={option}>{option === "all" ? "All departments" : option}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/[0.03] p-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Bulk actions</p>
                  <p className="mt-1 text-xs text-slate-400">{selectedUserIds.length ? `${selectedUserIds.length} user(s) selected for batch updates.` : "Select rows to suspend, promote, or export filtered records."}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={suspendSelected} disabled={!selectedUserIds.length} className="h-10 rounded-2xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]">
                    <ShieldAlert className="mr-2 h-4 w-4" />
                    Suspend
                  </Button>
                  <Button variant="outline" onClick={promoteSelected} disabled={!selectedUserIds.length} className="h-10 rounded-2xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Promote to admin
                  </Button>
                  <Button variant="outline" onClick={exportUsersCsv} className="h-10 rounded-2xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]">
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                  </Button>
                </div>
              </div>
              {filteredUsers.length ? (
                <ScrollArea className="h-[470px] pr-3">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10 hover:bg-transparent">
                        <TableHead className="w-10 text-slate-400">
                          <input
                            aria-label="Select all visible users"
                            type="checkbox"
                            checked={isAllVisibleUsersSelected}
                            onChange={toggleAllVisible}
                            className="h-4 w-4 rounded border-white/20 bg-transparent accent-violet-500"
                          />
                        </TableHead>
                        <TableHead className="text-slate-400">User</TableHead>
                        <TableHead className="text-slate-400">Level</TableHead>
                        <TableHead className="text-slate-400">Score</TableHead>
                        <TableHead className="text-slate-400">Streak</TableHead>
                        <TableHead className="text-slate-400">Status</TableHead>
                        <TableHead className="w-12" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id} className="border-white/10 transition-colors hover:bg-white/[0.04]">
                          <TableCell>
                            <input
                              aria-label={`Select ${user.fullName}`}
                              type="checkbox"
                              checked={selectedUserIds.includes(user.id)}
                              onChange={() => toggleUser(user.id)}
                              className="h-4 w-4 rounded border-white/20 bg-transparent accent-violet-500"
                            />
                          </TableCell>
                          <TableCell>
                            <button type="button" className="flex items-center gap-3 text-left" onClick={() => setViewedUser(user)}>
                              <Avatar className="h-10 w-10 border border-white/10">
                                <AvatarFallback className="bg-gradient-to-br from-violet-500/30 to-fuchsia-500/20 text-xs font-semibold text-violet-100">
                                  {user.fullName.split(" ").map((part) => part[0]).join("").slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-white">{user.fullName}</div>
                                <div className="text-xs text-slate-400">{user.email}</div>
                              </div>
                            </button>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-white">{user.level}</div>
                            <div className="text-xs text-slate-400">{user.role} / {user.department}</div>
                          </TableCell>
                          <TableCell className="font-medium text-white">{user.score.toLocaleString()}</TableCell>
                          <TableCell>
                            <div className="inline-flex items-center gap-2 text-sm text-slate-200">
                              <Flame className="h-4 w-4 text-fuchsia-300" />
                              {user.streak} days
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn("border", statusClassMap[user.status])}>{user.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="outline" className="h-9 w-9 rounded-2xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48 rounded-2xl border-white/10 bg-[#0c1020] text-slate-100 backdrop-blur-xl">
                                <DropdownMenuItem className="focus:bg-white/10" onClick={() => setViewedUser(user)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View profile
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="focus:bg-white/10"
                                  onClick={() => {
                                    setUsers((current) => current.map((item) => item.id === user.id ? { ...item, status: item.status === "Suspended" ? "Active" : "Suspended" } : item));
                                    pushActivity("User status updated", `${user.fullName} was marked ${user.status === "Suspended" ? "active" : "suspended"}.`);
                                  }}
                                >
                                  <ShieldAlert className="mr-2 h-4 w-4" />
                                  {user.status === "Suspended" ? "Restore access" : "Suspend user"}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="focus:bg-white/10"
                                  onClick={() => {
                                    setUsers((current) => current.map((item) => item.id === user.id ? { ...item, role: "Admin", department: "Support" } : item));
                                    pushActivity("Admin access granted", `${user.fullName} was promoted to admin.`);
                                  }}
                                >
                                  <UserPlus className="mr-2 h-4 w-4" />
                                  Promote to admin
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              ) : (
                <EmptyState icon={Users} title="No matching users" description="Try widening the filters or clearing the search to see more learner accounts." />
              )}
            </CardContent>
          </Card>
          <div className="space-y-6 xl:col-span-4">
            <Card className={cn(glassCard, "border-white/10 bg-white/[0.035]")}>
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-white">Proctoring Alerts</CardTitle>
                    <CardDescription className="mt-2 text-slate-400">Suspicious behaviors surfaced by the monitoring pipeline.</CardDescription>
                  </div>
                  <Badge className="border-rose-400/20 bg-rose-500/10 text-rose-100">{alertsData.length} flagged</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {filteredAlerts.length ? (
                  <ScrollArea className="h-[290px] pr-3">
                    <div className="space-y-3">
                      {filteredAlerts.map((alert) => (
                        <div key={alert.id} className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:bg-white/[0.05]">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-medium text-white">{alert.behavior}</p>
                              <p className="mt-1 text-xs text-slate-400">{alert.studentName} / {alert.examName}</p>
                            </div>
                            <Badge className={cn("border", severityClassMap[alert.severity])}>{alert.severity}</Badge>
                          </div>
                          <p className="mt-3 text-sm leading-relaxed text-slate-300">{alert.summary}</p>
                          <div className="mt-4 flex items-center justify-between gap-3">
                            <div className="inline-flex items-center gap-2 text-xs text-slate-400">
                              <Clock3 className="h-3.5 w-3.5" />
                              {alert.timestamp}
                            </div>
                            <Button variant="outline" onClick={() => setSelectedAlert(alert)} className="h-9 rounded-2xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]">
                              View details
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <EmptyState icon={ShieldAlert} title="No alerts found" description="This search scope does not contain flagged proctoring events." />
                )}
              </CardContent>
            </Card>
            <Card className={cn(glassCard, "border-white/10 bg-white/[0.035]")}>
              <CardHeader>
                <CardTitle className="text-white">Recent AI Moderation & Support Logs</CardTitle>
                <CardDescription className="mt-2 text-slate-400">Operational traces from learner support and automated moderation workflows.</CardDescription>
              </CardHeader>
              <CardContent>
                {filteredLogs.length ? (
                  <ScrollArea className="h-[280px] pr-3">
                    <div className="space-y-3">
                      {filteredLogs.map((log) => (
                        <div key={log.id} className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:bg-white/[0.05]">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge className="border-white/10 bg-white/[0.06] text-slate-100">{log.type}</Badge>
                                <span className="text-xs text-slate-400">{log.model}</span>
                              </div>
                              <p className="mt-3 font-medium text-white">{log.subject}</p>
                            </div>
                            <Badge className={cn("border", log.status === "Resolved" ? "border-emerald-400/25 bg-emerald-500/12 text-emerald-200" : log.status === "Escalated" ? "border-rose-400/25 bg-rose-500/12 text-rose-200" : "border-amber-400/25 bg-amber-500/12 text-amber-200")}>
                              {log.status}
                            </Badge>
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                            <span>{log.actor}</span>
                            <span>{log.latencyMs} ms</span>
                            <span>{log.timestamp}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <EmptyState icon={Bot} title="No AI logs match" description="Change the search term to inspect moderation and support records." />
                )}
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6 xl:col-span-3">
            <Card className={cn(glassCard, "border-white/10 bg-white/[0.035]")}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3">
                    <Server className="h-5 w-5 text-violet-200" />
                  </div>
                  <div>
                    <CardTitle className="text-white">System Health</CardTitle>
                    <CardDescription className="mt-1 text-slate-400">Core services and AI runtime telemetry.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {systemHealth.map((item) => (
                  <div key={item.label} className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-2">
                          {item.label === "API uptime" ? <Wifi className="h-4 w-4 text-emerald-200" /> : item.label === "DB usage" ? <Activity className="h-4 w-4 text-indigo-200" /> : item.label === "Redis status" ? <CheckCircle2 className="h-4 w-4 text-emerald-200" /> : <Bot className="h-4 w-4 text-fuchsia-200" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{item.label}</p>
                          <p className="text-xs text-slate-400">{item.value}</p>
                        </div>
                      </div>
                      <Badge className={cn("border", item.tone === "healthy" ? "border-emerald-400/25 bg-emerald-500/12 text-emerald-200" : "border-amber-400/25 bg-amber-500/12 text-amber-200")}>
                        {item.tone === "healthy" ? "Healthy" : "Monitor"}
                      </Badge>
                    </div>
                    <Progress value={item.progress} className="mt-4 h-1.5 bg-white/10" />
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className={cn(glassCard, "border-white/10 bg-white/[0.035]")}>
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
                <CardDescription className="mt-2 text-slate-400">Fast admin shortcuts for routine operations.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <Button onClick={() => setAddAdminOpen(true)} className="h-11 justify-start rounded-2xl bg-[linear-gradient(135deg,rgba(139,92,246,0.35),rgba(192,38,211,0.28))] text-white shadow-lg shadow-violet-950/30 hover:opacity-95">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Admin
                </Button>
                <Button variant="outline" onClick={() => runQuickAction("announcement")} className="h-11 justify-start rounded-2xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]">
                  <Megaphone className="mr-2 h-4 w-4" />
                  Create Announcement
                </Button>
                <Button variant="outline" onClick={() => runQuickAction("reset")} className="h-11 justify-start rounded-2xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset Leaderboard
                </Button>
                <Button variant="outline" onClick={() => runQuickAction("reports")} className="h-11 justify-start rounded-2xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]">
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Export Reports
                </Button>
              </CardContent>
            </Card>
            <Card className={cn(glassCard, "border-white/10 bg-white/[0.035]")}>
              <CardHeader>
                <CardTitle className="text-white">Recent Activity</CardTitle>
                <CardDescription className="mt-2 text-slate-400">Audit-friendly feed of admin and system events.</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[280px] pr-3">
                  <div className="space-y-4">
                    {activityFeed.map((item) => (
                      <div key={item.id} className="flex gap-3 rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                        <div className="mt-1 rounded-full bg-violet-500/20 p-1.5">
                          <Clock3 className="h-3.5 w-3.5 text-violet-100" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{item.title}</p>
                          <p className="mt-1 text-sm leading-relaxed text-slate-300">{item.detail}</p>
                          <p className="mt-2 text-xs text-slate-400">{item.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </motion.section>
        <motion.section variants={reveal}>
          <Card className={cn(glassCard, "border-white/10 bg-white/[0.035]")}>
            <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="text-white">Question Bank Management</CardTitle>
                <CardDescription className="mt-2 text-slate-400">Manage the AI-powered assessment inventory across grammar, reading, listening, writing, and adaptive mocks.</CardDescription>
              </div>
              <Button onClick={openNewQuestionDialog} className="h-11 rounded-2xl bg-[linear-gradient(135deg,rgba(139,92,246,0.35),rgba(192,38,211,0.28))] px-5 text-white shadow-lg shadow-violet-950/30 hover:opacity-95">
                <Plus className="mr-2 h-4 w-4" />
                Add New Question
              </Button>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    aria-label="Search question bank"
                    value={questionSearch}
                    onChange={(event) => setQuestionSearch(event.target.value)}
                    placeholder="Search titles, prompts, or tags"
                    className={cn("h-11 rounded-2xl pl-11", controlClass)}
                  />
                </div>
                <Select value={questionDifficulty} onValueChange={(value) => setQuestionDifficulty(value as "all" | QuestionDifficulty)}>
                  <SelectTrigger aria-label="Filter by difficulty" className={cn("h-11 rounded-2xl", controlClass)}>
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-[#0c1020] text-slate-100">
                    {difficultyOptions.map((option) => <SelectItem key={option} value={option}>{option === "all" ? "All difficulties" : option}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Tabs value={activeQuestionTab} onValueChange={(value) => setActiveQuestionTab(value as QuestionCategory)} className="space-y-5">
                <TabsList className="grid h-auto w-full grid-cols-2 gap-2 rounded-2xl bg-white/[0.04] p-1 md:grid-cols-5">
                  {questionCategoryCounts.map((tab) => (
                    <TabsTrigger key={tab.value} value={tab.value} className="rounded-2xl px-3 py-3 text-slate-300 data-[state=active]:bg-white/[0.08] data-[state=active]:text-white">
                      <span className="truncate">{tab.label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
                <div className="flex flex-wrap gap-2">
                  {questionCategoryCounts.map((tab) => (
                    <Badge key={tab.value} className={cn("border-white/10 bg-white/[0.04] px-3 py-1 text-slate-200", activeQuestionTab === tab.value && "border-violet-400/25 bg-violet-500/12 text-violet-100")}>
                      {tab.label}: {tab.count}
                    </Badge>
                  ))}
                </div>
                <TabsContent value={activeQuestionTab} className="mt-0">
                  {filteredQuestions.length ? (
                    <div className="grid gap-4 lg:grid-cols-2">
                      {filteredQuestions.map((question) => (
                        <motion.div key={question.id} whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 280, damping: 24 }}>
                          <Card className="h-full rounded-3xl border border-white/10 bg-white/[0.03] shadow-none transition-colors hover:bg-white/[0.05]">
                            <CardHeader className="space-y-4">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <Badge className={cn("border", difficultyClassMap[question.difficulty])}>{question.difficulty}</Badge>
                                  <CardTitle className="mt-3 text-lg text-white">{question.title}</CardTitle>
                                </div>
                                <Badge className="border-white/10 bg-white/[0.04] text-slate-100">{question.id}</Badge>
                              </div>
                              <CardDescription className="leading-relaxed text-slate-300">{question.prompt}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="flex flex-wrap gap-2">
                                {question.tags.map((tag) => <Badge key={`${question.id}-${tag}`} className="border-white/10 bg-white/[0.05] text-slate-200">{tag}</Badge>)}
                              </div>
                              <div className="flex items-center justify-between text-sm text-slate-400">
                                <span>Used {question.usageCount.toLocaleString()} times</span>
                                <div className="flex gap-2">
                                  <Button variant="outline" onClick={() => setEditingQuestion({ category: activeQuestionTab, question })} className="h-9 rounded-2xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]">
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                  </Button>
                                  <Button variant="outline" onClick={() => setDeleteTarget({ category: activeQuestionTab, question })} className="h-9 rounded-2xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState icon={Search} title="No questions found" description="Try clearing the filters or add a new question to this category." />
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.section>
        <motion.section variants={reveal} className="grid gap-6 xl:grid-cols-12">
          <Card className={cn(glassCard, "border-white/10 bg-white/[0.035] xl:col-span-5")}>
            <CardHeader>
              <CardTitle className="text-white">User Growth</CardTitle>
              <CardDescription className="mt-2 text-slate-400">Platform-wide member growth over the last eight months.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={growthChartConfig} className="h-[260px] w-full !aspect-auto">
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-users)" stopOpacity={0.55} />
                      <stop offset="95%" stopColor="var(--color-users)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent className="border-white/10 bg-[#0b1020] text-slate-100" />} />
                  <Area type="monotone" dataKey="users" stroke="var(--color-users)" fill="url(#growthFill)" strokeWidth={3} />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card className={cn(glassCard, "border-white/10 bg-white/[0.035] xl:col-span-4")}>
            <CardHeader>
              <CardTitle className="text-white">Daily Active Users</CardTitle>
              <CardDescription className="mt-2 text-slate-400">Weekly engagement trend across all learning surfaces.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={dauChartConfig} className="h-[260px] w-full !aspect-auto">
                <LineChart data={dailyActiveData}>
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent className="border-white/10 bg-[#0b1020] text-slate-100" />} />
                  <Line type="monotone" dataKey="dau" stroke="var(--color-dau)" strokeWidth={3} dot={false} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card className={cn(glassCard, "border-white/10 bg-white/[0.035] xl:col-span-3")}>
            <CardHeader>
              <CardTitle className="text-white">Test Completion Trend</CardTitle>
              <CardDescription className="mt-2 text-slate-400">Completed attempts during the last seven days.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={completionChartConfig} className="h-[260px] w-full !aspect-auto">
                <BarChart data={completionTrendData}>
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent className="border-white/10 bg-[#0b1020] text-slate-100" />} />
                  <Bar dataKey="completed" fill="var(--color-completed)" radius={[12, 12, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card className={cn(glassCard, "border-white/10 bg-white/[0.035] xl:col-span-7")}>
            <CardHeader>
              <CardTitle className="text-white">Most Difficult Modules</CardTitle>
              <CardDescription className="mt-2 text-slate-400">Areas where learners need extra AI support and coach interventions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {difficultModules.map((module, index) => (
                <div key={module.name} className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white">{module.name}</p>
                        {index === 0 ? <Badge className="border-fuchsia-400/25 bg-fuchsia-500/12 text-fuchsia-100">Highest friction</Badge> : null}
                      </div>
                      <p className="mt-1 text-sm text-slate-400">{module.note}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-semibold text-white">{module.rate}%</p>
                      <p className="text-xs text-slate-400">difficulty index</p>
                    </div>
                  </div>
                  <Progress value={module.rate} className="mt-4 h-1.5 bg-white/10" />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className={cn(glassCard, "border-white/10 bg-white/[0.035] xl:col-span-5")}>
            <CardHeader>
              <CardTitle className="text-white">Leaderboard Engagement</CardTitle>
              <CardDescription className="mt-2 text-slate-400">How competitive habits are driving retention and returning sessions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Weekly challengers</p>
                  <p className="mt-3 text-2xl font-semibold text-white">1,482</p>
                  <p className="mt-1 text-xs text-emerald-300">+14% vs last week</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Average streak</p>
                  <p className="mt-3 text-2xl font-semibold text-white">19.4</p>
                  <p className="mt-1 text-xs text-violet-200">days among top 500</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Social share rate</p>
                  <p className="mt-3 text-2xl font-semibold text-white">32%</p>
                  <p className="mt-1 text-xs text-fuchsia-200">challenge recap cards</p>
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-white">Retention influence</p>
                    <p className="mt-1 text-sm text-slate-400">Leaderboard participants are 2.3x more likely to return within 24 hours.</p>
                  </div>
                  <Badge className="border-emerald-400/25 bg-emerald-500/12 text-emerald-200">Healthy loop</Badge>
                </div>
                <div className="mt-5 space-y-4">
                  <div>
                    <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                      <span>Challenge opt-in rate</span>
                      <span>74%</span>
                    </div>
                    <Progress value={74} className="h-1.5 bg-white/10" />
                  </div>
                  <div>
                    <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                      <span>Reward redemption rate</span>
                      <span>59%</span>
                    </div>
                    <Progress value={59} className="h-1.5 bg-white/10" />
                  </div>
                  <div>
                    <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                      <span>Re-engagement after nudge</span>
                      <span>81%</span>
                    </div>
                    <Progress value={81} className="h-1.5 bg-white/10" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </motion.main>

      <Dialog open={!!viewedUser} onOpenChange={(open) => !open && setViewedUser(null)}>
        <DialogContent className="border-white/10 bg-[#0b1020] text-slate-100 sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">User Profile</DialogTitle>
            <DialogDescription className="text-slate-400">Detailed learner or operator view with status, performance, and account metadata.</DialogDescription>
          </DialogHeader>
          {viewedUser ? (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border border-white/10">
                    <AvatarFallback className="bg-gradient-to-br from-violet-500/30 to-fuchsia-500/20 text-lg font-semibold text-violet-100">
                      {viewedUser.fullName.split(" ").map((part) => part[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xl font-semibold text-white">{viewedUser.fullName}</p>
                    <div className="mt-2 inline-flex items-center gap-2 text-sm text-slate-400">
                      <Mail className="h-4 w-4" />
                      {viewedUser.email}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge className="border-white/10 bg-white/[0.05] text-slate-100">{viewedUser.role}</Badge>
                      <Badge className="border-white/10 bg-white/[0.05] text-slate-100">{viewedUser.department}</Badge>
                      <Badge className={cn("border", statusClassMap[viewedUser.status])}>{viewedUser.status}</Badge>
                    </div>
                  </div>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300">
                  <p>{viewedUser.subscription}</p>
                  <p className="mt-1 text-xs text-slate-400">Joined {viewedUser.joinedAt}</p>
                  <p className="mt-1 text-xs text-slate-400">Last seen {viewedUser.lastSeen}</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Level</p>
                  <p className="mt-3 text-lg font-semibold text-white">{viewedUser.level}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Score</p>
                  <p className="mt-3 text-lg font-semibold text-white">{viewedUser.score.toLocaleString()}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Streak</p>
                  <p className="mt-3 text-lg font-semibold text-white">{viewedUser.streak} days</p>
                </div>
              </div>
              <div className="space-y-3 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <div>
                  <p className="font-medium text-white">Module performance</p>
                  <p className="mt-1 text-sm text-slate-400">Recent scores used by Sandysquad's AI coach and adaptive engine.</p>
                </div>
                {viewedUser.modules.map((module) => (
                  <div key={module.name}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-slate-300">{module.name}</span>
                      <span className="text-white">{module.score}%</span>
                    </div>
                    <Progress value={module.score} className="h-1.5 bg-white/10" />
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingQuestion} onOpenChange={(open) => !open && setEditingQuestion(null)}>
        <DialogContent className="border-white/10 bg-[#0b1020] text-slate-100 sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">{editingQuestion && questionBank[editingQuestion.category].some((question) => question.id === editingQuestion.question.id) ? "Edit Question" : "Add Question"}</DialogTitle>
            <DialogDescription className="text-slate-400">Update metadata, prompt text, and difficulty before publishing it to the live bank.</DialogDescription>
          </DialogHeader>
          {questionDraft ? (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="question-id" className="text-sm font-medium text-slate-200">Question ID</label>
                  <Input id="question-id" value={questionDraft.id} readOnly className={cn("h-11 rounded-2xl", controlClass, "opacity-80")} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="question-difficulty" className="text-sm font-medium text-slate-200">Difficulty</label>
                  <Select value={questionDraft.difficulty} onValueChange={(value) => setQuestionDraft((current) => current ? { ...current, difficulty: value as QuestionDifficulty } : current)}>
                    <SelectTrigger id="question-difficulty" className={cn("h-11 rounded-2xl", controlClass)}>
                      <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent className="border-white/10 bg-[#0c1020] text-slate-100">
                      {difficultyOptions.filter((option) => option !== "all").map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="question-title" className="text-sm font-medium text-slate-200">Title</label>
                <Input id="question-title" value={questionDraft.title} onChange={(event) => setQuestionDraft((current) => current ? { ...current, title: event.target.value } : current)} className={cn("h-11 rounded-2xl", controlClass)} />
              </div>
              <div className="space-y-2">
                <label htmlFor="question-prompt" className="text-sm font-medium text-slate-200">Prompt</label>
                <textarea
                  id="question-prompt"
                  value={questionDraft.prompt}
                  onChange={(event) => setQuestionDraft((current) => current ? { ...current, prompt: event.target.value } : current)}
                  className={cn("min-h-[140px] w-full rounded-2xl border px-4 py-3 text-sm", controlClass)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="question-tags" className="text-sm font-medium text-slate-200">Tags</label>
                <Input
                  id="question-tags"
                  value={questionDraft.tags.join(", ")}
                  onChange={(event) => setQuestionDraft((current) => current ? { ...current, tags: event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean) } : current)}
                  placeholder="Grammar, Tone, Business English"
                  className={cn("h-11 rounded-2xl", controlClass)}
                />
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingQuestion(null)} className="h-11 rounded-2xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]">Cancel</Button>
            <Button onClick={saveQuestion} className="h-11 rounded-2xl bg-[linear-gradient(135deg,rgba(139,92,246,0.35),rgba(192,38,211,0.28))] text-white hover:opacity-95">Save Question</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="border-white/10 bg-[#0b1020] text-slate-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <AlertTriangle className="h-5 w-5 text-rose-300" />
              Confirm Delete
            </DialogTitle>
            <DialogDescription className="text-slate-400">This will permanently remove the selected question from the active bank.</DialogDescription>
          </DialogHeader>
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">
            {deleteTarget ? `${deleteTarget.question.id} - ${deleteTarget.question.title}` : "No question selected."}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} className="h-11 rounded-2xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]">Cancel</Button>
            <Button onClick={deleteQuestion} className="h-11 rounded-2xl bg-rose-600 text-white hover:bg-rose-500">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={addAdminOpen} onOpenChange={setAddAdminOpen}>
        <DialogContent className="border-white/10 bg-[#0b1020] text-slate-100 sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-white">Add Admin</DialogTitle>
            <DialogDescription className="text-slate-400">Invite a new Sandysquad operator with elevated dashboard access and audit visibility.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="admin-name" className="text-sm font-medium text-slate-200">Full name</label>
                <Input id="admin-name" value={newAdmin.fullName} onChange={(event) => setNewAdmin((current) => ({ ...current, fullName: event.target.value }))} className={cn("h-11 rounded-2xl", controlClass)} />
              </div>
              <div className="space-y-2">
                <label htmlFor="admin-email" className="text-sm font-medium text-slate-200">Work email</label>
                <Input id="admin-email" value={newAdmin.email} onChange={(event) => setNewAdmin((current) => ({ ...current, email: event.target.value }))} className={cn("h-11 rounded-2xl", controlClass)} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="admin-role" className="text-sm font-medium text-slate-200">Role</label>
                <Select value={newAdmin.role} onValueChange={(value) => setNewAdmin((current) => ({ ...current, role: value as UserRole }))}>
                  <SelectTrigger id="admin-role" className={cn("h-11 rounded-2xl", controlClass)}>
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-[#0c1020] text-slate-100">
                    {roleOptions.filter((option) => option !== "all" && option !== "Student").map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="admin-department" className="text-sm font-medium text-slate-200">Department</label>
                <Select value={newAdmin.department} onValueChange={(value) => setNewAdmin((current) => ({ ...current, department: value as Department }))}>
                  <SelectTrigger id="admin-department" className={cn("h-11 rounded-2xl", controlClass)}>
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-[#0c1020] text-slate-100">
                    {departmentOptions.filter((option) => option !== "all").map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">
              The invitation includes admin dashboard access, support log visibility, and question bank management permissions.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddAdminOpen(false)} className="h-11 rounded-2xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]">Cancel</Button>
            <Button onClick={addAdmin} className="h-11 rounded-2xl bg-[linear-gradient(135deg,rgba(139,92,246,0.35),rgba(192,38,211,0.28))] text-white hover:opacity-95">Send Invite</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Drawer open={!!selectedAlert} onOpenChange={(open) => !open && setSelectedAlert(null)}>
        <DrawerContent className="border-white/10 bg-[#0b1020] text-slate-100 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:mt-0 sm:max-w-2xl sm:rounded-3xl">
          <DrawerHeader className="border-b border-white/10">
            <DrawerTitle className="text-white">Alert Details</DrawerTitle>
            <DrawerDescription className="text-slate-400">Review the suspicious event, severity, and evidence extracted by the proctoring system.</DrawerDescription>
          </DrawerHeader>
          {selectedAlert ? (
            <div className="space-y-5 p-4">
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-white">{selectedAlert.behavior}</p>
                    <p className="mt-2 text-sm text-slate-400">{selectedAlert.studentName} / {selectedAlert.examName}</p>
                  </div>
                  <Badge className={cn("border", severityClassMap[selectedAlert.severity])}>{selectedAlert.severity}</Badge>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-300">{selectedAlert.summary}</p>
                <div className="mt-4 inline-flex items-center gap-2 text-xs text-slate-400">
                  <Clock3 className="h-3.5 w-3.5" />
                  Triggered {selectedAlert.timestamp}
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <p className="font-medium text-white">Evidence summary</p>
                <div className="mt-4 space-y-3">
                  {selectedAlert.evidence.map((item) => (
                    <div key={item} className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-3 text-sm text-slate-300">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
          <DrawerFooter className="border-t border-white/10">
            <Button
              variant="outline"
              onClick={() => {
                const matchedUser = users.find((user) => user.fullName === selectedAlert?.studentName);
                if (matchedUser) {
                  setViewedUser(matchedUser);
                }
                setSelectedAlert(null);
              }}
              className="h-11 rounded-2xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]"
            >
              View user profile
            </Button>
            <Button onClick={() => setSelectedAlert(null)} className="h-11 rounded-2xl bg-[linear-gradient(135deg,rgba(139,92,246,0.35),rgba(192,38,211,0.28))] text-white hover:opacity-95">
              Close
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default AdminDashboard;
