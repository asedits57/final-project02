import { Mic, MicOff } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useProctoring } from "./ProctoringContext";

const VoicePanel = () => {
  const { pushEvent } = useProctoring();
  const [bars, setBars] = useState<number[]>(Array(40).fill(4));
  const [voiceDetected, setVoiceDetected] = useState(false);
  const [noiseLevel, setNoiseLevel] = useState<"low" | "moderate" | "high">("low");
  const [micActive, setMicActive] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>();

  const startMic = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new AudioContext();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.75;
      source.connect(analyser);
      analyserRef.current = analyser;
      setMicActive(true);
    } catch {
      setMicError("Microphone access denied");
    }
  }, []);

  useEffect(() => {
    startMic();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [startMic]);

  // Visualization loop
  useEffect(() => {
    if (!micActive || !analyserRef.current) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      analyser.getByteFrequencyData(dataArray);

      // Map frequency data to bar heights
      const barCount = 40;
      const step = Math.floor(bufferLength / barCount);
      const newBars: number[] = [];
      for (let i = 0; i < barCount; i++) {
        const val = dataArray[i * step] || 0;
        newBars.push(Math.max(3, (val / 255) * 56));
      }
      setBars(newBars);

      // Voice detection: average amplitude
      const avg = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
      const detected = avg > 25;
      setVoiceDetected(detected);
      const level = avg < 10 ? "low" : avg < 40 ? "moderate" : "high";
      setNoiseLevel(level);

      if (level === "high") {
        pushEvent("High background noise detected", "warning", "voice");
      } else if (detected) {
        pushEvent("Voice activity detected", "info", "voice");
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [micActive]);

  return (
    <div className="glass neon-border p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Mic className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Voice Activity</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${micActive ? "bg-success animate-pulse" : "bg-danger"}`} />
          <span className={`text-xs ${micActive ? "text-success" : "text-danger"}`}>
            {micActive ? "Active" : micError || "Loading..."}
          </span>
        </div>
      </div>

      {/* Waveform */}
      <div className="flex items-end justify-center gap-[2px] h-14 mb-4">
        {bars.map((h, i) => (
          <div
            key={i}
            className="w-[3px] rounded-full bg-gradient-to-t from-primary/40 to-primary transition-[height] duration-75"
            style={{ height: `${h}px` }}
          />
        ))}
      </div>

      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${voiceDetected ? "bg-success animate-pulse" : "bg-muted-foreground/30"}`} />
          <span className="text-muted-foreground">
            {voiceDetected ? "Voice Detected" : "Silent"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${
            noiseLevel === "low" ? "bg-success" : noiseLevel === "moderate" ? "bg-warning" : "bg-danger"
          }`} />
          <span className="text-muted-foreground">
            {noiseLevel === "low" ? "Low Noise" : noiseLevel === "moderate" ? "Moderate Noise" : "High Noise"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-success" />
          <span className="text-muted-foreground">Single Voice</span>
        </div>
      </div>
    </div>
  );
};

export default VoicePanel;
