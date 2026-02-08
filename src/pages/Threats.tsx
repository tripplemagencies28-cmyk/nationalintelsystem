import DashboardLayout from "@/components/DashboardLayout";
import ThreatMap from "@/components/ThreatMap";

export default function Threats() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Threat Intelligence Map</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Early warning system — active threats with geolocation data
          </p>
        </div>
        <ThreatMap />
      </div>
    </DashboardLayout>
  );
}
