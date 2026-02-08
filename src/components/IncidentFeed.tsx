import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FileWarning, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Incident {
  id: string;
  title: string;
  description: string;
  location: string;
  severity: "low" | "medium" | "high" | "critical";
  status: string;
  created_at: string;
}

const severityBadge: Record<string, string> = {
  critical: "bg-destructive/20 text-destructive border-destructive/30",
  high: "bg-threat-high/20 text-threat-high border-threat-high/30",
  medium: "bg-warning/20 text-warning border-warning/30",
  low: "bg-primary/20 text-primary border-primary/30",
};

const statusBadge: Record<string, string> = {
  pending: "bg-warning/20 text-warning border-warning/30",
  investigating: "bg-primary/20 text-primary border-primary/30",
  resolved: "bg-success/20 text-success border-success/30",
};

export default function IncidentFeed({ className, adminView = false }: { className?: string; adminView?: boolean }) {
  const [incidents, setIncidents] = useState<Incident[]>([]);

  const fetchIncidents = async () => {
    const { data } = await supabase
      .from("incidents")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) setIncidents(data as Incident[]);
  };

  useEffect(() => {
    fetchIncidents();

    const channel = supabase
      .channel("incidents-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "incidents" }, () => {
        fetchIncidents();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className={cn("glass-card", className)}>
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <FileWarning className="w-4 h-4 text-warning" />
          <h3 className="font-semibold text-sm">
            {adminView ? "All Incident Reports" : "My Incident Reports"}
          </h3>
        </div>
        <Badge variant="outline" className="text-xs font-mono">
          {incidents.length} reports
        </Badge>
      </div>

      <div className="max-h-[500px] overflow-y-auto divide-y divide-border/30">
        {incidents.length === 0 && (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No incidents reported yet
          </div>
        )}
        {incidents.map((incident) => (
          <div key={incident.id} className="p-4 hover:bg-muted/20 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{incident.title}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {incident.description}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    {incident.location}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {new Date(incident.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <Badge variant="outline" className={cn("text-[10px] uppercase", severityBadge[incident.severity])}>
                  {incident.severity}
                </Badge>
                <Badge variant="outline" className={cn("text-[10px] uppercase", statusBadge[incident.status] || "")}>
                  {incident.status}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
