import { ArrowLeft, Clock, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const VocabularyModule = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen animated-bg relative text-foreground">
            <header className="glass-strong sticky top-0 z-50 border-b border-border/50">
                <div className="container mx-auto flex items-center justify-between px-6 py-4">
                    <button onClick={() => navigate("/task")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="h-4 w-4" /> Back
                    </button>
                    <div className="glass rounded-full px-4 py-1.5 glow-border-violet">
                        <span className="text-xs font-semibold text-violet-300">Vocabulary Module</span>
                    </div>
                </div>
            </header>
            <main className="container mx-auto px-6 py-10 max-w-3xl pt-24 text-center pb-24">
                <div className="glass rounded-2xl p-10 glow-border-violet animate-fade-in relative z-10 liquid-hover">
                    <Zap className="w-12 h-12 text-violet-500 mx-auto mb-6" />
                    <h2 className="text-3xl font-display font-bold mb-4">Vocabulary Coming Soon</h2>
                    <p className="text-muted-foreground">We are working on this module. Stay tuned for updates!</p>
                </div>
            </main>
        </div>
    );
};

export default VocabularyModule;
