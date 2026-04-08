// Eye gaze estimation using face-api.js 68-point landmarks
// Left eye: points 36-41, Right eye: points 42-47
// Nose tip: point 30

export type GazeDirection = "center" | "left" | "right" | "up" | "down";

export interface GazeResult {
  direction: GazeDirection;
  isFocused: boolean;
  horizontalRatio: number;
  verticalRatio: number;
}

function midpoint(a: { x: number; y: number }, b: { x: number; y: number }) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

export function estimateGaze(landmarks: { x: number; y: number }[]): GazeResult {
  if (landmarks.length < 68) {
    return { direction: "center", isFocused: false, horizontalRatio: 0.5, verticalRatio: 0.5 };
  }

  // Eye corners
  const leftEyeLeft = landmarks[36];
  const leftEyeRight = landmarks[39];
  const rightEyeLeft = landmarks[42];
  const rightEyeRight = landmarks[45];

  // Eye centers (top/bottom midpoints)
  const leftEyeTop = midpoint(landmarks[37], landmarks[38]);
  const leftEyeBottom = midpoint(landmarks[40], landmarks[41]);
  const rightEyeTop = midpoint(landmarks[43], landmarks[44]);
  const rightEyeBottom = midpoint(landmarks[46], landmarks[47]);

  const leftEyeCenter = midpoint(leftEyeTop, leftEyeBottom);
  const rightEyeCenter = midpoint(rightEyeTop, rightEyeBottom);

  // Horizontal ratio: where the eye center sits between left and right corners
  const leftHRatio = (leftEyeCenter.x - leftEyeLeft.x) / (leftEyeRight.x - leftEyeLeft.x);
  const rightHRatio = (rightEyeCenter.x - rightEyeLeft.x) / (rightEyeRight.x - rightEyeLeft.x);
  const horizontalRatio = (leftHRatio + rightHRatio) / 2;

  // Vertical ratio: position within eye height
  const leftEyeHeight = leftEyeBottom.y - leftEyeTop.y;
  const rightEyeHeight = rightEyeBottom.y - rightEyeTop.y;
  const leftVRatio = leftEyeHeight > 2 ? (leftEyeCenter.y - leftEyeTop.y) / leftEyeHeight : 0.5;
  const rightVRatio = rightEyeHeight > 2 ? (rightEyeCenter.y - rightEyeTop.y) / rightEyeHeight : 0.5;
  const verticalRatio = (leftVRatio + rightVRatio) / 2;

  // Also use nose-to-face-center ratio for head pose estimation
  const noseTip = landmarks[30];
  const faceLeft = landmarks[0];
  const faceRight = landmarks[16];
  const faceWidth = faceRight.x - faceLeft.x;
  const noseHRatio = faceWidth > 0 ? (noseTip.x - faceLeft.x) / faceWidth : 0.5;

  // Combine eye gaze with head pose
  const combinedH = horizontalRatio * 0.4 + noseHRatio * 0.6;

  // Determine direction with thresholds
  let direction: GazeDirection = "center";
  if (combinedH < 0.38) direction = "right"; // mirrored
  else if (combinedH > 0.62) direction = "left"; // mirrored
  
  // Vertical: use nose tip relative to eye line for head tilt
  const eyeLineY = (leftEyeCenter.y + rightEyeCenter.y) / 2;
  const chin = landmarks[8];
  const forehead = midpoint(landmarks[19], landmarks[24]);
  const faceHeight = chin.y - forehead.y;
  const noseRelative = faceHeight > 0 ? (noseTip.y - forehead.y) / faceHeight : 0.5;
  
  if (noseRelative < 0.35) direction = "up";
  else if (noseRelative > 0.65) direction = "down";

  const isFocused = direction === "center";

  return { direction, isFocused, horizontalRatio: combinedH, verticalRatio: noseRelative };
}
