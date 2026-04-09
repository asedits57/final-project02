import { useState, useEffect, useRef, useCallback } from "react";
import { Eye, AlertTriangle, User, VideoOff } from "lucide-react";
import * as faceapi from "face-api.js";
import { estimateGaze, type GazeDirection } from "./gazeUtils";
import { useProctoring } from "./ProctoringContext";
import { blobToDataUrl, getSupportedMediaRecorderMimeType, type CapturedRecordingAsset } from "@lib/mediaRecorder";

const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.13/model";

interface Detection {
  box: { x: number; y: number; width: number; height: number };
  landmarks: { x: number; y: number }[];
}

interface CameraPanelProps {
  recordingActive?: boolean;
  onRecordingComplete?: (recording?: CapturedRecordingAsset) => void;
}

const CameraPanel = ({ recordingActive = false, onRecordingComplete }: CameraPanelProps) => {
  const { pushEvent } = useProctoring();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [alert, setAlert] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [multipleFaces, setMultipleFaces] = useState(false);
  const [faceCount, setFaceCount] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [gazeDirection, setGazeDirection] = useState<GazeDirection>("center");
  const [eyeFocused, setEyeFocused] = useState(false);
  const lookAwayTimer = useRef<number>(0);
  const detectionRef = useRef<number>();
  const videoRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const recordingStartedAtRef = useRef<number | null>(null);

  // Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
      } catch (err) {
        console.error("Failed to load face-api models:", err);
        setCameraError("Failed to load AI models");
      }
    };
    loadModels();
  }, []);

  // Start webcam
  useEffect(() => {
    if (!modelsLoaded) return;
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: "user" },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
        }
      } catch (err) {
        console.error("Camera access denied:", err);
        setCameraError("Camera access denied");
      }
    };
    startCamera();
    
    const videoNode = videoRef.current;

    return () => {
      if (videoNode?.srcObject) {
        (videoNode.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      }
    };
  }, [modelsLoaded]);

  // Run face detection loop
  const detect = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !cameraActive) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState < 2) {
      detectionRef.current = requestAnimationFrame(detect);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.4 }))
      .withFaceLandmarks(true);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const count = detections.length;
    setFaceCount(count);
    setFaceDetected(count >= 1);
    setMultipleFaces(count > 1);

    if (count === 0) {
      setAlert("⚠ Face not detected");
      setEyeFocused(false);
      setGazeDirection("center");
      lookAwayTimer.current = 0;
      pushEvent("Face not detected", "danger", "camera");
    } else if (count > 1) {
      setAlert("⚠ Multiple faces detected");
      setEyeFocused(false);
      pushEvent("Multiple faces detected", "danger", "camera");
    } else {
      const landmarks = detections[0].landmarks.positions;
      const gaze = estimateGaze(landmarks.map(p => ({ x: p.x, y: p.y })));
      setGazeDirection(gaze.direction);
      setEyeFocused(gaze.isFocused);

      if (!gaze.isFocused) {
        lookAwayTimer.current++;
        if (lookAwayTimer.current > 5) {
          setAlert(`⚠ Looking ${gaze.direction} — eyes off screen`);
          pushEvent(`Looking ${gaze.direction} — eyes off screen`, "warning", "camera");
        } else {
          setAlert(null);
        }
      } else {
        if (lookAwayTimer.current > 5) {
          pushEvent("Eye focus restored", "success", "camera");
        }
        lookAwayTimer.current = 0;
        setAlert(null);
      }
    }

    // Draw detections
    detections.forEach((det) => {
      const box = det.detection.box;

      // Detection box
      ctx.strokeStyle = count > 1 ? "hsl(0, 72%, 51%)" : "hsl(263, 84%, 55%)";
      ctx.lineWidth = 2;
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = 10;
      ctx.strokeRect(box.x, box.y, box.width, box.height);
      ctx.shadowBlur = 0;

      // Label
      ctx.fillStyle = count > 1 ? "hsla(0, 72%, 51%, 0.8)" : "hsla(263, 84%, 55%, 0.8)";
      ctx.fillRect(box.x, box.y - 20, 100, 20);
      ctx.fillStyle = "#fff";
      ctx.font = "11px Inter, sans-serif";
      ctx.fillText(count > 1 ? "⚠ Multiple" : "Face Detected", box.x + 4, box.y - 6);

      // Landmarks
      const landmarks = det.landmarks.positions;
      ctx.fillStyle = "hsl(263, 84%, 55%)";
      landmarks.forEach((pt) => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      });
    });

    detectionRef.current = requestAnimationFrame(detect);
  }, [cameraActive, pushEvent]);

  useEffect(() => {
    if (cameraActive && modelsLoaded) {
      detectionRef.current = requestAnimationFrame(detect);
    }
    return () => {
      if (detectionRef.current) cancelAnimationFrame(detectionRef.current);
    };
  }, [cameraActive, modelsLoaded, detect]);

  useEffect(() => {
    const stream = videoRef.current?.srcObject as MediaStream | null;

    if (!recordingActive || !cameraActive || !stream || typeof MediaRecorder === "undefined") {
      if (videoRecorderRef.current && videoRecorderRef.current.state !== "inactive") {
        videoRecorderRef.current.stop();
      }
      return;
    }

    if (videoRecorderRef.current && videoRecorderRef.current.state !== "inactive") {
      return;
    }

    try {
      const mimeType = getSupportedMediaRecorderMimeType([
        "video/webm;codecs=vp8",
        "video/webm",
        "video/mp4",
      ]);

      videoChunksRef.current = [];
      recordingStartedAtRef.current = Date.now();
      videoRecorderRef.current = mimeType
        ? new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 250_000 })
        : new MediaRecorder(stream);

      videoRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          videoChunksRef.current.push(event.data);
        }
      };

      videoRecorderRef.current.onstop = async () => {
        try {
          const recorder = videoRecorderRef.current;
          const blob = new Blob(videoChunksRef.current, { type: recorder?.mimeType || "video/webm" });
          videoChunksRef.current = [];

          if (blob.size === 0) {
            onRecordingComplete?.(undefined);
            return;
          }

          const dataUrl = await blobToDataUrl(blob);
          const durationSeconds = recordingStartedAtRef.current
            ? Math.max(1, Math.round((Date.now() - recordingStartedAtRef.current) / 1000))
            : undefined;

          onRecordingComplete?.({
            dataUrl,
            mimeType: recorder?.mimeType || blob.type,
            durationSeconds,
            sizeBytes: blob.size,
          });
        } catch (error) {
          console.warn("Failed to finalize camera recording:", error);
          onRecordingComplete?.(undefined);
        } finally {
          recordingStartedAtRef.current = null;
          videoRecorderRef.current = null;
        }
      };

      videoRecorderRef.current.start();
    } catch (error) {
      console.warn("Video recording capture unavailable:", error);
      onRecordingComplete?.(undefined);
    }
  }, [cameraActive, onRecordingComplete, recordingActive]);

  return (
    <div className="glass neon-border p-4 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Camera Monitor</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${cameraActive ? "bg-success animate-pulse" : "bg-danger"}`} />
          <span className={`text-xs ${cameraActive ? "text-success" : "text-danger"}`}>
            {cameraActive ? "Live" : cameraError || "Loading..."}
          </span>
        </div>
      </div>

      {/* Camera preview */}
      <div className="relative bg-muted/50 rounded-lg aspect-video overflow-hidden mb-3">
        {!cameraActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            {cameraError ? (
              <VideoOff className="w-10 h-10 text-muted-foreground/50" />
            ) : (
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            )}
            <span className="text-xs text-muted-foreground">{cameraError || "Starting camera..."}</span>
          </div>
        )}

        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
          style={{ transform: "scaleX(-1)" }}
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ transform: "scaleX(-1)" }}
        />

        {/* Scan line */}
        <div className="absolute inset-x-0 h-0.5 scan-line animate-scan" />

        {/* Alert overlay */}
        {alert && (
          <div className="absolute bottom-2 inset-x-2 bg-destructive/90 backdrop-blur-sm rounded-md px-3 py-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive-foreground" />
            <span className="text-xs text-destructive-foreground font-medium">{alert}</span>
          </div>
        )}
      </div>

      {/* Status */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <StatusItem label="Face Detected" ok={faceDetected} />
        <StatusItem label={`Gaze: ${gazeDirection}`} ok={eyeFocused} />
        <StatusItem label="Single Person" ok={faceDetected && !multipleFaces} />
        <StatusItem label={`Faces: ${faceCount}`} ok={faceCount === 1} />
      </div>
    </div>
  );
};

const StatusItem = ({ label, ok }: { label: string; ok: boolean }) => (
  <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-muted/50">
    <span className={`text-xs ${ok ? "text-success" : "text-danger"}`}>{ok ? "✔" : "✘"}</span>
    <span className="text-muted-foreground">{label}</span>
  </div>
);

export default CameraPanel;
