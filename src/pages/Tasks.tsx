import { useMemo, useState } from "react";
import { Plus, Search, ListTodo } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTasks, type Task } from "@/hooks/useTasks";
import TaskFormDialog from "@/components/TaskFormDialog";
import TaskCard from "@/components/TaskCard";
import DeleteTaskDialog from "@/components/DeleteTaskDialog";

export default function Tasks() {
  const { tasks, loading } = useTasks();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [deleteTask, setDeleteTask] = useState<Task | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!t.title.toLowerCase().includes(q) && !(t.description?.toLowerCase().includes(q))) return false;
      }
      return true;
    });
  }, [tasks, search, statusFilter, priorityFilter]);

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage all your tasks in one place.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="shadow-elegant">
          <Plus className="h-4 w-4 mr-2" /> New task
        </Button>
      </div>

      <Card className="p-3 md:p-4 mb-4">
        <div className="grid gap-2 md:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks..." className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="md:w-40"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="md:w-40"><SelectValue placeholder="Priority" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {loading ? (
        <div className="grid gap-3 md:grid-cols-2">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-accent grid place-items-center mb-3">
            <ListTodo className="h-6 w-6 text-accent-foreground" />
          </div>
          <p className="font-medium">{tasks.length === 0 ? "No tasks yet" : "No tasks match your filters"}</p>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            {tasks.length === 0 ? "Get started by creating your first task." : "Try clearing search or filters."}
          </p>
          {tasks.length === 0 && (
            <Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4 mr-2" />New task</Button>
          )}
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((t) => (
            <TaskCard key={t.id} task={t} onEdit={setEditTask} onDelete={setDeleteTask} />
          ))}
        </div>
      )}

      <TaskFormDialog open={createOpen} onOpenChange={setCreateOpen} />
      <TaskFormDialog open={!!editTask} onOpenChange={(o) => !o && setEditTask(null)} task={editTask} />
      <DeleteTaskDialog task={deleteTask} onOpenChange={(o) => !o && setDeleteTask(null)} />
    </AppLayout>
  );
}
