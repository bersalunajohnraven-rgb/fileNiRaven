import { format, isPast, isToday } from "date-fns";
import { Calendar, Pencil, Trash2, MoreVertical } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Task, TaskStatus } from "@/hooks/useTasks";

const priorityStyles: Record<string, string> = {
  low: "bg-muted text-muted-foreground border-transparent",
  medium: "bg-warning/15 text-warning border-transparent",
  high: "bg-destructive/15 text-destructive border-transparent",
};

const statusStyles: Record<string, string> = {
  pending: "bg-secondary text-secondary-foreground",
  in_progress: "bg-accent text-accent-foreground",
  completed: "bg-success/15 text-success",
};

const statusLabel: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
};

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export default function TaskCard({ task, onEdit, onDelete }: Props) {
  const { user } = useAuth();
  const due = task.due_date ? new Date(task.due_date) : null;
  const overdue = due && isPast(due) && !isToday(due) && task.status !== "completed";
  const isDone = task.status === "completed";

  const toggleComplete = async (checked: boolean) => {
    if (!user) return;
    const newStatus: TaskStatus = checked ? "completed" : "pending";
    const { error } = await supabase.from("tasks").update({ status: newStatus }).eq("id", task.id).eq("user_id", user.id);
    if (error) toast.error(error.message);
  };

  const updateStatus = async (status: TaskStatus) => {
    if (!user) return;
    const { error } = await supabase.from("tasks").update({ status }).eq("id", task.id).eq("user_id", user.id);
    if (error) toast.error(error.message);
  };

  return (
    <Card className="p-4 hover:shadow-card transition-all duration-200 group animate-scale-in">
      <div className="flex items-start gap-3">
        <Checkbox checked={isDone} onCheckedChange={(c) => toggleComplete(!!c)} className="mt-1" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className={cn("font-medium leading-snug", isDone && "line-through text-muted-foreground")}>
              {task.title}
            </h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  <Pencil className="h-4 w-4 mr-2" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(task)} className="text-destructive focus:text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {task.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Badge variant="outline" className={priorityStyles[task.priority]}>{task.priority}</Badge>
            <Select value={task.status} onValueChange={(v) => updateStatus(v as TaskStatus)}>
              <SelectTrigger className={cn("h-7 px-2 text-xs border-transparent w-auto gap-1", statusStyles[task.status])}>
                <SelectValue>{statusLabel[task.status]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            {due && (
              <span className={cn("inline-flex items-center gap-1 text-xs", overdue ? "text-destructive" : "text-muted-foreground")}>
                <Calendar className="h-3 w-3" /> {format(due, "MMM d, yyyy")}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
