import { useMemo, useState } from "react";
import { Plus, ListTodo, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTasks } from "@/hooks/useTasks";
import TaskFormDialog from "@/components/TaskFormDialog";
import TaskCard from "@/components/TaskCard";
import DeleteTaskDialog from "@/components/DeleteTaskDialog";
import type { Task } from "@/hooks/useTasks";
import { isPast, isToday } from "date-fns";

export default function Dashboard() {
  const { tasks, loading } = useTasks();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [deleteTask, setDeleteTask] = useState<Task | null>(null);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "completed").length;
    const pending = tasks.filter((t) => t.status !== "completed").length;
    const overdue = tasks.filter(
      (t) => t.due_date && isPast(new Date(t.due_date)) && !isToday(new Date(t.due_date)) && t.status !== "completed"
    ).length;
    return { total, completed, pending, overdue };
  }, [tasks]);

  const recent = tasks.slice(0, 5);

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Here's an overview of your tasks.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="shadow-elegant">
          <Plus className="h-4 w-4 mr-2" /> New task
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
        <StatCard label="Total" value={stats.total} icon={ListTodo} tone="primary" loading={loading} />
        <StatCard label="Pending" value={stats.pending} icon={Clock} tone="warning" loading={loading} />
        <StatCard label="Completed" value={stats.completed} icon={CheckCircle2} tone="success" loading={loading} />
        <StatCard label="Overdue" value={stats.overdue} icon={AlertTriangle} tone="destructive" loading={loading} />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Recent tasks</h2>
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
          </div>
        ) : recent.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-accent grid place-items-center mb-3">
              <ListTodo className="h-6 w-6 text-accent-foreground" />
            </div>
            <p className="font-medium">No tasks yet</p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">Create your first task to get started.</p>
            <Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4 mr-2" />New task</Button>
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {recent.map((t) => (
              <TaskCard key={t.id} task={t} onEdit={setEditTask} onDelete={setDeleteTask} />
            ))}
          </div>
        )}
      </div>

      <TaskFormDialog open={createOpen} onOpenChange={setCreateOpen} />
      <TaskFormDialog open={!!editTask} onOpenChange={(o) => !o && setEditTask(null)} task={editTask} />
      <DeleteTaskDialog task={deleteTask} onOpenChange={(o) => !o && setDeleteTask(null)} />
    </AppLayout>
  );
}

function StatCard({
  label, value, icon: Icon, tone, loading,
}: { label: string; value: number; icon: any; tone: "primary" | "warning" | "success" | "destructive"; loading: boolean }) {
  const toneMap = {
    primary: "bg-accent text-accent-foreground",
    warning: "bg-warning/15 text-warning",
    success: "bg-success/15 text-success",
    destructive: "bg-destructive/15 text-destructive",
  };
  return (
    <Card className="p-4 md:p-5 hover:shadow-card transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className={`h-8 w-8 rounded-lg grid place-items-center ${toneMap[tone]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-3xl font-semibold tracking-tight">{value}</div>}
    </Card>
  );
}
