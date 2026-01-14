import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import {
  Crown,
  Brain,
  Zap,
  Target,
  Users,
  Briefcase,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertTriangle,
  Send,
  Mic,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Eye,
  Network,
  Activity,
  MessageSquare,
  Sparkles,
  Shield,
  Loader2,
  ArrowRight,
  BarChart3,
  Layers,
  GitBranch,
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "pending" | "analyzing" | "routing" | "executing" | "completed" | "failed";
  assignedTo: string[];
  progress: number;
  estimatedTime: number;
  actualTime?: number;
  result?: any;
  createdAt: Date;
  updatedAt: Date;
}

interface Decision {
  id: string;
  taskId: string;
  question: string;
  options: string[];
  selectedOption?: string;
  reasoning: string;
  confidence: number;
  timestamp: Date;
}

interface AgentStatus {
  id: string;
  name: string;
  status: "idle" | "busy" | "offline";
  currentTask?: string;
  efficiency: number;
  tasksCompleted: number;
}

const PRIORITY_COLORS = {
  low: "bg-primary/20 text-primary border-primary/30",
  medium: "bg-warning/20 text-warning border-warning/30",
  high: "bg-warning/20 text-warning border-warning/30",
  critical: "bg-destructive/20 text-destructive border-destructive/30",
};

const STATUS_COLORS = {
  pending: "text-slate-400",
  analyzing: "text-primary",
  routing: "text-secondary",
  executing: "text-warning",
  completed: "text-success",
  failed: "text-destructive",
};

export default function MasterAgentCommand() {
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [command, setCommand] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [activeTab, setActiveTab] = useState("command");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Queries
  const tasksQuery = useQuery<Task[]>({
    queryKey: ["/api/master-agent/tasks"],
    refetchInterval: 2000,
  });

  const decisionsQuery = useQuery<Decision[]>({
    queryKey: ["/api/master-agent/decisions"],
    refetchInterval: 3000,
  });

  const agentsStatusQuery = useQuery<AgentStatus[]>({
    queryKey: ["/api/master-agent/agents-status"],
    refetchInterval: 5000,
  });

  const statsQuery = useQuery({
    queryKey: ["/api/master-agent/stats"],
    refetchInterval: 10000,
  });

  // Mutations
  const executeCommandMutation = useMutation({
    mutationFn: async (cmd: string) => {
      const res = await fetch("/api/master-agent/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: cmd }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to execute command");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/master-agent/tasks"] });
      toast({
        title: "Command Executed",
        description: data.message || "Master Agent is processing your command",
      });
      setCommand("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to execute command",
        variant: "destructive",
      });
    },
  });

  const approveDecisionMutation = useMutation({
    mutationFn: async ({ decisionId, option }: { decisionId: string; option: string }) => {
      const res = await fetch("/api/master-agent/approve-decision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decisionId, option }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to approve decision");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/master-agent/decisions"] });
      toast({ title: "Decision Approved", description: "Master Agent will proceed" });
    },
  });

  const handleExecuteCommand = () => {
    if (!command.trim()) return;
    executeCommandMutation.mutate(command);
  };

  const handleVoiceCommand = () => {
    setIsListening(!isListening);
    // هنا يمكن إضافة Web Speech API
    if (!isListening) {
      toast({ title: "Voice Input", description: "Listening... (Feature coming soon)" });
    }
  };

  const tasks = tasksQuery.data || [];
  const decisions = decisionsQuery.data || [];
  const agentsStatus = agentsStatusQuery.data || [];
  const stats = (statsQuery.data as any) || {
    totalTasks: 0,
    completedTasks: 0,
    activeTasks: 0,
    successRate: 0,
    avgExecutionTime: 0,
    decisionsToday: 0,
  };

  const activeTasks = tasks.filter((t) => ["analyzing", "routing", "executing"].includes(t.status));
  const pendingDecisions = decisions.filter((d) => !d.selectedOption);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [tasks]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <h1 className="text-lg font-semibold">MRF Executive Master Agent</h1>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 overflow-auto">
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 blur-3xl" />
          <div className="relative flex items-center justify-between p-6 bg-slate-900/50 backdrop-blur-xl border border-secondary/30 rounded-2xl shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 blur-xl opacity-50 animate-pulse" />
                <Crown className="relative w-12 h-12 text-warning" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                  MRF Executive Master Agent
                </h1>
                <p className="text-slate-400 mt-1">
                  Your Personal AI Representative with Full Authority
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-success/20 text-success border-success/50 px-4 py-2">
                <Activity className="w-4 h-4 mr-2 animate-pulse" />
                Online & Ready
              </Badge>
              <Badge className="bg-secondary/20 text-secondary border-secondary/50 px-4 py-2">
                <Shield className="w-4 h-4 mr-2" />
                Level 5 Authority
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-900/50 border-secondary/30 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-5 h-5 text-secondary" />
                <span className="text-2xl font-bold text-secondary">{stats.activeTasks}</span>
              </div>
              <p className="text-sm text-slate-400">Active Tasks</p>
              <Progress value={(stats.activeTasks / stats.totalTasks) * 100} className="mt-2 h-1" />
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-success/30 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-5 h-5 text-success" />
                <span className="text-2xl font-bold text-success">{stats.completedTasks}</span>
              </div>
              <p className="text-sm text-slate-400">Completed</p>
              <Progress value={stats.successRate} className="mt-2 h-1" />
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-primary/30 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Brain className="w-5 h-5 text-primary" />
                <span className="text-2xl font-bold text-primary">{stats.decisionsToday}</span>
              </div>
              <p className="text-sm text-slate-400">Decisions Made</p>
              <p className="text-xs text-primary/70 mt-2">Today</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-warning/30 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-5 h-5 text-warning" />
                <span className="text-2xl font-bold text-warning">
                  {stats.avgExecutionTime}s
                </span>
              </div>
              <p className="text-sm text-slate-400">Avg Execution</p>
              <p className="text-xs text-warning/70 mt-2">Per Task</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Control Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Command Center */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-slate-900/50 border-secondary/30 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-secondary" />
                  Command Center
                </CardTitle>
                <CardDescription>
                  Issue commands in natural language - I'll handle everything
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="e.g., 'Analyze market trends and create a report for investors' or 'Schedule team meeting and prepare agenda'"
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleExecuteCommand();
                      }
                    }}
                    className="min-h-[100px] bg-slate-800/50 border-secondary/30 text-white resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleExecuteCommand}
                    disabled={!command.trim() || executeCommandMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {executeCommandMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Executing...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Execute Command
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleVoiceCommand}
                    variant="outline"
                    className={`${
                      isListening
                        ? "bg-destructive/20 border-destructive text-destructive"
                        : "bg-slate-800/50 border-secondary/30"
                    }`}
                  >
                    <Mic className={`w-4 h-4 ${isListening ? "animate-pulse" : ""}`} />
                  </Button>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs text-slate-400">Quick Actions:</span>
                  {[
                    "Analyze competitors",
                    "Generate report",
                    "Schedule meeting",
                    "Review finances",
                    "Create proposal",
                  ].map((action) => (
                    <Badge
                      key={action}
                      variant="outline"
                      className="cursor-pointer hover:bg-secondary/20 transition-colors"
                      onClick={() => setCommand(action)}
                    >
                      {action}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Active Tasks */}
            <Card className="bg-slate-900/50 border-secondary/30 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-success" />
                  Active Tasks ({activeTasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4" ref={scrollRef}>
                  <div className="space-y-3">
                    {activeTasks.length === 0 ? (
                      <div className="text-center py-8 text-slate-400">
                        <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No active tasks</p>
                        <p className="text-sm">Issue a command to get started</p>
                      </div>
                    ) : (
                      activeTasks.map((task) => (
                        <div
                          key={task.id}
                          className="p-4 bg-slate-800/50 rounded-lg border border-secondary/20 hover:border-secondary/40 transition-all cursor-pointer"
                          onClick={() => setSelectedTask(task)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold">{task.title}</h3>
                                <Badge className={PRIORITY_COLORS[task.priority]}>
                                  {task.priority}
                                </Badge>
                              </div>
                              <p className="text-sm text-slate-400">{task.description}</p>
                            </div>
                            <span className={`text-sm ${STATUS_COLORS[task.status]}`}>
                              {task.status}
                            </span>
                          </div>

                          {/* Progress Bar */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-slate-400">
                              <span>Progress</span>
                              <span>{task.progress}%</span>
                            </div>
                            <Progress value={task.progress} className="h-2" />
                          </div>

                          {/* Assigned Agents */}
                          {task.assignedTo.length > 0 && (
                            <div className="mt-3 flex items-center gap-2">
                              <Users className="w-3 h-3 text-slate-400" />
                              <div className="flex flex-wrap gap-1">
                                {task.assignedTo.map((agent, idx) => (
                                  <Badge
                                    key={idx}
                                    variant="outline"
                                    className="text-xs bg-primary/10 border-primary/30"
                                  >
                                    {agent}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Time Estimate */}
                          <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                            <Clock className="w-3 h-3" />
                            <span>
                              ETA: {task.estimatedTime}s
                              {task.actualTime && ` (Actual: ${task.actualTime}s)`}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Right: Decisions & Agents */}
          <div className="space-y-6">
            {/* Pending Decisions */}
            <Card className="bg-slate-900/50 border-warning/30 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  Pending Decisions ({pendingDecisions.length})
                </CardTitle>
                <CardDescription>Awaiting your approval</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[250px]">
                  <div className="space-y-3">
                    {pendingDecisions.length === 0 ? (
                      <div className="text-center py-4 text-slate-400 text-sm">
                        No pending decisions
                      </div>
                    ) : (
                      pendingDecisions.map((decision) => (
                        <div
                          key={decision.id}
                          className="p-3 bg-warning/5 border border-warning/30 rounded-lg"
                        >
                          <p className="text-sm font-medium mb-2">{decision.question}</p>
                          <p className="text-xs text-slate-400 mb-3">{decision.reasoning}</p>
                          <div className="flex items-center gap-2 mb-2 text-xs text-slate-400">
                            <Brain className="w-3 h-3" />
                            <span>Confidence: {(decision.confidence * 100).toFixed(0)}%</span>
                          </div>
                          <div className="space-y-2">
                            {decision.options.map((option, idx) => (
                              <Button
                                key={idx}
                                size="sm"
                                variant="outline"
                                className="w-full text-left justify-start text-xs hover:bg-warning/20"
                                onClick={() =>
                                  approveDecisionMutation.mutate({
                                    decisionId: decision.id,
                                    option,
                                  })
                                }
                              >
                                <ArrowRight className="w-3 h-3 mr-2" />
                                {option}
                              </Button>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Agents Status */}
            <Card className="bg-slate-900/50 border-primary/30 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="w-5 h-5 text-primary" />
                  Agents Network
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {agentsStatus.length === 0 ? (
                      <div className="text-center py-4 text-slate-400 text-sm">
                        Loading agents...
                      </div>
                    ) : (
                      agentsStatus.map((agent) => (
                        <div
                          key={agent.id}
                          className="p-3 bg-slate-800/50 rounded-lg border border-slate-700"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  agent.status === "busy"
                                    ? "bg-yellow-400 animate-pulse"
                                    : agent.status === "idle"
                                    ? "bg-success"
                                    : "bg-slate-600"
                                }`}
                              />
                              <span className="text-sm font-medium">{agent.name}</span>
                            </div>
                            <Badge
                              variant="outline"
                              className="text-xs"
                              title={`Efficiency: ${agent.efficiency}%`}
                            >
                              {agent.efficiency}%
                            </Badge>
                          </div>
                          {agent.currentTask && (
                            <p className="text-xs text-slate-400 truncate">
                              {agent.currentTask}
                            </p>
                          )}
                          <p className="text-xs text-slate-500 mt-1">
                            {agent.tasksCompleted} tasks completed
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Execution Flow Visualization */}
        <Card className="bg-slate-900/50 border-secondary/30 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-secondary" />
              Execution Flow
            </CardTitle>
            <CardDescription>How Master Agent processes your commands</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-secondary/20 border border-secondary rounded-full flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-secondary" />
                </div>
                <span className="text-xs text-slate-400">Your Command</span>
              </div>

              <ArrowRight className="text-slate-600" />

              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-primary/20 border border-primary rounded-full flex items-center justify-center">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <span className="text-xs text-slate-400">AI Analysis</span>
              </div>

              <ArrowRight className="text-slate-600" />

              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-warning/20 border border-warning rounded-full flex items-center justify-center">
                  <Layers className="w-6 h-6 text-warning" />
                </div>
                <span className="text-xs text-slate-400">Task Routing</span>
              </div>

              <ArrowRight className="text-slate-600" />

              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-warning/20 border border-warning rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-warning" />
                </div>
                <span className="text-xs text-slate-400">Agent Delegation</span>
              </div>

              <ArrowRight className="text-slate-600" />

              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-success/20 border border-success rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-success" />
                </div>
                <span className="text-xs text-slate-400">Result Delivered</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedTask(null)}
        >
          <Card
            className="max-w-2xl w-full bg-slate-900 border-secondary/30"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Task Details</CardTitle>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedTask(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">{selectedTask.title}</h3>
                <p className="text-slate-400 text-sm">{selectedTask.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-slate-400">Priority</span>
                  <Badge className={`${PRIORITY_COLORS[selectedTask.priority]} block mt-1`}>
                    {selectedTask.priority}
                  </Badge>
                </div>
                <div>
                  <span className="text-xs text-slate-400">Status</span>
                  <p className={`${STATUS_COLORS[selectedTask.status]} font-medium mt-1`}>
                    {selectedTask.status}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-400 block mb-2">Progress</span>
                <Progress value={selectedTask.progress} className="h-3" />
                <p className="text-xs text-slate-400 mt-1">{selectedTask.progress}%</p>
              </div>

              {selectedTask.assignedTo.length > 0 && (
                <div>
                  <span className="text-xs text-slate-400 block mb-2">Assigned To</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedTask.assignedTo.map((agent, idx) => (
                      <Badge key={idx} variant="outline">
                        {agent}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedTask.result && (
                <div>
                  <span className="text-xs text-slate-400 block mb-2">Result</span>
                  <div className="p-3 bg-slate-800 rounded-lg">
                    <pre className="text-xs text-slate-300 whitespace-pre-wrap">
                      {JSON.stringify(selectedTask.result, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
