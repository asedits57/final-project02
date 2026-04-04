import React from "react";
import { motion } from "framer-motion";

const Spinner = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[200px] w-full p-8">
            <div className="relative w-16 h-16">
                <motion.div
                    className="absolute inset-0 rounded-full border-4 border-violet-500/20"
                />
                <motion.div
                    className="absolute inset-0 rounded-full border-4 border-t-violet-500 border-r-transparent border-b-transparent border-l-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
            </div>
            <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6 font-poppins text-sm text-violet-300/70 tracking-wide"
            >
                Gathering intelligence...
            </motion.p>
        </div>
    );
};

export default Spinner;
