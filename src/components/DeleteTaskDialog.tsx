import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Task } from "@/hooks/useTasks";

export default function DeleteTaskDialog({ task, onOpenChange }: { task: Task | null; onOpenChange: (o: boolean) => void }) {
  const { user } = useAuth();
  const handleDelete = async () => {
    if (!task || !user) return;
    const { error } = await supabase.from("tasks").delete().eq("id", task.id).eq("user_id", user.id);
    if (error) toast.error(error.message);
    else toast.success("Task deleted");
    onOpenChange(false);
  };

  return (
    <AlertDialog open={!!task} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this task?</AlertDialogTitle>
          <AlertDialogDescription>
            "{task?.title}" will be permanently removed. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
