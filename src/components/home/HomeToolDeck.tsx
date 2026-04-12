import { motion } from "framer-motion";
import TranslateCard from "@components/learning/TranslateCard";
import GrammarCard from "@components/learning/GrammarCard";
import SentenceCard from "@components/learning/SentenceCard";
import SpellingCard from "@components/learning/SpellingCard";

const cardVariant = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

const HomeToolDeck = () => {
  return (
    <motion.div
      className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2"
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: 0.08,
            delayChildren: 0.14,
          },
        },
      }}
    >
      <motion.div variants={cardVariant}>
        <TranslateCard />
      </motion.div>
      <motion.div variants={cardVariant}>
        <GrammarCard />
      </motion.div>
      <motion.div variants={cardVariant}>
        <SentenceCard />
      </motion.div>
      <motion.div variants={cardVariant}>
        <SpellingCard />
      </motion.div>
    </motion.div>
  );
};

export default HomeToolDeck;
