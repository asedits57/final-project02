import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface ErrorMessageProps {
    message?: string;
    onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
    message = "Something went wrong while fetching data.",
    onRetry 
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center p-12 text-center rounded-3xl"
            style={{
                background: "hsla(0, 80%, 15%, 0.1)",
                border: "1px solid hsla(0, 80%, 60%, 0.15)",
                backdropFilter: "blur(12px)",
            }}
        >
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-poppins font-bold text-red-200 mb-2">Transmission Error</h3>
            <p className="text-sm font-poppins text-red-200/60 max-w-xs mb-8">
                {message}
            </p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 font-poppins font-semibold text-sm hover:bg-red-500/20 transition-all hover:scale-105 active:scale-95"
                >
                    <RotateCcw className="w-4 h-4" />
                    Retry Connection
                </button>
            )}
        </motion.div>
    );
};

export default ErrorMessage;
