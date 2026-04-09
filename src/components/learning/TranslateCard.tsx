import { useState } from "react";
import { motion } from "framer-motion";
import { Languages, Mic, Loader2 } from "lucide-react";
import { apiService as api } from "@services/apiService";
import { useToast } from "@hooks/use-toast";
import { Skeleton } from "@components/ui/skeleton";

const TranslateCard = () => {
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"tamil-to-english" | "english-to-tamil">("tamil-to-english");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const fromLang = mode === "tamil-to-english" ? "Tamil" : "English";
  const toLang = mode === "tamil-to-english" ? "English" : "Tamil";

  const handleTranslate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const translated = await api.translateText(input, fromLang, toLang);
      setOutput(translated);
    } catch (err: any) {
      console.error("Translation Error:", err);
      toast({
        title: "Translation Failed",
        description: err?.message || "We couldn't reach the AI translator. Please try again.",
        variant: "destructive",
      });
      setOutput("");
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
          <Languages className="w-5 h-5 text-violet-bright" />
        </div>
        <h2 className="font-display text-xl font-semibold glow-text text-center">Translate</h2>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] text-muted-foreground uppercase font-black tracking-widest ml-1">Selection</label>
        <select
          value={mode}
          onChange={(e) => {
            setMode(e.target.value as "tamil-to-english" | "english-to-tamil");
            setInput("");
            setOutput("");
          }}
          className="glass-input !rounded-xl !py-3 w-full appearance-none cursor-pointer text-sm font-bold text-violet-400 text-center"
        >
          <option value="tamil-to-english" className="bg-card text-foreground">Tamil → English</option>
          <option value="english-to-tamil" className="bg-card text-foreground">English → Tamil</option>
        </select>
      </div>

      <div className="relative flex-1 flex flex-col">
        <textarea
          className="glass-input min-h-[100px] text-sm flex-1 resize-none"
          placeholder={mode === "tamil-to-english" ? "Paste Tamil text here..." : "Paste English text here..."}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setOutput("");
          }}
        />
        <motion.button
          className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Mic className="w-4 h-4 text-violet-bright" />
        </motion.button>
      </div>

      <button
        type="button"
        className="violet-button w-full flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
        onClick={handleTranslate}
        disabled={loading || !input.trim()}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Translating...
          </>
        ) : (
          "Translate"
        )}
      </button>

      {loading && (
        <div className="space-y-2 py-4 px-4 bg-white/5 rounded-2xl border border-white/10">
          <Skeleton className="h-3 w-full bg-white/10" />
          <Skeleton className="h-3 w-4/5 bg-white/10" />
        </div>
      )}

      {output && !loading && (
        <motion.div
          className="output-area text-sm leading-relaxed whitespace-pre-wrap p-4 bg-white/5 rounded-2xl border border-white/10"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
        >
          {output}
        </motion.div>
      )}
    </motion.div>
  );
};

export default TranslateCard;
