import { Clock } from "lucide-react";
import { useProctoring } from "./ProctoringContext";

const Timeline = () => {
  const { events } = useProctoring();

  return (
    <div className="glass neon-border p-4">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold">Proctoring Timeline</span>
      </div>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {events.map((e) => (
          <div key={e.id} className="flex items-center gap-3 text-xs">
            <span className="text-muted-foreground font-mono w-10 shrink-0">{e.time}</span>
            <div className={`w-2 h-2 rounded-full shrink-0 ${
              e.type === "success" ? "bg-success" : e.type === "warning" ? "bg-warning" : e.type === "danger" ? "bg-danger" : "bg-primary"
            }`} />
            <span className="text-muted-foreground">{e.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;
