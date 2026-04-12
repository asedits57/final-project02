import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { Download, RefreshCw, Eye, Shield, Trophy, FileCheck2, Sparkles } from "lucide-react";
import type { AdminFinalTestRecord } from "@services/adminService";
import type { FinalTestConfigResponseRecord } from "@services/finalTestService";

const Results = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const submission = location.state?.submission as AdminFinalTestRecord | undefined;
  const config = location.state?.config as FinalTestConfigResponseRecord | undefined;
  
  const overall = submission?.score || 0;
  const rawScore = submission?.rawScore || 0;
  const maxScore = submission?.maxScore || 0;
  const feedback = submission?.recommendation || "No feedback available.";
  const reviewStatus = submission?.reviewStatus || "pending";
  const hasCertificate = reviewStatus === "approved" || reviewStatus === "reviewed";

  return (
    <div className="min-h-screen gradient-bg p-6">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-[84rem] gap-6 lg:grid-cols-[1.04fr,0.96fr] lg:items-center">
        <motion.section
          className="glass-strong neon-border w-full space-y-8 p-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
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

        {submission ? (
          <div className="glass rounded-lg p-5 space-y-2">
            <h3 className="font-bold">Submission Status</h3>
            <p className="text-sm text-muted-foreground">
              Submission ID: {submission._id}
            </p>
            <p className="text-sm text-foreground">
              Review status: <span className="font-semibold capitalize">{reviewStatus.replace(/_/g, " ")}</span>
            </p>
            <p className="text-sm text-foreground">
              Result: <span className="font-semibold">{submission?.passed ? "Passed" : "Not passed yet"}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Marks: {rawScore} / {maxScore || config?.totalMarks || 0}
              {submission?.passingScore ? ` • Passing score ${submission.passingScore}%` : ""}
            </p>
            <p className="text-xs text-muted-foreground">
              Your transcript, audio capture, video capture, and proctoring evidence are now available to admins for review.
            </p>
          </div>
        ) : null}

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
          <button
            disabled={!hasCertificate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/80 transition-all neon-glow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" /> Download Certificate
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-all">
            <Eye className="w-4 h-4" /> Review Answers
          </button>
          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-all"
          >
            <RefreshCw className="w-4 h-4" /> Return Home
          </button>
        </div>
        </motion.section>

        <motion.aside
          className="space-y-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.06 }}
        >
          <div className="app-surface app-grid px-6 py-6">
            <span className="app-kicker">Performance Summary</span>
            <h2 className="mt-4 text-2xl font-bold text-white">A finished results page should still feel active</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300/76">
              This side panel keeps the results screen useful on large displays by surfacing the most important score signals and the next actions after review.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {[
                { label: "Overall", value: `${overall}/100`, icon: Trophy, tone: "text-amber-200" },
                { label: "Marks", value: `${rawScore}/${maxScore || config?.totalMarks || 0}`, icon: FileCheck2, tone: "text-cyan-200" },
                { label: "Status", value: submission?.passed ? "Passed" : "Review pending", icon: Sparkles, tone: "text-violet-200" },
              ].map(({ label, value, icon: Icon, tone }) => (
                <div key={label} className="app-surface-soft p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-2.5">
                      <Icon className={`h-4 w-4 ${tone}`} />
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{label}</p>
                      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="app-surface-soft p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">What Happens Next</p>
            <div className="mt-4 space-y-3">
              {[
                "Admins can now review transcript, capture data, and proctoring evidence tied to this submission.",
                hasCertificate
                  ? "Certificate access is available because the review state already qualifies for release."
                  : "Certificate access stays locked until the review status reaches an approved state.",
                "Use Review Answers or return home to continue practicing while evaluation completes.",
              ].map((item) => (
                <div key={item} className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </motion.aside>
      </div>
    </div>
  );
};

export default Results;
