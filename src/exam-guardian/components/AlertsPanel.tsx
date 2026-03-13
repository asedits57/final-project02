import { AlertTriangle } from "lucide-react";
import { useProctoring } from "./ProctoringContext";

const AlertsPanel = () => {
  const { alerts } = useProctoring();

  return (
    <div className="glass neon-border p-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-4 h-4 text-warning" />
        <span className="text-sm font-semibold">AI Behavior Alerts</span>
        {alerts.length > 0 && (
          <span className="ml-auto text-xs bg-destructive/20 text-destructive px-2 py-0.5 rounded-full">
            {alerts.length}
          </span>
        )}
      </div>

      <div className="space-y-2 max-h-36 overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="text-xs text-muted-foreground text-center py-4">No alerts yet</div>
        ) : (
          alerts.slice(0, 8).map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/20 animate-in fade-in slide-in-from-top-2"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-destructive shrink-0" />
              <span className="text-xs text-foreground flex-1">{a.message}</span>
              <span className="text-[10px] text-muted-foreground">{a.time}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AlertsPanel;
