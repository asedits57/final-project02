import { useState } from "react";
import { motion } from "framer-motion";
import { Type, Loader2 } from "lucide-react";
import { callLanguageTool } from "@/lib/languageTool";

interface SpellingError {
  word: string;
  suggestion: string;
}

const SpellingCard = () => {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<SpellingError[]>([]);
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const result = await callLanguageTool({ tool: "spelling", text: input.trim() });
      const parsed = JSON.parse(result);
      setResults(Array.isArray(parsed) ? parsed : []);
      setChecked(true);
    } catch {
      setResults([]);
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
          <Type className="w-5 h-5 text-violet-bright" />
        </div>
        <h2 className="font-display text-xl font-semibold glow-text text-center">Spelling Check</h2>
      </div>

      <textarea
        className="glass-input min-h-[100px] flex-1 resize-none"
        placeholder="Enter text to check spelling..."
        value={input}
        onChange={(e) => { setInput(e.target.value); setChecked(false); }}
      />

      <button className="violet-button w-full flex items-center justify-center gap-2" onClick={handleCheck} disabled={loading}>
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Checking...</> : "Check Spelling"}
      </button>

      {checked && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-2">
          {results.length > 0 ? results.map((r, i) => (
            <div key={i} className="output-area flex items-center gap-3 text-xs">
              <span className="highlight-error px-1">{r.word}</span>
              <span className="text-muted-foreground">→</span>
              <span className="highlight-suggestion px-1 text-accent">{r.suggestion}</span>
            </div>
          )) : (
            <div className="output-area text-xs text-center">✅ No spelling errors found!</div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default SpellingCard;
