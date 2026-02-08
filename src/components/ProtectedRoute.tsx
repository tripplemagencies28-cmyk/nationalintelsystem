import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: Props) {
  const { user, isAdmin, isLoading, profile } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground font-mono">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (requireAdmin && !isAdmin) return <Navigate to="/dashboard" replace />;
  if (!profile?.is_approved && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background grid-bg">
        <div className="glass-card p-8 max-w-md text-center">
          <h2 className="text-lg font-bold mb-2">Account Pending Approval</h2>
          <p className="text-sm text-muted-foreground">
            Your account is awaiting administrator approval. Please contact your system administrator.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
