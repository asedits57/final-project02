import { Monitor, AlertTriangle, MonitorOff } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useProctoring } from "./proctoring";

const ScreenPanel = () => {
  const { pushEvent } = useProctoring();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tabActive, setTabActive] = useState(true);
  const streamRef = useRef<MediaStream | null>(null);

  const startSharing = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 5 },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setSharing(true);
      setError(null);
      pushEvent("Screen sharing started", "success", "screen");

      // Detect when user stops sharing
      stream.getVideoTracks()[0].addEventListener("ended", () => {
        setSharing(false);
        streamRef.current = null;
        pushEvent("Screen sharing stopped", "danger", "screen");
      });
    } catch {
      setError("Screen sharing denied");
    }
  }, [pushEvent]);

  // Tab visibility detection
  useEffect(() => {
    const handler = () => {
      setTabActive(!document.hidden);
      if (document.hidden) {
        pushEvent("Tab switching detected", "danger", "screen");
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [pushEvent]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <div className="glass neon-border p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Monitor className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Screen Monitor</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${sharing ? "bg-success animate-pulse" : "bg-danger"}`} />
          <span className={`text-xs ${sharing ? "text-success" : "text-danger"}`}>
            {sharing ? "Sharing" : "Not sharing"}
          </span>
        </div>
      </div>

      <div className="relative bg-muted/30 rounded-lg aspect-video overflow-hidden flex items-center justify-center">
        {!sharing && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3">
            <MonitorOff className="w-8 h-8 text-muted-foreground/50" />
            <button
              onClick={startSharing}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/80 transition-all neon-glow"
            >
              Start Screen Sharing
            </button>
            {error && (
              <span className="text-xs text-danger">{error}</span>
            )}
          </div>
        )}

        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={`w-full h-full object-contain ${sharing ? "" : "hidden"}`}
        />

        {sharing && (
          <div className={`absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded ${
            tabActive ? "bg-success/20 text-success" : "bg-danger/20 text-danger"
          }`}>
            {tabActive ? "Tab Active" : "Tab Hidden ⚠"}
          </div>
        )}

        {sharing && !tabActive && (
          <div className="absolute bottom-2 inset-x-2 bg-destructive/90 backdrop-blur-sm rounded-md px-3 py-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive-foreground" />
            <span className="text-xs text-destructive-foreground font-medium">⚠ Tab switching detected</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScreenPanel;
