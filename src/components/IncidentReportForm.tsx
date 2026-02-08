import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Send } from "lucide-react";

export default function IncidentReportForm({ onSubmitted }: { onSubmitted?: () => void }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    severity: "medium" as "low" | "medium" | "high" | "critical",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error("You must be logged in");
    setLoading(true);
    try {
      const { error } = await supabase.from("incidents").insert({
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        severity: form.severity,
        reported_by: user.id,
      });
      if (error) throw error;
      toast.success("Incident reported successfully");
      setForm({ title: "", description: "", location: "", severity: "medium" });
      onSubmitted?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to report incident");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
      <h3 className="font-semibold text-sm mb-4">Report New Incident</h3>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Incident Title</Label>
        <Input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Brief incident title"
          required
          className="bg-muted/50"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Description</Label>
        <Textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Describe the incident in detail..."
          required
          rows={4}
          className="bg-muted/50 resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Location</Label>
          <Input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="e.g. Dar es Salaam"
            required
            className="bg-muted/50"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Severity</Label>
          <Select value={form.severity} onValueChange={(v: any) => setForm({ ...form, severity: v })}>
            <SelectTrigger className="bg-muted/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full gap-2">
        <Send className="w-4 h-4" />
        {loading ? "Submitting..." : "Submit Report"}
      </Button>
    </form>
  );
}
