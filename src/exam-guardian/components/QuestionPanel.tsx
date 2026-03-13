import { Mic, MicOff, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { callLanguageTool } from "@/lib/languageTool";

export interface EvaluationResult {
  score: number;
  feedback: string;
}

interface QuestionPanelProps {
  onComplete?: (result: EvaluationResult) => void;
}

const QuestionPanel = ({ onComplete }: QuestionPanelProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(30);
  const [transcript, setTranscript] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let currentTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };
    }
  }, []);

  useEffect(() => {
    if (!isRecording) return;
    const t = setInterval(() => {
      setRecordTime((p) => {
        if (p <= 1) {
          stopRecording();
          return 0;
        }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [isRecording]);

  const toggleRecording = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = () => {
    setTranscript("");
    setRecordTime(30);
    setIsRecording(true);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error(e);
      }
    }

    if (!transcript.trim()) {
      if (onComplete) onComplete({ score: 0, feedback: "No response recorded." });
      return;
    }

    setIsEvaluating(true);
    try {
      const resp = await callLanguageTool({
        tool: "evaluate",
        text: transcript,
      });
      const data = JSON.parse(resp) as EvaluationResult;
      if (onComplete) onComplete(data);
    } catch (error) {
      console.error("Evaluation error:", error);
      if (onComplete) onComplete({ score: 0, feedback: "Error evaluating response." });
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="glass neon-border p-6 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold">Speaking Task</span>
        <span className="text-xs text-muted-foreground">Final Question</span>
      </div>

      <h2 className="font-display text-xl font-bold mb-2">
        "Describe your favorite place in your city."
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        Speak clearly into your microphone. You have 30 seconds to respond.
      </p>

      {/* Waveform */}
      <div className="flex items-end justify-center gap-1 h-16 mb-6">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="w-1 rounded-full bg-primary/60 transition-all duration-150"
            style={{
              height: isRecording
                ? `${Math.random() * 50 + 6}px`
                : "4px",
              animationDelay: `${i * 50}ms`,
            }}
          />
        ))}
      </div>

      {/* Transcript */}
      <div className="glass-strong rounded-lg p-4 mb-6 min-h-[60px] text-sm text-muted-foreground">
        {transcript || "Speech-to-text preview will appear here..."}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mt-auto">
        <button
          onClick={toggleRecording}
          disabled={isEvaluating}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all disabled:opacity-50 ${
            isRecording
              ? "bg-destructive neon-glow"
              : "bg-primary hover:bg-primary/80 neon-glow"
          }`}
        >
          {isEvaluating ? (
            <Loader2 className="w-6 h-6 text-primary-foreground animate-spin" />
          ) : isRecording ? (
            <MicOff className="w-6 h-6 text-primary-foreground" />
          ) : (
            <Mic className="w-6 h-6 text-primary-foreground" />
          )}
        </button>
        <div className="text-center">
          <div className="text-2xl font-mono font-bold">{recordTime}s</div>
          <div className="text-xs text-muted-foreground">{isEvaluating ? "Evaluating AI Score..." : isRecording ? "Recording..." : "Press to start"}</div>
        </div>
      </div>
    </div>
  );
};

export default QuestionPanel;
