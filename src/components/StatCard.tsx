import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  variant?: "default" | "danger" | "warning" | "success";
}

const variantStyles = {
  default: "border-primary/20 bg-primary/5",
  danger: "border-destructive/20 bg-destructive/5 glow-danger",
  warning: "border-warning/20 bg-warning/5 glow-warning",
  success: "border-success/20 bg-success/5",
};

const iconStyles = {
  default: "text-primary",
  danger: "text-destructive",
  warning: "text-warning",
  success: "text-success",
};

export default function StatCard({ title, value, icon: Icon, trend, variant = "default" }: StatCardProps) {
  return (
    <div className={cn("glass-card p-5 transition-all hover:scale-[1.02]", variantStyles[variant])}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {trend && <p className="text-xs text-muted-foreground mt-1">{trend}</p>}
        </div>
        <div className={cn("p-2.5 rounded-lg bg-background/50", iconStyles[variant])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
