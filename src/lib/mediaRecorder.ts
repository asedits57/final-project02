export type CapturedRecordingAsset = {
  dataUrl: string;
  mimeType?: string;
  durationSeconds?: number;
  sizeBytes?: number;
};

export const blobToDataUrl = (blob: Blob) => (
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Failed to read recording data."));
    };
    reader.onerror = () => reject(reader.error || new Error("Failed to read recording data."));
    reader.readAsDataURL(blob);
  })
);

export const getSupportedMediaRecorderMimeType = (candidates: string[]) => {
  if (typeof window === "undefined" || typeof MediaRecorder === "undefined" || typeof MediaRecorder.isTypeSupported !== "function") {
    return undefined;
  }

  return candidates.find((candidate) => MediaRecorder.isTypeSupported(candidate));
};
