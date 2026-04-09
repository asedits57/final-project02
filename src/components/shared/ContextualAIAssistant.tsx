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

const baseCardStyles =
  "rounded-3xl border border-violet-400/18 bg-[hsla(270,20%,8%,0.82)] p-5 shadow-[0_0_30px_hsla(270,80%,55%,0.06)] backdrop-blur-xl";

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
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl border border-violet-300/18 bg-violet-500/10 p-3">
            <Bot className="h-5 w-5 text-violet-200" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-300/72">AI coach</p>
            <h3 className="mt-2 text-lg font-semibold text-white">{title}</h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300/72">{description}</p>
          </div>
        </div>
        <Sparkles className="mt-1 h-5 w-5 text-violet-300/52" />
      </div>

      {suggestions.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.label}
              type="button"
              onClick={() => void handleAsk(suggestion.prompt)}
              disabled={loading}
              className="rounded-full border border-violet-300/18 bg-violet-500/8 px-3 py-1.5 text-xs font-medium text-violet-100 transition hover:bg-violet-500/14 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {suggestion.label}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={(event) => void handleSubmit(event)} className="mt-4 space-y-3">
        <textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          rows={3}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-violet-300/14 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-400/50 focus:bg-black/30"
        />

        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-slate-400">The coach uses the current task context so you can ask shorter questions.</p>
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="inline-flex items-center gap-2 rounded-2xl bg-violet-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(109,40,217,0.3)] transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
            Ask AI
          </button>
        </div>
      </form>

      {error && (
        <p className="mt-3 rounded-2xl border border-red-400/18 bg-red-500/8 px-4 py-3 text-sm text-red-100">
          {error}
        </p>
      )}

      {answer && !error && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4"
        >
          <p className="text-[11px] uppercase tracking-[0.2em] text-violet-300/72">{responseLabel}</p>
          <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-100">{answer}</div>
        </motion.div>
      )}
    </motion.section>
  );
};

export default ContextualAIAssistant;
