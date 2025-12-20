import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { VIRTUAL_AGENTS } from "@shared/schema";
import { 
  Users, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Target,
  Zap,
  Activity,
  Crown,
  Settings,
  Radio,
  Brain,
  Camera,
  FileText,
  Scale,
  TrendingUp,
  Palette,
  Search
} from "lucide-react";
import { format } from "date-fns";

interface TeamTask {
  id: string;
  title: string;
  description: string | null;
  assigned_agent: string | null;
  priority: string;
  status: string;
  due_date: string | null;
  tags: string[] | null;
  created_at: string;
}

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description: string | null;
  agent_id: string | null;
  created_at: string;
}

const agentIcons: Record<string, any> = {
  mrf: Crown,
  "l0-ops": Settings,
  "l0-comms": Radio,
  "l0-intel": Brain,
  photographer: Camera,
  grants: FileText,
  legal: Scale,
  finance: TrendingUp,
  creative: Palette,
  researcher: Search,
};

const priorityColors: Record<string, string> = {
  high: "bg-destructive text-destructive-foreground",
  medium: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400",
  low: "bg-muted text-muted-foreground",
};

const statusColors: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  in_progress: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
  completed: "bg-green-500/20 text-green-600 dark:text-green-400",
  blocked: "bg-destructive/20 text-destructive",
};

export default function TeamCommandCenter() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assignedAgent: "",
    priority: "medium",
    tags: "",
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery<TeamTask[]>({
    queryKey: ["/api/team/tasks"],
  });

  const { data: activities = [] } = useQuery<ActivityItem[]>({
    queryKey: ["/api/activity"],
  });

  const createTaskMutation = useMutation({
    mutationFn: async (task: typeof newTask) => {
      const res = await apiRequest("POST", "/api/team/tasks", {
        title: task.title,
        description: task.description || null,
        assignedAgent: task.assignedAgent || null,
        priority: task.priority,
        tags: task.tags ? task.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team/tasks"] });
      toast({ title: "Task Created", description: "New task has been added" });
      setIsCreateOpen(false);
      setNewTask({ title: "", description: "", assignedAgent: "", priority: "medium", tags: "" });
    },
    onError: (e: any) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/team/tasks/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team/tasks"] });
      toast({ title: "Task Updated" });
    },
  });

  const pendingTasks = tasks.filter(t => t.status === "pending");
  const inProgressTasks = tasks.filter(t => t.status === "in_progress");
  const completedTasks = tasks.filter(t => t.status === "completed");

  const getAgentName = (agentId: string | null) => {
    if (!agentId) return "Unassigned";
    const agent = VIRTUAL_AGENTS.find(a => a.id === agentId);
    return agent?.name || agentId;
  };

  const AgentIcon = ({ agentId }: { agentId: string | null }) => {
    if (!agentId) return <Users className="h-4 w-4" />;
    const Icon = agentIcons[agentId] || Users;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-card/50">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-page-title">
              <Target className="h-6 w-6 text-primary" />
              Team Command Center
            </h1>
            <p className="text-muted-foreground text-sm">Manage tasks and coordinate your AI team</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-task">
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="Task title"
                  value={newTask.title}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  data-testid="input-task-title"
                />
                <Textarea
                  placeholder="Description (optional)"
                  value={newTask.description}
                  onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  data-testid="input-task-description"
                />
                <Select 
                  value={newTask.assignedAgent} 
                  onValueChange={(v) => setNewTask(prev => ({ ...prev, assignedAgent: v }))}
                >
                  <SelectTrigger data-testid="select-agent">
                    <SelectValue placeholder="Assign to agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {VIRTUAL_AGENTS.map(agent => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name} - {agent.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select 
                  value={newTask.priority} 
                  onValueChange={(v) => setNewTask(prev => ({ ...prev, priority: v }))}
                >
                  <SelectTrigger data-testid="select-priority">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Tags (comma separated)"
                  value={newTask.tags}
                  onChange={(e) => setNewTask(prev => ({ ...prev, tags: e.target.value }))}
                  data-testid="input-task-tags"
                />
                <Button 
                  className="w-full" 
                  onClick={() => createTaskMutation.mutate(newTask)}
                  disabled={!newTask.title.trim() || createTaskMutation.isPending}
                  data-testid="button-submit-task"
                >
                  {createTaskMutation.isPending ? "Creating..." : "Create Task"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <Card data-testid="card-stats-pending">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-md bg-yellow-500/20">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingTasks.length}</p>
                <p className="text-sm text-muted-foreground">Pending Tasks</p>
              </div>
            </CardContent>
          </Card>
          <Card data-testid="card-stats-progress">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-md bg-blue-500/20">
                <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{inProgressTasks.length}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </CardContent>
          </Card>
          <Card data-testid="card-stats-completed">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-md bg-green-500/20">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedTasks.length}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Card className="xl:col-span-2" data-testid="card-task-board">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Task Board
              </CardTitle>
              <CardDescription>Drag tasks to update their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Pending
                  </h3>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2 pr-2">
                      {pendingTasks.map(task => (
                        <Card key={task.id} className="p-3 hover-elevate cursor-pointer" data-testid={`card-task-${task.id}`}>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="font-medium text-sm">{task.title}</h4>
                            <Badge variant="outline" className={priorityColors[task.priority]}>
                              {task.priority}
                            </Badge>
                          </div>
                          {task.description && (
                            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{task.description}</p>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <AgentIcon agentId={task.assigned_agent} />
                              <span>{getAgentName(task.assigned_agent)}</span>
                            </div>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => updateTaskMutation.mutate({ id: task.id, status: "in_progress" })}
                              data-testid={`button-start-${task.id}`}
                            >
                              Start
                            </Button>
                          </div>
                        </Card>
                      ))}
                      {pendingTasks.length === 0 && (
                        <p className="text-muted-foreground text-sm text-center py-8">No pending tasks</p>
                      )}
                    </div>
                  </ScrollArea>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Zap className="h-4 w-4" /> In Progress
                  </h3>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2 pr-2">
                      {inProgressTasks.map(task => (
                        <Card key={task.id} className="p-3 hover-elevate cursor-pointer border-blue-500/30" data-testid={`card-task-${task.id}`}>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="font-medium text-sm">{task.title}</h4>
                            <Badge variant="outline" className={priorityColors[task.priority]}>
                              {task.priority}
                            </Badge>
                          </div>
                          {task.description && (
                            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{task.description}</p>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <AgentIcon agentId={task.assigned_agent} />
                              <span>{getAgentName(task.assigned_agent)}</span>
                            </div>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => updateTaskMutation.mutate({ id: task.id, status: "completed" })}
                              data-testid={`button-complete-${task.id}`}
                            >
                              Complete
                            </Button>
                          </div>
                        </Card>
                      ))}
                      {inProgressTasks.length === 0 && (
                        <p className="text-muted-foreground text-sm text-center py-8">No tasks in progress</p>
                      )}
                    </div>
                  </ScrollArea>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" /> Completed
                  </h3>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2 pr-2">
                      {completedTasks.slice(0, 10).map(task => (
                        <Card key={task.id} className="p-3 opacity-70" data-testid={`card-task-${task.id}`}>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="font-medium text-sm line-through">{task.title}</h4>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <AgentIcon agentId={task.assigned_agent} />
                            <span>{getAgentName(task.assigned_agent)}</span>
                          </div>
                        </Card>
                      ))}
                      {completedTasks.length === 0 && (
                        <p className="text-muted-foreground text-sm text-center py-8">No completed tasks</p>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-activity-feed">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Activity Feed
              </CardTitle>
              <CardDescription>Recent team activity</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[450px]">
                <div className="space-y-3 pr-2">
                  {activities.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-8">No recent activity</p>
                  ) : (
                    activities.map(activity => (
                      <div key={activity.id} className="flex gap-3 p-2 rounded-md hover:bg-muted/50" data-testid={`activity-${activity.id}`}>
                        <div className="p-2 rounded-full bg-primary/10">
                          <Activity className="h-3 w-3 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{activity.title}</p>
                          {activity.description && (
                            <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(activity.created_at), "MMM d, h:mm a")}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
