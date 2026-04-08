import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Loader2 } from "lucide-react";
import { apiService as api } from "@services/apiService";
import { useToast } from "@hooks/use-toast";
import { Skeleton } from "@components/ui/skeleton";

interface GrammarIssue {
  issue: string;
  suggestion: string;
}

const GrammarCard = () => {
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [issues, setIssues] = useState<GrammarIssue[]>([]);
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const res = await api.askAI(
        `Check the grammar of the following text and return a JSON array of objects with "issue" and "suggestion" fields. Only return the JSON array, nothing else.\n\nText: "${input.trim()}"`
      );
      let parsed;
      try {
        parsed = JSON.parse(res.reply);
      } catch (e) {
        parsed = [];
      }
      setIssues(Array.isArray(parsed) ? parsed : []);
      setChecked(true);
    } catch (error: any) {
      console.error("Grammar check error:", error);
      toast({
        title: "Check Failed",
        description: "The AI evaluator is briefly unavailable. Please try again.",
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
      className="glass-card p-6 flex flex-col gap-4 h-full relative group transition-colors hover:border-violet-500/50"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none" />
      <div className="flex items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
          <CheckCircle className="w-5 h-5 text-violet-bright" />
        </div>
        <h2 className="font-display text-xl font-semibold glow-text text-center">Grammar Check</h2>
      </div>

      <textarea
        className="glass-input min-h-[100px] flex-1 resize-none"
        placeholder="Paste your text to check grammar..."
        value={input}
        onChange={(e) => { setInput(e.target.value); setChecked(false); }}
      />

      {loading && (
        <div className="space-y-3 py-4 px-4 bg-white/5 rounded-2xl border border-white/10">
          <Skeleton className="h-3 w-full bg-white/10" />
          <Skeleton className="h-3 w-2/3 bg-white/10" />
          <Skeleton className="h-3 w-4/5 bg-white/10" />
        </div>
      )}

      {checked && !loading && (
        <motion.div className="flex flex-col gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {issues.length > 0 ? issues.map((item, i) => (
            <div key={i} className="output-area flex flex-col gap-1 text-xs">
              <span className="text-destructive">⚠ {item.issue}</span>
              <span className="text-accent">💡 {item.suggestion}</span>
            </div>
          )) : (
            <div className="output-area text-xs text-center">✅ No grammar issues found!</div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default GrammarCard;
