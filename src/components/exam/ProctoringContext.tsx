import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { ProctoringCtx, type EventSource, type EventType, type ProctoringEvent } from "./proctoring";

const now = () =>
  new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });

export const ProctoringProvider = ({ children }: { children: ReactNode }) => {
  const [events, setEvents] = useState<ProctoringEvent[]>([
    { id: 0, time: now(), message: "Exam started", type: "info", source: "system" },
  ]);
  const [riskScore, setRiskScore] = useState(5);
  const idRef = useRef(1);
  // Dedup: track last message per source to avoid spamming identical events
  const lastMsg = useRef<Record<string, string>>({});

  const pushEvent = useCallback((message: string, type: EventType, source: EventSource) => {
    // Deduplicate: skip if same source just emitted same message
    if (lastMsg.current[source] === message) return;
    lastMsg.current[source] = message;

    const evt: ProctoringEvent = { id: idRef.current++, time: now(), message, type, source };
    setEvents((prev) => [evt, ...prev].slice(0, 50));

    // Adjust risk score based on event type
    setRiskScore((prev) => {
      if (type === "danger") return Math.min(100, prev + 12);
      if (type === "warning") return Math.min(100, prev + 5);
      if (type === "success") return Math.max(0, prev - 3);
      return prev;
    });
  }, []);

  // Decay risk score over time
  useEffect(() => {
    const t = setInterval(() => {
      setRiskScore((prev) => Math.max(0, prev - 1));
    }, 3000);
    return () => clearInterval(t);
  }, []);

  const alerts = events.filter((e) => e.type === "warning" || e.type === "danger");

  return (
    <ProctoringCtx.Provider value={{ events, alerts, riskScore, pushEvent }}>
      {children}
    </ProctoringCtx.Provider>
  );
};
