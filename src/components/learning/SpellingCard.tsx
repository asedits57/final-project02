import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Type } from "lucide-react";

import { useToast } from "@hooks/use-toast";
import { apiService as api } from "@services/apiService";
import type { SpellingIssue } from "@services/aiService";

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error && error.message.trim() ? error.message : fallback;

const SpellingCard = () => {
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [results, setResults] = useState<SpellingIssue[]>([]);
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    if (!input.trim()) {
      return;
    }

    setLoading(true);
    try {
      const parsed = await api.checkSpelling(input);
      setResults(Array.isArray(parsed) ? parsed : []);
      setChecked(true);
    } catch (error: unknown) {
      toast({
        title: "Spelling check failed",
        description: getErrorMessage(error, "The AI spelling helper is temporarily unavailable."),
        variant: "destructive",
      });
      setResults([]);
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
          <Type className="h-5 w-5 text-cyan-100" />
        </div>
        <h2 className="text-center font-display text-lg font-semibold glow-text">Spelling sweep</h2>
      </div>

      <textarea
        className="glass-input min-h-[88px] flex-1 resize-none"
        placeholder="Enter text to catch spelling mistakes and quick fixes..."
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
            Checking...
          </>
        ) : (
          "Check spelling"
        )}
      </button>

      {checked ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-2">
          {results.length > 0 ? (
            results.map((result, index) => (
              <div key={index} className="output-area flex items-center gap-3 text-xs">
                <span className="highlight-error px-1">{result.word}</span>
                <span className="text-muted-foreground">-&gt;</span>
                <span className="highlight-suggestion px-1 text-cyan-100">{result.suggestion}</span>
              </div>
            ))
          ) : (
            <div className="output-area text-center text-xs">No spelling errors found.</div>
          )}
        </motion.div>
      ) : null}
    </motion.div>
  );
};

export default SpellingCard;
