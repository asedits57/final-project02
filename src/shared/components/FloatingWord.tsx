import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface FloatingWordProps {
    word: string;
    delay?: number;
    className?: string;
}

export function FloatingWord({ word, delay = 0, className = "" }: FloatingWordProps) {
    const [position, setPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        setPosition({
            x: Math.random() * 50 - 25,
            y: Math.random() * 50 - 25,
        });
    }, []);

    return (
        <motion.div
            className={`absolute text-white/10 font-display font-bold select-none pointer-events-none ${className}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
                opacity: [0.1, 0.3, 0.1],
                y: [0, -30, 0],
                x: [0, 20, 0],
                scale: [1, 1.1, 1],
            }}
            transition={{
                duration: 10 + Math.random() * 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: delay,
            }}
            style={{
                textShadow: "0 0 20px rgba(255,255,255,0.1)",
            }}
        >
            {word}
        </motion.div>
    );
}
