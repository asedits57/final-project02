import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, MailX, ShieldCheck, ShieldX } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import AnimatedBackground from "@components/shared/AnimatedBackground";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import { apiService as api } from "@services/apiService";

type InviteDecisionState =
  | { status: "loading" }
  | {
      status: "ready";
      action: "accept" | "decline";
      email: string;
      message: string;
      userExists: boolean;
      roleGrantedNow: boolean;
      loginUrl: string;
      signupUrl: string;
    }
  | {
      status: "error";
      message: string;
    };

export default function AdminInviteResponsePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<InviteDecisionState>({ status: "loading" });

  const token = searchParams.get("token")?.trim() || "";
  const action = searchParams.get("action") === "decline" ? "decline" : "accept";

  useEffect(() => {
    let active = true;

    const run = async () => {
      if (!token) {
        setState({ status: "error", message: "The invitation link is missing or invalid." });
        return;
      }

      try {
        const response = await api.respondToAdminInvite(token, action);

        if (!active) {
          return;
        }

        setState({
          status: "ready",
          action,
          email: response.data.email,
          message: response.data.message,
          userExists: response.data.userExists,
          roleGrantedNow: response.data.roleGrantedNow,
          loginUrl: response.data.loginUrl,
          signupUrl: response.data.signupUrl,
        });
      } catch (error) {
        if (!active) {
          return;
        }

        setState({
          status: "error",
          message: error instanceof Error ? error.message : "Could not process this invitation.",
        });
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, [action, token]);

  const summary = useMemo(() => {
    if (state.status !== "ready") {
      return null;
    }

    if (state.action === "decline") {
      return {
        title: "Invitation Declined",
        icon: ShieldX,
        tone: "text-rose-200",
        badge: "No admin access granted",
      };
    }

    return {
      title: state.roleGrantedNow ? "Admin Access Activated" : "Invitation Accepted",
      icon: ShieldCheck,
      tone: "text-emerald-200",
      badge: state.roleGrantedNow ? "Admin role active now" : "Complete sign in to activate",
    };
  }, [state]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070812] text-slate-100">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -left-28 top-[-8rem] h-[30rem] w-[30rem] rounded-full bg-violet-500/15 blur-3xl" />
        <div className="absolute bottom-[-10rem] right-[-8rem] h-[26rem] w-[26rem] rounded-full bg-fuchsia-500/10 blur-3xl" />
      </div>
      <AnimatedBackground />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4 py-10 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full"
        >
          <Card className="rounded-[2rem] border border-white/10 bg-[rgba(10,12,25,0.88)] shadow-[0_20px_80px_rgba(2,6,23,0.45)] backdrop-blur-2xl">
            <CardHeader className="items-center text-center">
              {state.status === "loading" ? (
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
                  <Loader2 className="h-6 w-6 animate-spin text-violet-200" />
                </div>
              ) : state.status === "error" ? (
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-400/20 bg-rose-500/10">
                  <MailX className="h-6 w-6 text-rose-200" />
                </div>
              ) : summary ? (
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
                  <summary.icon className={`h-6 w-6 ${summary.tone}`} />
                </div>
              ) : null}

              <CardTitle className="mt-4 text-2xl text-white">
                {state.status === "loading"
                  ? "Processing Invitation"
                  : state.status === "error"
                    ? "Invitation Unavailable"
                    : summary?.title}
              </CardTitle>
              <CardDescription className="max-w-xl text-slate-400">
                {state.status === "loading"
                  ? "Please wait while we process your admin invitation."
                  : state.status === "error"
                    ? state.message
                    : state.message}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {state.status === "ready" && summary ? (
                <>
                  <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs uppercase tracking-[0.16em] text-slate-200">
                        {summary.badge}
                      </span>
                      <span className="rounded-full border border-violet-300/14 bg-violet-500/10 px-3 py-1 text-xs text-violet-100">
                        {state.email}
                      </span>
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-slate-300/76">
                      {state.action === "accept"
                        ? state.roleGrantedNow
                          ? "You can go straight to sign in with this email and open the admin console."
                          : "Use the same invited email address when you sign up or sign in so the approved invitation can activate admin access."
                        : "This invitation has been cancelled for this email address. No admin access was applied."}
                    </p>
                  </div>

                  {state.action === "accept" ? (
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Button
                        className="h-12 flex-1 rounded-2xl bg-violet-600 text-white hover:bg-violet-500"
                        onClick={() => navigate(`/login?email=${encodeURIComponent(state.email)}`)}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Continue to Sign In
                      </Button>
                      <Button
                        variant="outline"
                        className="h-12 flex-1 rounded-2xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]"
                        onClick={() => navigate(`/login?email=${encodeURIComponent(state.email)}&mode=signup`)}
                      >
                        Create Account
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="h-12 w-full rounded-2xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]"
                      onClick={() => navigate("/login")}
                    >
                      Back to Login
                    </Button>
                  )}
                </>
              ) : state.status === "error" ? (
                <Button
                  variant="outline"
                  className="h-12 w-full rounded-2xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]"
                  onClick={() => navigate("/login")}
                >
                  Open Login
                </Button>
              ) : null}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
