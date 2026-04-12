import { motion } from "framer-motion";
import { Brain } from "lucide-react";
import TranslateCard from "@components/learning/TranslateCard";
import GrammarCard from "@components/learning/GrammarCard";
import SentenceCard from "@components/learning/SentenceCard";
import SpellingCard from "@components/learning/SpellingCard";

const Index = () => {
  return (
    <div className="min-h-screen animated-bg relative overflow-hidden text-foreground">
      <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 py-12 sm:py-16 pb-10">
        {/* Header */}
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Brain className="w-6 h-6 text-violet-bright" />
            </div>
            <h1 className="font-display text-3xl sm:text-5xl font-semibold tracking-[0.04em] glow-text">
              Language{" "}
              <span className="font-script text-[1.08em] font-normal tracking-normal">
                Intelligence
              </span>
            </h1>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
            AI-powered tools to master English — translate, check grammar, improve sentences, and fix spelling.
          </p>
        </motion.div>

        {/* 2×2 Grid with staggered entrance */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3,
              }
            }
          }}
        >
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}><TranslateCard /></motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}><GrammarCard /></motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}><SentenceCard /></motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}><SpellingCard /></motion.div>
        </motion.div>

        {/* Footer */}
        <motion.p
          className="text-center text-muted-foreground text-xs mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          Powered by Language Intelligence AI
        </motion.p>
      </div>
    </div>
  );
};

export default Index;
