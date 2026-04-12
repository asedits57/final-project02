import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { Bot, Loader2, Sparkles } from "lucide-react";

export interface ContextualAISuggestion {
  label: string;
  prompt: string;
}

interface ContextualAIAssistantProps {
  title: string;
  description: string;
  placeholder: string;
  onAsk: (question: string) => Promise<string>;
  suggestions?: ContextualAISuggestion[];
  responseLabel?: string;
  className?: string;
}

const baseCardStyles = "app-surface-soft p-4";

const ContextualAIAssistant = ({
  title,
  description,
  placeholder,
  onAsk,
  suggestions = [],
  responseLabel = "AI response",
  className = "",
}: ContextualAIAssistantProps) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAsk = async (prompt: string) => {
    if (!prompt.trim() || loading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const reply = await onAsk(prompt);
      setAnswer(reply);
      setQuestion(prompt);
    } catch (err) {
      console.error("Contextual AI assistant error:", err);
      setError(err instanceof Error ? err.message : "The AI coach is temporarily unavailable. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await handleAsk(question);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${baseCardStyles} ${className}`.trim()}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl border border-cyan-300/18 bg-cyan-500/10 p-2.5">
            <Bot className="h-5 w-5 text-cyan-200" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/72">AI coach</p>
            <h3 className="mt-1.5 text-lg font-semibold text-white">{title}</h3>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-300/72">{description}</p>
          </div>
        </div>
        <Sparkles className="mt-1 h-5 w-5 text-orange-200/52" />
      </div>

      {suggestions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.label}
              type="button"
              onClick={() => void handleAsk(suggestion.prompt)}
              disabled={loading}
              className="rounded-full border border-cyan-300/18 bg-cyan-500/8 px-3 py-1.5 text-xs font-medium text-cyan-100 transition hover:bg-cyan-500/14 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {suggestion.label}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={(event) => void handleSubmit(event)} className="mt-3 space-y-2.5">
        <textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          rows={3}
          placeholder={placeholder}
          className="glass-input"
        />

        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-400">The coach uses the current task context so you can ask shorter questions.</p>
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="brand-button-primary w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
            Ask AI
          </button>
        </div>
      </form>

      {error && (
        <p className="mt-3 rounded-2xl border border-red-400/18 bg-red-500/8 px-3.5 py-3 text-sm text-red-100">
          {error}
        </p>
      )}

      {answer && !error && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3.5"
        >
          <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-200/72">{responseLabel}</p>
          <div className="mt-2.5 whitespace-pre-wrap text-sm leading-relaxed text-slate-100">{answer}</div>
        </motion.div>
      )}
    </motion.section>
  );
};

export default ContextualAIAssistant;
