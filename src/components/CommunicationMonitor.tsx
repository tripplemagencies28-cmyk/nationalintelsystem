import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Radio, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CommAlert {
  id: string;
  source: string;
  content: string;
  detected_keywords: string[];
  threat_level: "low" | "medium" | "high" | "critical";
  network_type: string;
  is_reviewed: boolean;
  detected_at: string;
}

const levelStyles: Record<string, string> = {
  critical: "border-destructive/30 bg-destructive/5",
  high: "border-threat-high/30 bg-threat-high/5",
  medium: "border-warning/30 bg-warning/5",
  low: "border-primary/30 bg-primary/5",
};

const levelBadge: Record<string, string> = {
  critical: "bg-destructive/20 text-destructive border-destructive/30",
  high: "bg-threat-high/20 text-threat-high border-threat-high/30",
  medium: "bg-warning/20 text-warning border-warning/30",
  low: "bg-primary/20 text-primary border-primary/30",
};

export default function CommunicationMonitor({ className }: { className?: string }) {
  const [alerts, setAlerts] = useState<CommAlert[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("communication_alerts")
        .select("*")
        .order("detected_at", { ascending: false })
        .limit(50);
      if (data) setAlerts(data as CommAlert[]);
    };
    fetch();
  }, []);

  const markReviewed = async (id: string) => {
    await supabase.from("communication_alerts").update({ is_reviewed: true }).eq("id", id);
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, is_reviewed: true } : a)));
  };

  return (
    <div className={cn("glass-card", className)}>
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">Communication Monitoring</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-destructive threat-pulse" />
          <span className="text-xs font-mono text-muted-foreground">LIVE SCANNING</span>
        </div>
      </div>

      <div className="max-h-[500px] overflow-y-auto divide-y divide-border/30">
        {alerts.length === 0 && (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No communication alerts detected
          </div>
        )}
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={cn(
              "p-4 transition-colors hover:bg-muted/20",
              !alert.is_reviewed && levelStyles[alert.threat_level]
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className={cn("text-[10px] uppercase", levelBadge[alert.threat_level])}>
                    {alert.threat_level}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono">{alert.network_type}</span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">{alert.source}</span>
                </div>
                <p className="text-sm truncate">{alert.content}</p>
                {alert.detected_keywords.length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {alert.detected_keywords.map((kw, i) => (
                      <span key={i} className="px-1.5 py-0.5 bg-destructive/10 text-destructive text-[10px] rounded font-mono">
                        {kw}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {new Date(alert.detected_at).toLocaleString()}
                </div>
              </div>
              <div className="flex-shrink-0">
                {alert.is_reviewed ? (
                  <CheckCircle className="w-5 h-5 text-success" />
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => markReviewed(alert.id)} className="text-xs">
                    Review
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
