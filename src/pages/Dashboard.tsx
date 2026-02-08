import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import ThreatMap from "@/components/ThreatMap";
import IncidentFeed from "@/components/IncidentFeed";
import { AlertTriangle, Shield, Radio, FileWarning } from "lucide-react";

export default function Dashboard() {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState({ threats: 0, comms: 0, incidents: 0, critical: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const [{ count: threats }, { count: comms }, { count: incidents }, { count: critical }] =
        await Promise.all([
          supabase.from("threats").select("*", { count: "exact", head: true }).eq("is_active", true),
          supabase.from("communication_alerts").select("*", { count: "exact", head: true }).eq("is_reviewed", false),
          supabase.from("incidents").select("*", { count: "exact", head: true }).eq("status", "pending"),
          supabase.from("threats").select("*", { count: "exact", head: true }).eq("threat_level", "critical").eq("is_active", true),
        ]);
      setStats({
        threats: threats ?? 0,
        comms: comms ?? 0,
        incidents: incidents ?? 0,
        critical: critical ?? 0,
      });
    };
    fetchStats();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">
            {isAdmin ? "Command Center" : "Operations Dashboard"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time threat intelligence overview
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Active Threats" value={stats.threats} icon={AlertTriangle} variant="warning" />
          <StatCard title="Critical Alerts" value={stats.critical} icon={Shield} variant="danger" />
          <StatCard title="Unreviewed Comms" value={stats.comms} icon={Radio} variant="default" />
          <StatCard title="Pending Incidents" value={stats.incidents} icon={FileWarning} variant="success" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ThreatMap className="lg:col-span-2" />
          <IncidentFeed adminView={isAdmin} />
        </div>
      </div>
    </DashboardLayout>
  );
}
