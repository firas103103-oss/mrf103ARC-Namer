import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { VIRTUAL_AGENTS } from "@shared/schema";
import { 
  Workflow, 
  Plus, 
  Play, 
  Pause,
  CheckCircle2,
  Settings2,
  Cpu,
  Network,
  Terminal,
  Clock,
  ArrowRight,
  Trash2,
  Bell,
  Bot,
  GripVertical,
  Save
} from "lucide-react";
import { format } from "date-fns";

interface WorkflowSimulation {
  id: string;
  name: string;
  description: string | null;
  steps: WorkflowStep[];
  status: string;
  lastRunAt: string | null;
  lastResult: { status: string; timestamp: string; stepResults?: StepResult[] } | null;
  createdAt: string;
}

interface WorkflowStep {
  id: string;
  name: string;
  type: "api_call" | "ai_agent" | "notification" | "delay";
  config: StepConfig;
}

interface StepConfig {
  agentId?: string;
  endpoint?: string;
  method?: string;
  message?: string;
  channel?: string;
  delayMs?: number;
  params?: Record<string, string>;
}

interface StepResult {
  stepId: string;
  status: "success" | "error";
  duration: number;
  output?: unknown;
}

const stepTypeIcons: Record<string, typeof Cpu> = {
  api_call: Network,
  ai_agent: Bot,
  notification: Bell,
  delay: Clock,
};

const stepTypeColors: Record<string, string> = {
  api_call: "bg-green-500/20 text-green-600 dark:text-green-400",
  ai_agent: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
  notification: "bg-purple-500/20 text-purple-600 dark:text-purple-400",
  delay: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400",
};

const stepTypeLabels: Record<string, string> = {
  api_call: "API Call",
  ai_agent: "AI Agent",
  notification: "Notification",
  delay: "Delay",
};

function generateId(): string {
  return `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export default function OperationsSimulator() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAddStepOpen, setIsAddStepOpen] = useState(false);
  const [selectedSimulation, setSelectedSimulation] = useState<WorkflowSimulation | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [runLogs, setRunLogs] = useState<string[]>([]);
  const [editedSteps, setEditedSteps] = useState<WorkflowStep[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const [newSimulation, setNewSimulation] = useState({
    name: "",
    description: "",
  });

  const [newStep, setNewStep] = useState<{
    name: string;
    type: WorkflowStep["type"];
    config: StepConfig;
  }>({
    name: "",
    type: "api_call",
    config: {},
  });

  const { data: simulations = [], isLoading } = useQuery<WorkflowSimulation[]>({
    queryKey: ["/api/simulations"],
  });

  const createMutation = useMutation({
    mutationFn: async (sim: typeof newSimulation) => {
      const res = await apiRequest("POST", "/api/simulations", {
        name: sim.name,
        description: sim.description || null,
        steps: [],
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/simulations"] });
      toast({ title: "Simulation Created" });
      setIsCreateOpen(false);
      setNewSimulation({ name: "", description: "" });
      if (data) {
        setSelectedSimulation(data);
        setEditedSteps([]);
        setHasUnsavedChanges(false);
      }
    },
    onError: (e: Error) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, steps }: { id: string; steps: WorkflowStep[] }) => {
      const res = await apiRequest("PATCH", `/api/simulations/${id}`, { steps });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/simulations"] });
      toast({ title: "Workflow Saved" });
      setHasUnsavedChanges(false);
    },
    onError: (e: Error) => {
      toast({ title: "Error saving workflow", description: e.message, variant: "destructive" });
    },
  });

  const runMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/simulations/${id}/run`, {});
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/simulations"] });
      toast({ title: "Simulation Complete" });
      setIsRunning(false);
      if (selectedSimulation && data) {
        setSelectedSimulation({ ...selectedSimulation, lastResult: data.result, lastRunAt: new Date().toISOString() });
      }
    },
    onError: (e: Error) => {
      toast({ title: "Simulation Failed", description: e.message, variant: "destructive" });
      setIsRunning(false);
    },
  });

  const handleSelectSimulation = (sim: WorkflowSimulation) => {
    if (hasUnsavedChanges) {
      if (!confirm("You have unsaved changes. Discard them?")) return;
    }
    setSelectedSimulation(sim);
    setEditedSteps(sim.steps || []);
    setHasUnsavedChanges(false);
    setRunLogs([]);
  };

  const handleRunSimulation = async (sim: WorkflowSimulation) => {
    if (hasUnsavedChanges) {
      toast({ title: "Save your changes first", description: "Please save the workflow before running.", variant: "destructive" });
      return;
    }
    
    setIsRunning(true);
    setRunLogs([]);

    const steps = sim.steps || [];
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      setRunLogs(prev => [...prev, `[${format(new Date(), "HH:mm:ss")}] Starting step: ${step.name} (${stepTypeLabels[step.type]})`]);
      
      if (step.type === "delay") {
        const delay = step.config.delayMs || 1000;
        setRunLogs(prev => [...prev, `[${format(new Date(), "HH:mm:ss")}] Waiting ${delay}ms...`]);
        await new Promise(r => setTimeout(r, Math.min(delay, 3000)));
      } else {
        await new Promise(r => setTimeout(r, 800));
      }
      
      setRunLogs(prev => [...prev, `[${format(new Date(), "HH:mm:ss")}] Completed step: ${step.name}`]);
    }

    if (steps.length === 0) {
      setRunLogs(prev => [...prev, `[${format(new Date(), "HH:mm:ss")}] No steps defined. Add workflow steps to simulate.`]);
    }

    runMutation.mutate(sim.id);
  };

  const handleStopSimulation = () => {
    setIsRunning(false);
    setRunLogs(prev => [...prev, `[${format(new Date(), "HH:mm:ss")}] Simulation stopped by user`]);
  };

  const handleAddStep = () => {
    if (!newStep.name.trim()) {
      toast({ title: "Step name required", variant: "destructive" });
      return;
    }

    const step: WorkflowStep = {
      id: generateId(),
      name: newStep.name,
      type: newStep.type,
      config: { ...newStep.config },
    };

    setEditedSteps(prev => [...prev, step]);
    setHasUnsavedChanges(true);
    setIsAddStepOpen(false);
    setNewStep({ name: "", type: "api_call", config: {} });
    toast({ title: "Step added" });
  };

  const handleRemoveStep = (stepId: string) => {
    setEditedSteps(prev => prev.filter(s => s.id !== stepId));
    setHasUnsavedChanges(true);
  };

  const handleSaveWorkflow = () => {
    if (!selectedSimulation) return;
    updateMutation.mutate({ id: selectedSimulation.id, steps: editedSteps });
  };

  const renderStepConfig = () => {
    switch (newStep.type) {
      case "api_call":
        return (
          <div className="space-y-4">
            <div>
              <Label>HTTP Method</Label>
              <Select
                value={newStep.config.method || "GET"}
                onValueChange={(v) => setNewStep(prev => ({ ...prev, config: { ...prev.config, method: v } }))}
              >
                <SelectTrigger data-testid="select-http-method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Endpoint URL</Label>
              <Input
                placeholder="/api/endpoint"
                value={newStep.config.endpoint || ""}
                onChange={(e) => setNewStep(prev => ({ ...prev, config: { ...prev.config, endpoint: e.target.value } }))}
                data-testid="input-endpoint"
              />
            </div>
          </div>
        );

      case "ai_agent":
        return (
          <div className="space-y-4">
            <div>
              <Label>Select Agent</Label>
              <Select
                value={newStep.config.agentId || ""}
                onValueChange={(v) => setNewStep(prev => ({ ...prev, config: { ...prev.config, agentId: v } }))}
              >
                <SelectTrigger data-testid="select-agent">
                  <SelectValue placeholder="Choose an agent" />
                </SelectTrigger>
                <SelectContent>
                  {VIRTUAL_AGENTS.map(agent => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name} - {agent.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Prompt/Message</Label>
              <Textarea
                placeholder="Enter the message or prompt for the agent..."
                value={newStep.config.message || ""}
                onChange={(e) => setNewStep(prev => ({ ...prev, config: { ...prev.config, message: e.target.value } }))}
                data-testid="input-agent-message"
              />
            </div>
          </div>
        );

      case "notification":
        return (
          <div className="space-y-4">
            <div>
              <Label>Channel</Label>
              <Select
                value={newStep.config.channel || "email"}
                onValueChange={(v) => setNewStep(prev => ({ ...prev, config: { ...prev.config, channel: v } }))}
              >
                <SelectTrigger data-testid="select-channel">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="slack">Slack</SelectItem>
                  <SelectItem value="webhook">Webhook</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Message</Label>
              <Textarea
                placeholder="Notification message content..."
                value={newStep.config.message || ""}
                onChange={(e) => setNewStep(prev => ({ ...prev, config: { ...prev.config, message: e.target.value } }))}
                data-testid="input-notification-message"
              />
            </div>
          </div>
        );

      case "delay":
        return (
          <div className="space-y-4">
            <div>
              <Label>Delay (milliseconds)</Label>
              <Input
                type="number"
                placeholder="1000"
                value={newStep.config.delayMs || ""}
                onChange={(e) => setNewStep(prev => ({ ...prev, config: { ...prev.config, delayMs: parseInt(e.target.value) || 0 } }))}
                data-testid="input-delay"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {newStep.config.delayMs ? `${(newStep.config.delayMs / 1000).toFixed(1)} seconds` : "Enter delay in milliseconds"}
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-card/50">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-page-title">
              <Workflow className="h-6 w-6 text-primary" />
              Operations Simulator
            </h1>
            <p className="text-muted-foreground text-sm">Test and debug automation workflows</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-simulation">
                <Plus className="h-4 w-4 mr-2" />
                New Simulation
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Simulation</DialogTitle>
                <DialogDescription>Create a new workflow simulation to test automation flows.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    placeholder="Simulation name"
                    value={newSimulation.name}
                    onChange={(e) => setNewSimulation(prev => ({ ...prev, name: e.target.value }))}
                    data-testid="input-simulation-name"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Description (optional)"
                    value={newSimulation.description}
                    onChange={(e) => setNewSimulation(prev => ({ ...prev, description: e.target.value }))}
                    data-testid="input-simulation-description"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={() => createMutation.mutate(newSimulation)}
                  disabled={!newSimulation.name.trim() || createMutation.isPending}
                  data-testid="button-submit-simulation"
                >
                  {createMutation.isPending ? "Creating..." : "Create Simulation"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
          <div className="border-r p-4 overflow-auto">
            <h2 className="font-semibold mb-4">Saved Simulations</h2>
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="space-y-2 pr-2">
                {isLoading ? (
                  <>
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </>
                ) : simulations.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-8">
                    No simulations yet. Create your first one.
                  </p>
                ) : (
                  simulations.map(sim => (
                    <Card 
                      key={sim.id} 
                      className={`p-3 cursor-pointer hover-elevate ${selectedSimulation?.id === sim.id ? 'border-primary' : ''}`}
                      onClick={() => handleSelectSimulation(sim)}
                      data-testid={`card-simulation-${sim.id}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-medium text-sm">{sim.name}</h3>
                        <Badge variant="outline">
                          {sim.status}
                        </Badge>
                      </div>
                      {sim.description && (
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{sim.description}</p>
                      )}
                      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground flex-wrap">
                        <span>{(sim.steps || []).length} steps</span>
                        {sim.lastRunAt && (
                          <span>Last run: {format(new Date(sim.lastRunAt), "MMM d, HH:mm")}</span>
                        )}
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="lg:col-span-2 flex flex-col">
            {selectedSimulation ? (
              <>
                <div className="p-4 border-b bg-muted/30">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <h2 className="text-xl font-semibold flex items-center gap-2">
                        {selectedSimulation.name}
                        {hasUnsavedChanges && <Badge variant="outline">Unsaved</Badge>}
                      </h2>
                      <p className="text-sm text-muted-foreground">{selectedSimulation.description || "No description"}</p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {hasUnsavedChanges && (
                        <Button 
                          variant="outline" 
                          onClick={handleSaveWorkflow}
                          disabled={updateMutation.isPending}
                          data-testid="button-save-workflow"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {updateMutation.isPending ? "Saving..." : "Save"}
                        </Button>
                      )}
                      {isRunning ? (
                        <Button variant="outline" onClick={handleStopSimulation} data-testid="button-stop">
                          <Pause className="h-4 w-4 mr-2" />
                          Stop
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => handleRunSimulation(selectedSimulation)} 
                          disabled={runMutation.isPending || hasUnsavedChanges}
                          data-testid="button-run"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          {runMutation.isPending ? "Running..." : "Run Simulation"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <Tabs defaultValue="workflow" className="flex-1 flex flex-col">
                  <TabsList className="mx-4 mt-4">
                    <TabsTrigger value="workflow" data-testid="tab-workflow">Workflow</TabsTrigger>
                    <TabsTrigger value="logs" data-testid="tab-logs">Run Logs</TabsTrigger>
                    <TabsTrigger value="results" data-testid="tab-results">Results</TabsTrigger>
                  </TabsList>

                  <TabsContent value="workflow" className="flex-1 p-4 overflow-auto">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between gap-4">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Settings2 className="h-5 w-5 text-primary" />
                            Workflow Steps
                          </CardTitle>
                          <CardDescription>Define the steps in your simulation</CardDescription>
                        </div>
                        <Dialog open={isAddStepOpen} onOpenChange={setIsAddStepOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm" data-testid="button-add-step">
                              <Plus className="h-4 w-4 mr-2" />
                              Add Step
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Add Workflow Step</DialogTitle>
                              <DialogDescription>Configure a new step for your workflow.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                              <div>
                                <Label>Step Name</Label>
                                <Input
                                  placeholder="e.g., Fetch user data"
                                  value={newStep.name}
                                  onChange={(e) => setNewStep(prev => ({ ...prev, name: e.target.value }))}
                                  data-testid="input-step-name"
                                />
                              </div>
                              <div>
                                <Label>Step Type</Label>
                                <Select
                                  value={newStep.type}
                                  onValueChange={(v: WorkflowStep["type"]) => setNewStep(prev => ({ ...prev, type: v, config: {} }))}
                                >
                                  <SelectTrigger data-testid="select-step-type">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="api_call">
                                      <div className="flex items-center gap-2">
                                        <Network className="h-4 w-4" />
                                        API Call
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="ai_agent">
                                      <div className="flex items-center gap-2">
                                        <Bot className="h-4 w-4" />
                                        AI Agent
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="notification">
                                      <div className="flex items-center gap-2">
                                        <Bell className="h-4 w-4" />
                                        Notification
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="delay">
                                      <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        Delay
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              {renderStepConfig()}
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsAddStepOpen(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleAddStep} data-testid="button-confirm-add-step">
                                Add Step
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </CardHeader>
                      <CardContent>
                        {editedSteps.length === 0 ? (
                          <div className="text-center py-12 text-muted-foreground">
                            <Workflow className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No steps defined yet</p>
                            <p className="text-sm">Add steps to build your workflow simulation</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {editedSteps.map((step, index) => {
                              const StepIcon = stepTypeIcons[step.type] || Settings2;
                              const agent = step.config.agentId 
                                ? VIRTUAL_AGENTS.find(a => a.id === step.config.agentId) 
                                : null;
                              
                              return (
                                <div key={step.id} className="group">
                                  <div className="flex items-center gap-3 p-3 rounded-md border bg-muted/30">
                                    <div className="text-muted-foreground cursor-grab">
                                      <GripVertical className="h-4 w-4" />
                                    </div>
                                    <div className={`p-2 rounded-md ${stepTypeColors[step.type]}`}>
                                      <StepIcon className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-sm">{step.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {stepTypeLabels[step.type]}
                                        {step.type === "ai_agent" && agent && ` - ${agent.name}`}
                                        {step.type === "api_call" && step.config.endpoint && ` - ${step.config.method || 'GET'} ${step.config.endpoint}`}
                                        {step.type === "notification" && step.config.channel && ` - ${step.config.channel}`}
                                        {step.type === "delay" && step.config.delayMs && ` - ${step.config.delayMs}ms`}
                                      </p>
                                    </div>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => handleRemoveStep(step.id)}
                                      data-testid={`button-remove-step-${step.id}`}
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </div>
                                  {index < editedSteps.length - 1 && (
                                    <div className="flex justify-center py-1">
                                      <ArrowRight className="h-4 w-4 text-muted-foreground rotate-90" />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="logs" className="flex-1 p-4 overflow-auto">
                    <Card className="h-full">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Terminal className="h-5 w-5 text-primary" />
                          Execution Logs
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[400px] bg-muted/50 rounded-md p-4 font-mono text-sm">
                          {runLogs.length === 0 ? (
                            <p className="text-muted-foreground">No logs yet. Run the simulation to see output.</p>
                          ) : (
                            runLogs.map((log, i) => (
                              <div key={i} className="text-muted-foreground">{log}</div>
                            ))
                          )}
                          {isRunning && (
                            <div className="flex items-center gap-2 text-primary mt-2">
                              <div className="animate-pulse">Running...</div>
                            </div>
                          )}
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="results" className="flex-1 p-4 overflow-auto">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                          Results
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedSimulation.lastResult ? (
                          <div className="space-y-4">
                            <div className="flex items-center gap-3 flex-wrap">
                              <Badge 
                                variant="outline" 
                                className={selectedSimulation.lastResult.status === "success" 
                                  ? "bg-green-500/20 text-green-600" 
                                  : "bg-red-500/20 text-red-600"}
                              >
                                {selectedSimulation.lastResult.status}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {format(new Date(selectedSimulation.lastResult.timestamp), "MMM d, yyyy 'at' HH:mm:ss")}
                              </span>
                            </div>
                            {selectedSimulation.lastResult.stepResults && (
                              <div className="space-y-2">
                                <h4 className="font-medium text-sm">Step Results</h4>
                                {selectedSimulation.lastResult.stepResults.map((result, i) => (
                                  <div key={i} className="flex items-center gap-2 text-sm p-2 rounded bg-muted/50">
                                    <Badge 
                                      variant="outline"
                                      className={result.status === "success" ? "bg-green-500/20" : "bg-red-500/20"}
                                    >
                                      {result.status}
                                    </Badge>
                                    <span className="text-muted-foreground">{result.duration}ms</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-center py-8">
                            No results yet. Run the simulation to see output.
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Workflow className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Select a simulation</p>
                  <p className="text-sm">Or create a new one to get started</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
