import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import "leaflet/dist/leaflet.css";

interface Threat {
  id: string;
  title: string;
  description: string;
  threat_level: "low" | "medium" | "high" | "critical";
  latitude: number;
  longitude: number;
  location_name: string;
  is_active: boolean;
  created_at: string;
}

const threatColors: Record<string, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#06b6d4",
};

const threatRadius: Record<string, number> = {
  critical: 14,
  high: 11,
  medium: 8,
  low: 6,
};

function MapController() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 100);
  }, [map]);
  return null;
}

export default function ThreatMap({ className }: { className?: string }) {
  const [threats, setThreats] = useState<Threat[]>([]);

  useEffect(() => {
    const fetchThreats = async () => {
      const { data } = await supabase
        .from("threats")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (data) setThreats(data as Threat[]);
    };

    fetchThreats();

    const channel = supabase
      .channel("threats-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "threats" }, () => {
        fetchThreats();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className={cn("glass-card overflow-hidden", className)}>
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <div>
          <h3 className="font-semibold text-sm">Threat Intelligence Map</h3>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            {threats.length} active threat{threats.length !== 1 ? "s" : ""} detected
          </p>
        </div>
        <div className="flex gap-3">
          {(["critical", "high", "medium", "low"] as const).map((level) => (
            <div key={level} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: threatColors[level] }}
              />
              <span className="text-xs text-muted-foreground capitalize">{level}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="h-[500px]">
        <MapContainer
          center={[-6.7924, 39.2083]}
          zoom={6}
          className="h-full w-full"
          zoomControl={true}
        >
          <MapController />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution=""
          />
          {threats.map((t) => (
            <CircleMarker
              key={t.id}
              center={[t.latitude, t.longitude]}
              radius={threatRadius[t.threat_level]}
              pathOptions={{
                color: threatColors[t.threat_level],
                fillColor: threatColors[t.threat_level],
                fillOpacity: 0.4,
                weight: 2,
              }}
            >
              <Popup>
                <div className="text-background">
                  <p className="font-bold text-sm">{t.title}</p>
                  <p className="text-xs mt-1">{t.description}</p>
                  <p className="text-xs mt-1 font-mono">📍 {t.location_name}</p>
                  <span
                    className="inline-block mt-2 px-2 py-0.5 rounded text-xs font-bold uppercase"
                    style={{
                      backgroundColor: threatColors[t.threat_level],
                      color: "#fff",
                    }}
                  >
                    {t.threat_level}
                  </span>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
