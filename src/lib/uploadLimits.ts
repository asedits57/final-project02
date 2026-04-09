export const MAX_ADMIN_VIDEO_UPLOAD_BYTES = 60 * 1024 * 1024;
export const MAX_FINAL_TEST_RECORDINGS_BYTES = 20 * 1024 * 1024;

export const formatBytesToMb = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

export const estimateDataUrlBytes = (dataUrl: string) => {
  const base64 = dataUrl.split(",")[1] || "";
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  return Math.max(0, Math.floor((base64.length * 3) / 4) - padding);
};
