import DashboardLayout from "@/components/DashboardLayout";
import IncidentReportForm from "@/components/IncidentReportForm";
import IncidentFeed from "@/components/IncidentFeed";
import { useAuth } from "@/contexts/AuthContext";

export default function Incidents() {
  const { isAdmin } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">
            {isAdmin ? "All Incident Reports" : "Incident Reporting"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isAdmin
              ? "View all incidents reported by field operators"
              : "Report security incidents as they occur"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {!isAdmin && <IncidentReportForm />}
          <IncidentFeed adminView={isAdmin} className={isAdmin ? "lg:col-span-2" : ""} />
        </div>
      </div>
    </DashboardLayout>
  );
}
