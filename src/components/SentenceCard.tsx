import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import { api } from "../services/api";

const SentenceCard = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImprove = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const res = await api.askAI(`Improve the following English sentence. Return only the improved sentence, nothing else.\n\n"${input.trim()}"`);
      setOutput(res.reply || "");
    } catch {
      // handled
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
          <Sparkles className="w-5 h-5 text-violet-bright" />
        </div>
        <h2 className="font-display text-xl font-semibold glow-text text-center">Sentence Improvement</h2>
      </div>

      <textarea
        className="glass-input min-h-[100px] flex-1 resize-none"
        placeholder="Enter a sentence to improve..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <button className="violet-button w-full flex items-center justify-center gap-2" onClick={handleImprove} disabled={loading}>
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Improving...</> : "Improve"}
      </button>

      {output && (
        <motion.div className="output-area text-sm" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
          {output}
        </motion.div>
      )}
    </motion.div>
  );
};

export default SentenceCard;
