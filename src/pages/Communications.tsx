import DashboardLayout from "@/components/DashboardLayout";
import CommunicationMonitor from "@/components/CommunicationMonitor";

export default function Communications() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Communication Monitoring</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Network surveillance for hate speech and threat communications
          </p>
        </div>
        <CommunicationMonitor />
      </div>
    </DashboardLayout>
  );
}
