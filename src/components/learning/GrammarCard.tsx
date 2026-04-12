import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Loader2 } from "lucide-react";

import { Skeleton } from "@components/ui/skeleton";
import { useToast } from "@hooks/use-toast";
import { apiService as api } from "@services/apiService";
import type { GrammarIssue } from "@services/aiService";

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error && error.message.trim() ? error.message : fallback;

const GrammarCard = () => {
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [issues, setIssues] = useState<GrammarIssue[]>([]);
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    if (!input.trim()) {
      return;
    }

    setLoading(true);
    try {
      const parsed = await api.checkGrammar(input);
      setIssues(Array.isArray(parsed) ? parsed : []);
      setChecked(true);
    } catch (error: unknown) {
      console.error("Grammar check error:", error);
      toast({
        title: "Check failed",
        description: getErrorMessage(error, "The AI evaluator is briefly unavailable. Please try again."),
        variant: "destructive",
      });
      setIssues([]);
      setChecked(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="glass-card group relative flex h-full flex-col gap-3.5 p-5 transition-colors hover:border-cyan-300/40"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-400/6 to-orange-400/6 opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="flex items-center justify-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20">
          <CheckCircle className="h-5 w-5 text-cyan-100" />
        </div>
        <h2 className="text-center font-display text-lg font-semibold glow-text">Grammar review</h2>
      </div>

      <textarea
        className="glass-input min-h-[88px] flex-1 resize-none"
        placeholder="Paste your text to review grammar and phrasing..."
        value={input}
        onChange={(event) => {
          setInput(event.target.value);
          setChecked(false);
        }}
      />

      <button
        type="button"
        className="violet-button flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
        onClick={handleCheck}
        disabled={loading || !input.trim()}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Reviewing...
          </>
        ) : (
          "Review grammar"
        )}
      </button>

      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 px-3.5 py-3.5">
          <div className="space-y-3">
            <Skeleton className="h-3 w-full bg-white/10" />
            <Skeleton className="h-3 w-2/3 bg-white/10" />
            <Skeleton className="h-3 w-4/5 bg-white/10" />
          </div>
        </div>
      ) : null}

      {checked && !loading ? (
        <motion.div className="flex flex-col gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {issues.length > 0 ? (
            issues.map((item, index) => (
              <div key={index} className="output-area flex flex-col gap-1 text-xs">
                <span className="text-red-300">Issue: {item.issue}</span>
                <span className="text-cyan-100">Suggestion: {item.suggestion}</span>
              </div>
            ))
          ) : (
            <div className="output-area text-center text-xs">No grammar issues found.</div>
          )}
        </motion.div>
      ) : null}
    </motion.div>
  );
};

export default GrammarCard;
