import { createContext, useContext } from "react";

export type EventType = "info" | "success" | "warning" | "danger";
export type EventSource = "camera" | "voice" | "screen" | "system";

export interface ProctoringEvent {
  id: number;
  time: string;
  message: string;
  type: EventType;
  source: EventSource;
}

export interface ProctoringContextValue {
  events: ProctoringEvent[];
  alerts: ProctoringEvent[];
  riskScore: number;
  pushEvent: (message: string, type: EventType, source: EventSource) => void;
}

export const ProctoringCtx = createContext<ProctoringContextValue | null>(null);

export const useProctoring = () => {
  const ctx = useContext(ProctoringCtx);
  if (!ctx) {
    throw new Error("useProctoring must be used within ProctoringProvider");
  }

  return ctx;
};
