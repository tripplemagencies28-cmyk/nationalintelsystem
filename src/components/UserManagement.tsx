import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { UserPlus, CheckCircle, XCircle, Shield, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  username: string;
  is_approved: boolean;
  created_at: string;
}

export default function UserManagement() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newUser, setNewUser] = useState({ email: "", password: "", full_name: "", username: "" });
  const [creating, setCreating] = useState(false);

  const fetchProfiles = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setProfiles(data);
  };

  useEffect(() => { fetchProfiles(); }, []);

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-create-user", {
        body: newUser,
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success("User created successfully");
      setShowCreate(false);
      setNewUser({ email: "", password: "", full_name: "", username: "" });
      fetchProfiles();
    } catch (err: any) {
      toast.error(err.message || "Failed to create user");
    } finally {
      setCreating(false);
    }
  };

  const toggleApproval = async (profile: Profile) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_approved: !profile.is_approved })
      .eq("id", profile.id);
    if (error) {
      toast.error("Failed to update user");
    } else {
      toast.success(profile.is_approved ? "User access revoked" : "User approved");
      fetchProfiles();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">User Management</h2>
          <p className="text-sm text-muted-foreground">Create and manage operator accounts</p>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="w-4 h-4" />
              Create User
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Create New User Account</DialogTitle>
            </DialogHeader>
            <form onSubmit={createUser} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Full Name</Label>
                <Input
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                  required
                  className="bg-muted/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Username</Label>
                <Input
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  required
                  className="bg-muted/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Email</Label>
                <Input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                  className="bg-muted/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Password</Label>
                <Input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  required
                  minLength={8}
                  className="bg-muted/50"
                />
              </div>
              <Button type="submit" disabled={creating} className="w-full">
                {creating ? "Creating..." : "Create Account"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="glass-card divide-y divide-border/30">
        {profiles.map((p) => (
          <div key={p.id} className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm">{p.full_name}</p>
                <p className="text-xs text-muted-foreground font-mono">@{p.username}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className={cn(
                  "text-xs",
                  p.is_approved
                    ? "bg-success/20 text-success border-success/30"
                    : "bg-warning/20 text-warning border-warning/30"
                )}
              >
                {p.is_approved ? "Approved" : "Pending"}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleApproval(p)}
                className={p.is_approved ? "text-destructive hover:text-destructive" : "text-success hover:text-success"}
              >
                {p.is_approved ? (
                  <><XCircle className="w-4 h-4 mr-1" /> Revoke</>
                ) : (
                  <><CheckCircle className="w-4 h-4 mr-1" /> Approve</>
                )}
              </Button>
            </div>
          </div>
        ))}
        {profiles.length === 0 && (
          <div className="p-8 text-center text-muted-foreground text-sm">No users registered</div>
        )}
      </div>
    </div>
  );
}
