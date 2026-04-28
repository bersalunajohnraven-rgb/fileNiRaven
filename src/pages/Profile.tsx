import { useEffect, useState } from "react";
import { Loader2, User as UserIcon } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const nameSchema = z.string().trim().min(1, "Required").max(60);

export default function Profile() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
      setDisplayName(data?.display_name ?? "");
      setAvatarUrl(data?.avatar_url ?? null);
      setLoading(false);
    });
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try { nameSchema.parse(displayName); }
    catch (err) { if (err instanceof z.ZodError) return toast.error(err.errors[0].message); }
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ display_name: displayName.trim() }).eq("id", user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Profile updated");
  };

  const initials = (displayName || user?.email || "?").slice(0, 2).toUpperCase();

  return (
    <AppLayout>
      <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-1">Profile</h1>
      <p className="text-muted-foreground text-sm mb-6">Manage your account information.</p>

      <Card className="p-6 max-w-xl">
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="h-16 w-16">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
            <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold">
              {loading ? <UserIcon className="h-6 w-6" /> : initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="font-medium truncate">{displayName || "Your name"}</div>
            <div className="text-sm text-muted-foreground truncate">{user?.email}</div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dn">Display name</Label>
            <Input id="dn" value={displayName} onChange={(e) => setDisplayName(e.target.value)} disabled={loading} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email ?? ""} disabled />
          </div>
          <Button type="submit" disabled={saving || loading}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Save changes
          </Button>
        </form>
      </Card>
    </AppLayout>
  );
}
