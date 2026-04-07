import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Bot, User, Sparkles, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiService as api } from "@shared/api";

type Message = {
    id: string;
    sender: "user" | "ai";
    text: string;
    timestamp: Date;
};

const presetPrompts = [
    { icon: BookOpen, text: "Explain Present Perfect Tense" },
    { icon: Sparkles, text: "How to improve vocabulary?" },
];

const AITutorPage = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "msg-0",
            sender: "ai",
            text: "Hello! I am your AI English Tutor. How can I help you improve your English today? You can ask me about grammar rules, vocabulary, or ask me to review your sentences.",
            timestamp: new Date(),
        }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping, scrollToBottom]);

    const handleSend = async (text: string) => {
        if (!text.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            sender: "user",
            text: text.trim(),
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInputValue("");
        setIsTyping(true);

        try {
            const context = [...messages, userMsg]
                .map(m => `${m.sender === "user" ? "Student" : "Tutor"}: ${m.text}`)
                .join("\n");

            const prompt = `You are a friendly English tutor. Answer clearly and helpfully.\n\n${context}\nTutor:`;

            const res = await api.askAI(prompt);

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                sender: "ai",
                text: res.reply || "Sorry, I couldn't get a response. Please try again.",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, aiMsg]);
        } catch (error) {
            console.error("AI Tutor Error:", error);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                sender: "ai",
                text: "I'm sorry, I'm having trouble connecting to my brain right now. Please try again in a moment!",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };



    return (
        <div className="min-h-screen animated-bg flex flex-col relative pb-safe text-foreground">
            {/* Background Orbs */}
            <div className="orb orb-violet w-[350px] h-[350px] -top-20 right-20 float opacity-30 pointer-events-none" />
            <div className="orb orb-cyan w-[250px] h-[250px] bottom-40 -left-10 float-delayed opacity-20 pointer-events-none" />

            {/* Header */}
            <header className="glass-strong sticky top-0 z-50 border-b border-border/50 backdrop-blur-3xl">
                <div className="container mx-auto flex items-center justify-between px-6 py-4 max-w-4xl">
                    <button
                        onClick={() => navigate("/task")}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                    >
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        Dashboard
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-[0_0_15px_rgba(139,92,246,0.4)]">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#120a1f] rounded-full"></span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold font-poppins text-foreground tracking-wide">Fluent AI Tutor</span>
                            <span className="text-[10px] text-green-400 font-medium">Online</span>
                        </div>
                    </div>
                    <div className="w-20" /> {/* Spacer for centering */}
                </div>
            </header>

            {/* Chat Area */}
            <main className="flex-1 overflow-y-auto px-4 py-8 relative z-10 w-full max-w-4xl mx-auto scroll-smooth">
                <div className="flex flex-col gap-6">
                    <AnimatePresence initial={false}>
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className={`flex items-end gap-3 max-w-[85%] ${msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                            >
                                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.sender === "user" ? "bg-primary/20" : "bg-violet-500/20"}`}>
                                    {msg.sender === "user" ? <User className="w-4 h-4 text-primary" /> : <Bot className="w-4 h-4 text-violet-400" />}
                                </div>

                                <div
                                    className={`rounded-2xl px-5 py-3.5 ${msg.sender === "user"
                                            ? "bg-primary/10 border border-primary/20 text-foreground"
                                            : "glass glow-border-violet text-foreground shadow-[0_0_30px_rgba(139,92,246,0.05)]"
                                        }`}
                                >
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap font-poppins">{msg.text}</p>
                                    <span className="text-[10px] text-muted-foreground mt-2 block opacity-60">
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {isTyping && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-3 mr-auto max-w-[80%]"
                        >
                            <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-violet-500/20">
                                <Bot className="w-4 h-4 text-violet-400" />
                            </div>
                            <div className="glass glow-border-violet rounded-2xl px-5 py-4 flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                                <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} className="h-4" />
                </div>
            </main>

            {/* Input Area */}
            <div className="glass-strong border-t border-border/50 p-4 sticky bottom-0 z-50 backdrop-blur-3xl w-full">
                <div className="max-w-4xl mx-auto flex flex-col gap-3">

                    {/* Preset Prompts (only show if no messages sent besides initial) */}
                    {messages.length === 1 && (
                        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none snap-x snap-mandatory">
                            {presetPrompts.map((preset, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSend(preset.text)}
                                    className="snap-start shrink-0 flex items-center gap-2 glass rounded-full px-4 py-2 text-xs font-medium text-violet-200 hover:bg-violet-500/20 transition-colors border border-violet-500/20 hover:border-violet-500/40"
                                >
                                    <preset.icon className="w-3.5 h-3.5 text-violet-400" />
                                    {preset.text}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="relative flex items-end gap-2">
                        <textarea
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend(inputValue);
                                }
                            }}
                            placeholder="Ask me anything about English..."
                            className="flex-1 w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-violet-500/50 focus:bg-black/40 transition-all resize-none max-h-32 shadow-inner"
                            style={{ minHeight: "56px" }}
                            rows={1}
                        />
                        <button
                            onClick={() => handleSend(inputValue)}
                            disabled={!inputValue.trim() || isTyping}
                            aria-label="Send message"
                            className="shrink-0 h-14 w-14 rounded-2xl flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                            style={{
                                background: inputValue.trim() ? "linear-gradient(135deg, #7f5af0, #8b5cf6)" : "rgba(255,255,255,0.05)",
                                boxShadow: inputValue.trim() ? "0 0 20px hsla(262, 83%, 58%, 0.4)" : "none",
                            }}
                        >
                            <Send className={`w-5 h-5 ${inputValue.trim() ? "text-white" : "text-muted-foreground"} ${inputValue.trim() && !isTyping ? "group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" : ""}`} />
                        </button>
                    </div>
                    <div className="text-center">
                        <span className="text-[10px] text-muted-foreground font-poppins">AI can make mistakes. Consider verifying important information.</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AITutorPage;
