import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { VIRTUAL_AGENTS } from "@shared/schema";
import { 
  Workflow, 
  Plus, 
  Play, 
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Settings2,
  Cpu,
  Network,
  Terminal,
  Clock,
  ChevronRight,
  ArrowRight
} from "lucide-react";
import { format } from "date-fns";

interface WorkflowSimulation {
  id: string;
  name: string;
  description: string | null;
  steps: WorkflowStep[];
  status: string;
  last_run_at: string | null;
  last_result: { status: string; timestamp: string } | null;
  created_at: string;
}

interface WorkflowStep {
  id: string;
  name: string;
  type: "agent_call" | "condition" | "delay" | "webhook" | "transform";
  agentId?: string;
  config: Record<string, unknown>;
}

const stepTypeIcons: Record<string, any> = {
  agent_call: Cpu,
  condition: Network,
  delay: Clock,
  webhook: Network,
  transform: Settings2,
};

const stepTypeColors: Record<string, string> = {
  agent_call: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
  condition: "bg-purple-500/20 text-purple-600 dark:text-purple-400",
  delay: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400",
  webhook: "bg-green-500/20 text-green-600 dark:text-green-400",
  transform: "bg-orange-500/20 text-orange-600 dark:text-orange-400",
};

export default function OperationsSimulator() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedSimulation, setSelectedSimulation] = useState<WorkflowSimulation | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [runLogs, setRunLogs] = useState<string[]>([]);
  const [newSimulation, setNewSimulation] = useState({
    name: "",
    description: "",
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/simulations"] });
      toast({ title: "Simulation Created" });
      setIsCreateOpen(false);
      setNewSimulation({ name: "", description: "" });
    },
    onError: (e: any) => {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    },
  });

  const runMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/simulations/${id}/run`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/simulations"] });
      toast({ title: "Simulation Complete" });
      setIsRunning(false);
    },
    onError: (e: any) => {
      toast({ title: "Simulation Failed", description: e.message, variant: "destructive" });
      setIsRunning(false);
    },
  });

  const handleRunSimulation = async (sim: WorkflowSimulation) => {
    setSelectedSimulation(sim);
    setIsRunning(true);
    setRunLogs([]);

    const steps = sim.steps || [];
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      setRunLogs(prev => [...prev, `[${format(new Date(), "HH:mm:ss")}] Starting step: ${step.name}`]);
      await new Promise(r => setTimeout(r, 800));
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
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="Simulation name"
                  value={newSimulation.name}
                  onChange={(e) => setNewSimulation(prev => ({ ...prev, name: e.target.value }))}
                  data-testid="input-simulation-name"
                />
                <Textarea
                  placeholder="Description (optional)"
                  value={newSimulation.description}
                  onChange={(e) => setNewSimulation(prev => ({ ...prev, description: e.target.value }))}
                  data-testid="input-simulation-description"
                />
                <Button 
                  className="w-full" 
                  onClick={() => createMutation.mutate(newSimulation)}
                  disabled={!newSimulation.name.trim() || createMutation.isPending}
                  data-testid="button-submit-simulation"
                >
                  {createMutation.isPending ? "Creating..." : "Create Simulation"}
                </Button>
              </div>
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
                {simulations.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-8">
                    No simulations yet. Create your first one.
                  </p>
                ) : (
                  simulations.map(sim => (
                    <Card 
                      key={sim.id} 
                      className={`p-3 cursor-pointer hover-elevate ${selectedSimulation?.id === sim.id ? 'border-primary' : ''}`}
                      onClick={() => setSelectedSimulation(sim)}
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
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{(sim.steps || []).length} steps</span>
                        {sim.last_run_at && (
                          <span>Last run: {format(new Date(sim.last_run_at), "MMM d, HH:mm")}</span>
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
                      <h2 className="text-xl font-semibold">{selectedSimulation.name}</h2>
                      <p className="text-sm text-muted-foreground">{selectedSimulation.description || "No description"}</p>
                    </div>
                    <div className="flex gap-2">
                      {isRunning ? (
                        <Button variant="outline" onClick={handleStopSimulation} data-testid="button-stop">
                          <Pause className="h-4 w-4 mr-2" />
                          Stop
                        </Button>
                      ) : (
                        <Button onClick={() => handleRunSimulation(selectedSimulation)} data-testid="button-run">
                          <Play className="h-4 w-4 mr-2" />
                          Run Simulation
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <Tabs defaultValue="workflow" className="flex-1 flex flex-col">
                  <TabsList className="mx-4 mt-4">
                    <TabsTrigger value="workflow">Workflow</TabsTrigger>
                    <TabsTrigger value="logs">Run Logs</TabsTrigger>
                    <TabsTrigger value="results">Results</TabsTrigger>
                  </TabsList>

                  <TabsContent value="workflow" className="flex-1 p-4 overflow-auto">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Settings2 className="h-5 w-5 text-primary" />
                          Workflow Steps
                        </CardTitle>
                        <CardDescription>Define the steps in your simulation</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {(selectedSimulation.steps || []).length === 0 ? (
                          <div className="text-center py-12 text-muted-foreground">
                            <Workflow className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No steps defined yet</p>
                            <p className="text-sm">Add steps to build your workflow simulation</p>
                            <Button variant="outline" className="mt-4" data-testid="button-add-step">
                              <Plus className="h-4 w-4 mr-2" />
                              Add First Step
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {(selectedSimulation.steps || []).map((step, index) => {
                              const StepIcon = stepTypeIcons[step.type] || Settings2;
                              return (
                                <div key={step.id} className="flex items-center gap-3">
                                  <div className={`p-2 rounded-md ${stepTypeColors[step.type]}`}>
                                    <StepIcon className="h-4 w-4" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">{step.name}</p>
                                    <p className="text-xs text-muted-foreground">{step.type}</p>
                                  </div>
                                  {index < (selectedSimulation.steps || []).length - 1 && (
                                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
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
                        {selectedSimulation.last_result ? (
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="bg-green-500/20 text-green-600">
                                {selectedSimulation.last_result.status}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {format(new Date(selectedSimulation.last_result.timestamp), "MMM d, yyyy 'at' HH:mm:ss")}
                              </span>
                            </div>
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
