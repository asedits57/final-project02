import React, { Component, ErrorInfo, ReactNode } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen animated-bg flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-strong max-w-md w-full p-8 rounded-3xl text-center border-red-500/30"
          >
            <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">Something went wrong</h2>
            <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
              We encountered an unexpected error. This might be due to a network issue or a temporary failure.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleReset}
                className="violet-button w-full flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Retry Loading
              </button>
              
              <button
                onClick={() => window.location.href = "/"}
                className="glass-input !bg-white/5 hover:!bg-white/10 flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Return to Home
              </button>
            </div>

            {process.env.NODE_ENV === "development" && (
              <div className="mt-8 p-4 bg-black/40 rounded-xl text-left overflow-auto max-h-40">
                <p className="text-[10px] font-mono text-red-400">
                  {this.state.error?.toString()}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
