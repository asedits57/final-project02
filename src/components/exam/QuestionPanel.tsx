import { Mic, MicOff, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { apiService as api } from "@services/apiService";
import { blobToDataUrl, getSupportedMediaRecorderMimeType, type CapturedRecordingAsset } from "@lib/mediaRecorder";

export interface EvaluationResult {
  score: number;
  feedback: string;
  transcript?: string;
  audioRecording?: CapturedRecordingAsset;
}

interface QuestionPanelProps {
  onComplete?: (result: EvaluationResult) => void;
  onRecordingStateChange?: (isRecording: boolean) => void;
}

const QuestionPanel = ({ onComplete, onRecordingStateChange }: QuestionPanelProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(30);
  const [transcript, setTranscript] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef("");
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimeRef = useRef(30);

  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  useEffect(() => {
    recordTimeRef.current = recordTime;
  }, [recordTime]);

  useEffect(() => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording]);

  const toggleRecording = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  const startRecording = async () => {
    setTranscript("");
    setRecordTime(30);
    setIsRecording(true);
    onRecordingStateChange?.(true);

    if (typeof MediaRecorder !== "undefined") {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStreamRef.current = stream;
        audioChunksRef.current = [];
        const mimeType = getSupportedMediaRecorderMimeType([
          "audio/webm;codecs=opus",
          "audio/webm",
          "audio/mp4",
        ]);

        audioRecorderRef.current = mimeType
          ? new MediaRecorder(stream, { mimeType })
          : new MediaRecorder(stream);

        audioRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        audioRecorderRef.current.start();
      } catch (error) {
        console.warn("Audio recording capture unavailable:", error);
      }
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const finalizeAudioRecording = async (): Promise<CapturedRecordingAsset | undefined> => {
    const recorder = audioRecorderRef.current;

    if (!recorder) {
      audioStreamRef.current?.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
      return undefined;
    }

    const durationSeconds = Math.max(1, 30 - recordTimeRef.current);

    return new Promise((resolve) => {
      recorder.onstop = async () => {
        try {
          const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || "audio/webm" });
          audioChunksRef.current = [];

          if (blob.size === 0) {
            resolve(undefined);
            return;
          }

          const dataUrl = await blobToDataUrl(blob);
          resolve({
            dataUrl,
            mimeType: recorder.mimeType || blob.type,
            durationSeconds,
            sizeBytes: blob.size,
          });
        } catch (error) {
          console.warn("Failed to finalize audio recording:", error);
          resolve(undefined);
        } finally {
          audioStreamRef.current?.getTracks().forEach((track) => track.stop());
          audioStreamRef.current = null;
          audioRecorderRef.current = null;
        }
      };

      if (recorder.state !== "inactive") {
        recorder.stop();
      } else {
        recorder.onstop?.(new Event("stop"));
      }
    });
  };

  const stopRecording = async () => {
    setIsRecording(false);
    onRecordingStateChange?.(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error(e);
      }
    }

    const audioRecording = await finalizeAudioRecording();
    const resolvedTranscript = transcriptRef.current.trim();

    if (!resolvedTranscript) {
      if (onComplete) {
        onComplete({
          score: 0,
          feedback: "No response recorded.",
          transcript: "",
          audioRecording,
        });
      }
      return;
    }

    setIsEvaluating(true);
    try {
      const review = await api.evaluateSpeaking("Describe your favorite place in your city.", resolvedTranscript);
      const data: EvaluationResult = {
        score: review.overall,
        feedback: review.tips?.length ? review.tips.join(" ") : "Evaluation complete.",
        transcript: resolvedTranscript,
        audioRecording,
      };
      if (onComplete) onComplete(data);
    } catch (error) {
      console.error("Evaluation error:", error);
      if (onComplete) {
        onComplete({
          score: 0,
          feedback: "Error evaluating response.",
          transcript: resolvedTranscript,
          audioRecording,
        });
      }
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="glass neon-border flex h-full flex-col p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center gap-2">
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
      <div className="mb-6 flex h-16 items-end justify-center gap-0.5 sm:gap-1">
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
      <div className="mt-auto flex flex-col items-center justify-center gap-4 sm:flex-row">
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
