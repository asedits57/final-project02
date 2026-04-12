import { useState } from "react";
import { motion } from "framer-motion";
import { Languages, Loader2, Mic } from "lucide-react";

import { Skeleton } from "@components/ui/skeleton";
import { useToast } from "@hooks/use-toast";
import { apiService as api } from "@services/apiService";

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error && error.message.trim() ? error.message : fallback;

const TranslateCard = () => {
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"tamil-to-english" | "english-to-tamil">("tamil-to-english");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const fromLang = mode === "tamil-to-english" ? "Tamil" : "English";
  const toLang = mode === "tamil-to-english" ? "English" : "Tamil";

  const handleTranslate = async () => {
    if (!input.trim()) {
      return;
    }

    setLoading(true);
    try {
      const translated = await api.translateText(input, fromLang, toLang);
      setOutput(translated);
    } catch (error: unknown) {
      console.error("Translation error:", error);
      toast({
        title: "Translation failed",
        description: getErrorMessage(error, "We could not reach the AI translator. Please try again."),
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
          <Languages className="h-5 w-5 text-cyan-100" />
        </div>
        <h2 className="text-center font-display text-lg font-semibold glow-text">Translation desk</h2>
      </div>

      <div className="space-y-2">
        <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Direction</label>
        <select
          value={mode}
          onChange={(event) => {
            setMode(event.target.value as "tamil-to-english" | "english-to-tamil");
            setInput("");
            setOutput("");
          }}
          className="glass-input !rounded-xl !py-2.5 w-full appearance-none cursor-pointer text-center text-sm font-bold text-cyan-100"
        >
          <option value="tamil-to-english" className="bg-card text-foreground">Tamil -&gt; English</option>
          <option value="english-to-tamil" className="bg-card text-foreground">English -&gt; Tamil</option>
        </select>
      </div>

      <div className="relative flex flex-1 flex-col">
        <textarea
          className="glass-input min-h-[88px] flex-1 resize-none text-sm"
          placeholder={mode === "tamil-to-english" ? "Paste Tamil text here..." : "Paste English text here..."}
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            setOutput("");
          }}
        />
        <motion.button
          type="button"
          className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary/20"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Voice input coming soon"
        >
          <Mic className="h-4 w-4 text-cyan-100" />
        </motion.button>
      </div>

      <button
        type="button"
        className="violet-button flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
        onClick={handleTranslate}
        disabled={loading || !input.trim()}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Translating...
          </>
        ) : (
          "Translate"
        )}
      </button>

      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 px-3.5 py-3.5">
          <div className="space-y-2">
            <Skeleton className="h-3 w-full bg-white/10" />
            <Skeleton className="h-3 w-4/5 bg-white/10" />
          </div>
        </div>
      ) : null}

      {output && !loading ? (
        <motion.div
          className="output-area rounded-2xl border border-white/10 bg-white/5 p-3.5 text-sm leading-relaxed whitespace-pre-wrap"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
        >
          {output}
        </motion.div>
      ) : null}
    </motion.div>
  );
};

export default TranslateCard;
