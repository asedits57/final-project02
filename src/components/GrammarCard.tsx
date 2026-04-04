import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Loader2 } from "lucide-react";
import { api } from "../services/api";

interface GrammarIssue {
  issue: string;
  suggestion: string;
}

const GrammarCard = () => {
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
    } catch (error) {
      console.error("Grammar check error:", error);
      setIssues([]);
      setChecked(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="glass-card p-6 flex flex-col gap-4 h-full"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
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

      <button className="violet-button w-full flex items-center justify-center gap-2" onClick={handleCheck} disabled={loading}>
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Checking...</> : "Check Grammar"}
      </button>

      {checked && (
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
