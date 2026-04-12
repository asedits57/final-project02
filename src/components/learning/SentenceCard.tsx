import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";

import { useToast } from "@hooks/use-toast";
import { apiService as api } from "@services/apiService";

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error && error.message.trim() ? error.message : fallback;

const SentenceCard = () => {
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImprove = async () => {
    if (!input.trim()) {
      return;
    }

    setLoading(true);
    try {
      const improved = await api.improveSentence(input);
      setOutput(improved);
    } catch (error: unknown) {
      toast({
        title: "Improvement failed",
        description: getErrorMessage(error, "The AI writing helper is temporarily unavailable."),
        variant: "destructive",
      });
      setOutput("");
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
          <Sparkles className="h-5 w-5 text-cyan-100" />
        </div>
        <h2 className="text-center font-display text-lg font-semibold glow-text">Sentence polish</h2>
      </div>

      <textarea
        className="glass-input min-h-[88px] flex-1 resize-none"
        placeholder="Enter a sentence to make clearer, stronger, or more natural..."
        value={input}
        onChange={(event) => setInput(event.target.value)}
      />

      <button
        type="button"
        className="violet-button flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
        onClick={handleImprove}
        disabled={loading || !input.trim()}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Polishing...
          </>
        ) : (
          "Improve sentence"
        )}
      </button>

      {output ? (
        <motion.div
          className="output-area text-sm"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
        >
          {output}
        </motion.div>
      ) : null}
    </motion.div>
  );
};

export default SentenceCard;
