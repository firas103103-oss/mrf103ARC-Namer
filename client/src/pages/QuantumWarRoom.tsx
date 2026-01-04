import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Target,
  Users,
  Shield,
  AlertTriangle,
  Zap,
  Volume2,
  GitBranch,
  Crosshair,
  Crown,
  Settings,
  Radio,
  Brain,
  Camera,
  FileText,
  Scale,
  TrendingUp,
  Palette,
  Search,
  Plus,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { VirtualAgent, MissionScenario } from "@shared/schema";

interface Agent {
  id: string;
  name: string;
  role: string;
  specialty: string;
  icon: typeof Crown;
  synergy: number;
}

interface DecisionNode {
  id: string;
  label: string;
  probability: number;
  children?: DecisionNode[];
  outcome?: "success" | "partial" | "failure";
}

const ICON_MAP: Record<string, typeof Crown> = {
  crown: Crown,
  settings: Settings,
  radio: Radio,
  brain: Brain,
  camera: Camera,
  "file-text": FileText,
  scale: Scale,
  "trending-up": TrendingUp,
  palette: Palette,
  search: Search,
};

const SYNERGY_MAP: Record<string, number> = {
  mrf: 95,
  "l0-ops": 88,
  "l0-comms": 82,
  "l0-intel": 90,
  photographer: 75,
  grants: 78,
  legal: 85,
  finance: 87,
  creative: 80,
  researcher: 83,
};

function mapVirtualAgentToAgent(va: VirtualAgent): Agent {
  return {
    id: va.id,
    name: va.name,
    role: va.role,
    specialty: va.specialty,
    icon: ICON_MAP[va.avatar] || Crown,
    synergy: SYNERGY_MAP[va.id] || 80,
  };
}

function generateDecisionTree(scenario: MissionScenario | undefined, teamSynergy: number): DecisionNode {
  if (!scenario) {
    return {
      id: "root",
      label: "Select a scenario",
      probability: 100,
      children: [],
    };
  }

  const riskLevel = scenario.riskLevel || 50;
  const stealthProb = Math.max(20, Math.min(85, 90 - riskLevel));
  const directProb = 100 - stealthProb;
  const synergyBonus = (teamSynergy - 50) / 100;

  return {
    id: "root",
    label: "Mission Initiation",
    probability: 100,
    children: [
      {
        id: "branch-a",
        label: "Stealth Approach",
        probability: stealthProb,
        children: [
          { id: "a1", label: "Intel Gathered", probability: Math.round(70 + synergyBonus * 20), outcome: "success" },
          { id: "a2", label: "Partial Data", probability: Math.round(20 - synergyBonus * 10), outcome: "partial" },
          { id: "a3", label: "Detection Risk", probability: Math.round(10 - synergyBonus * 10), outcome: "failure" },
        ],
      },
      {
        id: "branch-b",
        label: "Direct Engagement",
        probability: directProb,
        children: [
          { id: "b1", label: "Full Success", probability: Math.round(55 + synergyBonus * 15), outcome: "success" },
          { id: "b2", label: "Negotiated Outcome", probability: Math.round(30 - synergyBonus * 5), outcome: "partial" },
          { id: "b3", label: "Mission Abort", probability: Math.round(15 - synergyBonus * 10), outcome: "failure" },
        ],
      },
    ],
  };
}

export default function QuantumWarRoom() {
  const { toast } = useToast();
  const [selectedScenario, setSelectedScenario] = useState<string>("");
  const [selectedAgents, setSelectedAgents] = useState<string[]>(["mrf", "l0-intel", "l0-ops"]);
  const [briefingText, setBriefingText] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [newScenarioOpen, setNewScenarioOpen] = useState(false);
  const [newScenario, setNewScenario] = useState({
    name: "",
    description: "",
    objectives: "",
    riskLevel: 50,
    category: "Intelligence",
  });

  const { data: scenariosData, isLoading: scenariosLoading } = useQuery<MissionScenario[]>({
    queryKey: ['/api/scenarios'],
  });

  const { data: agentsData, isLoading: agentsLoading } = useQuery<VirtualAgent[]>({
    queryKey: ["/api/agents"],
  });

  const createScenarioMutation = useMutation({
    mutationFn: async (data: typeof newScenario) => {
      const objectives = data.objectives.split("\n").filter((o) => o.trim());
      const response = await apiRequest("POST", "/api/scenarios", {
        name: data.name,
        description: data.description,
        objectives,
        riskLevel: data.riskLevel,
        category: data.category,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scenarios"] });
      setNewScenarioOpen(false);
      setNewScenario({
        name: "",
        description: "",
        objectives: "",
        riskLevel: 50,
        category: "Intelligence",
      });
      toast({
        title: "Scenario Created",
        description: "New mission scenario has been saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const scenarios: MissionScenario[] = scenariosData || [];
  const agents: Agent[] = agentsData ? agentsData.map(mapVirtualAgentToAgent) : [];

  const currentScenario = scenarios.find((s) => s.id === selectedScenario);
  const selectedAgentData = agents.filter((a) => selectedAgents.includes(a.id));

  const teamSynergy =
    selectedAgentData.length > 0
      ? Math.round(selectedAgentData.reduce((sum, a) => sum + a.synergy, 0) / selectedAgentData.length)
      : 0;

  const riskLevel = currentScenario?.riskLevel ?? 50;
  const successProbability = Math.min(
    95,
    Math.round(teamSynergy * 0.4 + (100 - riskLevel) * 0.3 + selectedAgentData.length * 5)
  );

  const decisionTree = generateDecisionTree(currentScenario, teamSynergy);

  useEffect(() => {
    if (scenarios.length > 0 && !selectedScenario) {
      setSelectedScenario(scenarios[0].id);
    }
  }, [scenarios, selectedScenario]);

  useEffect(() => {
    if (currentScenario && selectedAgentData.length > 0) {
      generateRecommendations();
    }
  }, [selectedScenario, selectedAgents.length]);

  const generateRecommendations = async () => {
    if (!currentScenario) return;
    setIsLoadingRecommendations(true);

    try {
      const response = await apiRequest("POST", "/api/chat", {
        message: `Based on the mission "${currentScenario.title}" with risk level ${riskLevel}% and team consisting of ${selectedAgentData.map((a) => a.name).join(", ")}, provide 5 concise tactical recommendations. Each recommendation should be one sentence. Focus on how to optimize team deployment, risk mitigation, and mission success. Format as a numbered list.`,
        activeAgents: ["l0-intel"],
      });

      const data = await response.json();
      if (data.responses && data.responses.length > 0) {
        const content = data.responses[0].content;
        const lines = content
          .split("\n")
          .filter((line: string) => line.trim())
          .map((line: string) => line.replace(/^\d+\.\s*/, "").trim())
          .filter((line: string) => line.length > 10)
          .slice(0, 5);
        setRecommendations(lines);
      }
    } catch {
      setRecommendations([
        "Deploy reconnaissance agents first to assess the operational environment.",
        "Establish secure communication channels before mission initiation.",
        "Prepare contingency plans based on risk assessment levels.",
        "Coordinate team synergy for optimal resource allocation.",
        "Monitor real-time metrics for adaptive strategy adjustments.",
      ]);
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const toggleAgent = (agentId: string) => {
    setSelectedAgents((prev) =>
      prev.includes(agentId) ? prev.filter((id) => id !== agentId) : [...prev, agentId]
    );
  };

  const runSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => setIsSimulating(false), 2000);
  };

  const getRiskColor = (level: number) => {
    if (level < 40) return "text-green-400";
    if (level < 70) return "text-yellow-400";
    return "text-red-400";
  };

  const getOutcomeColor = (outcome?: string) => {
    switch (outcome) {
      case "success":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "partial":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "failure":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-muted";
    }
  };

  const getObjectives = (scenario: MissionScenario | undefined): string[] => {
    if (!scenario) return [];
    if (Array.isArray(scenario.objectives)) return scenario.objectives as string[];
    return [];
  };

  if (scenariosLoading || agentsLoading) {
    return (
      <div className="p-6 space-y-6 bg-grid-pattern min-h-full" data-testid="quantum-warroom-loading">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48 mt-2" />
          </div>
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-grid-pattern min-h-full" data-testid="quantum-warroom">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1
            className="text-2xl font-semibold enterprise-title flex items-center gap-2"
            data-testid="text-page-title"
          >
            <Crosshair className="h-6 w-6" />
            Quantum Strategy WarRoom
          </h1>
          <p className="text-muted-foreground mt-1">Advanced multi-agent scenario simulator</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-code">
            <Zap className="h-3 w-3 mr-1" />
            Simulation Ready
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card data-testid="card-scenario-panel">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-5 w-5 text-primary" />
                Scenario Panel
              </CardTitle>
              <CardDescription>Select and configure mission parameters</CardDescription>
            </div>
            <Dialog open={newScenarioOpen} onOpenChange={setNewScenarioOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" data-testid="button-new-scenario">
                  <Plus className="h-4 w-4 mr-1" />
                  New
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Scenario</DialogTitle>
                  <DialogDescription>Define a new mission scenario for simulation.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <Input
                      value={newScenario.name}
                      onChange={(e) => setNewScenario({ ...newScenario, name: e.target.value })}
                      placeholder="Mission name"
                      data-testid="input-scenario-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={newScenario.description}
                      onChange={(e) => setNewScenario({ ...newScenario, description: e.target.value })}
                      placeholder="Mission description"
                      data-testid="input-scenario-description"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Objectives (one per line)</label>
                    <Textarea
                      value={newScenario.objectives}
                      onChange={(e) => setNewScenario({ ...newScenario, objectives: e.target.value })}
                      placeholder="Objective 1&#10;Objective 2&#10;Objective 3"
                      data-testid="input-scenario-objectives"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Risk Level: {newScenario.riskLevel}%</label>
                      <Input
                        type="range"
                        min="0"
                        max="100"
                        value={newScenario.riskLevel}
                        onChange={(e) =>
                          setNewScenario({ ...newScenario, riskLevel: parseInt(e.target.value) })
                        }
                        data-testid="input-scenario-risk"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Category</label>
                      <Select
                        value={newScenario.category}
                        onValueChange={(value) => setNewScenario({ ...newScenario, category: value })}
                      >
                        <SelectTrigger data-testid="select-scenario-category">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Intelligence">Intelligence</SelectItem>
                          <SelectItem value="Emergency">Emergency</SelectItem>
                          <SelectItem value="Growth">Growth</SelectItem>
                          <SelectItem value="Research">Research</SelectItem>
                          <SelectItem value="Operations">Operations</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setNewScenarioOpen(false)}
                    data-testid="button-cancel-scenario"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => createScenarioMutation.mutate(newScenario)}
                    disabled={!newScenario.name || createScenarioMutation.isPending}
                    data-testid="button-create-scenario"
                  >
                    {createScenarioMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4 mr-1" />
                    )}
                    Create
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Mission Scenario</label>
              {scenarios.length === 0 ? (
                <div className="p-4 rounded-lg bg-muted/50 border border-border text-center">
                  <p className="text-sm text-muted-foreground">No scenarios found. Create your first scenario.</p>
                </div>
              ) : (
                <Select value={selectedScenario} onValueChange={setSelectedScenario}>
                  <SelectTrigger data-testid="select-scenario">
                    <SelectValue placeholder="Select a scenario" />
                  </SelectTrigger>
                  <SelectContent>
                    {scenarios.map((scenario) => (
                      <SelectItem key={scenario.id} value={scenario.id}>
                        <div className="flex items-center gap-2">
                          <span>{scenario.title}</span>
                          {scenario.category && (
                            <Badge variant="secondary" className="text-xs">
                              {scenario.category}
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {currentScenario && (
              <>
                <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-3">
                  <p className="text-sm text-muted-foreground" data-testid="text-scenario-description">
                    {currentScenario.description || "No description provided."}
                  </p>
                  {getObjectives(currentScenario).length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Objectives
                      </span>
                      <ul className="space-y-1">
                        {getObjectives(currentScenario).map((obj, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            <span>{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Risk Assessment
                    </span>
                    <span
                      className={`text-sm font-bold ${getRiskColor(riskLevel)}`}
                      data-testid="text-risk-level"
                    >
                      {riskLevel}%
                    </span>
                  </div>
                  <Progress value={riskLevel} className="h-2" data-testid="progress-risk" />
                  <p className="text-xs text-muted-foreground">
                    {riskLevel < 40
                      ? "Low risk operation - standard protocols apply"
                      : riskLevel < 70
                        ? "Moderate risk - enhanced monitoring recommended"
                        : "High risk - executive approval required"}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-taskforce-builder">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-primary" />
                Agent Taskforce Builder
              </CardTitle>
              <CardDescription>Assemble your mission team</CardDescription>
            </div>
            <Badge variant={teamSynergy >= 85 ? "default" : "secondary"} data-testid="badge-synergy">
              Synergy: {teamSynergy}%
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScrollArea className="h-[200px] pr-4">
              <div className="grid grid-cols-2 gap-2">
                {agents.map((agent) => {
                  const isSelected = selectedAgents.includes(agent.id);
                  const IconComponent = agent.icon;
                  return (
                    <button
                      key={agent.id}
                      onClick={() => toggleAgent(agent.id)}
                      className={`p-3 rounded-lg border text-left transition-all agent-card-glow ${
                        isSelected
                          ? "border-primary bg-primary/10 selected"
                          : "border-border bg-card hover-elevate"
                      }`}
                      data-testid={`agent-${agent.id}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`p-1.5 rounded-md ${isSelected ? "bg-primary/20" : "bg-muted"}`}>
                          <IconComponent
                            className={`h-4 w-4 ${isSelected ? "text-primary" : "text-muted-foreground"}`}
                          />
                        </div>
                        <span className="font-medium text-sm truncate">{agent.name}</span>
                        {isSelected && <Check className="h-3 w-3 text-primary ml-auto shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{agent.role}</p>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>

            {selectedAgentData.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Selected Team
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedAgentData.map((agent) => (
                    <Badge
                      key={agent.id}
                      variant="outline"
                      className="gap-1"
                      data-testid={`selected-agent-${agent.id}`}
                    >
                      {agent.name}
                      <button
                        onClick={() => toggleAgent(agent.id)}
                        className="ml-1"
                        data-testid={`remove-agent-${agent.id}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border">
              <Shield className="h-5 w-5 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Team Configuration</p>
                <p className="text-xs text-muted-foreground">
                  {selectedAgentData.length} agents selected |{" "}
                  {teamSynergy >= 80 ? "Optimal" : teamSynergy >= 60 ? "Good" : "Needs improvement"} synergy
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-simulation">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <GitBranch className="h-5 w-5 text-primary" />
                Simulation Area
              </CardTitle>
              <CardDescription>Monte Carlo outcome projections</CardDescription>
            </div>
            <Button
              size="sm"
              onClick={runSimulation}
              disabled={isSimulating || selectedAgentData.length === 0}
              data-testid="button-run-simulation"
            >
              {isSimulating ? (
                <>
                  <Zap className="h-4 w-4 mr-1 animate-pulse" />
                  Simulating...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-1" />
                  Run Simulation
                </>
              )}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-primary animate-pulse-glow" />
                  <span className="text-sm font-medium">{decisionTree.label}</span>
                  <Badge variant="outline" className="text-xs">
                    {decisionTree.probability}%
                  </Badge>
                </div>

                <div className="pl-6 border-l-2 border-border space-y-3">
                  {decisionTree.children?.map((branch) => (
                    <div key={branch.id} className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-secondary" />
                        <span className="text-sm">{branch.label}</span>
                        <Badge variant="secondary" className="text-xs">
                          {branch.probability}%
                        </Badge>
                      </div>
                      <div className="pl-5 space-y-1">
                        {branch.children?.map((outcome) => (
                          <div
                            key={outcome.id}
                            className={`flex items-center justify-between gap-2 text-xs p-2 rounded border ${getOutcomeColor(outcome.outcome)}`}
                          >
                            <span>{outcome.label}</span>
                            <span className="font-mono">{outcome.probability}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Success Probability
                </span>
                <span className="text-sm font-bold text-primary" data-testid="text-success-probability">
                  {successProbability}%
                </span>
              </div>
              <Progress value={successProbability} className="h-3" data-testid="progress-success" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Based on team synergy and scenario risk</span>
                <span
                  className={
                    successProbability >= 75
                      ? "text-green-400"
                      : successProbability >= 50
                        ? "text-yellow-400"
                        : "text-red-400"
                  }
                >
                  {successProbability >= 75
                    ? "High confidence"
                    : successProbability >= 50
                      ? "Moderate confidence"
                      : "Low confidence"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-briefing">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-primary" />
                Mission Briefing
              </CardTitle>
              <CardDescription>Tactical recommendations and notes</CardDescription>
            </div>
            <Button variant="outline" size="sm" data-testid="button-voice-briefing">
              <Volume2 className="h-4 w-4 mr-1" />
              Voice Briefing
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Briefing Notes</label>
              <Textarea
                placeholder="Enter mission briefing details, special instructions, or additional context..."
                value={briefingText}
                onChange={(e) => setBriefingText(e.target.value)}
                className="min-h-[100px] resize-none"
                data-testid="textarea-briefing"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  AI Tactical Recommendations
                </span>
                <Badge variant="outline" className="text-xs">
                  <Brain className="h-3 w-3 mr-1" />
                  AI Generated
                </Badge>
              </div>
              <ScrollArea className="h-[140px]">
                <div className="space-y-2 pr-4">
                  {isLoadingRecommendations ? (
                    Array.from({ length: 3 }).map((_, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-muted/30 border border-border">
                        <Skeleton className="h-4 w-full" />
                      </div>
                    ))
                  ) : recommendations.length > 0 ? (
                    recommendations.map((rec, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 p-2 rounded-lg bg-muted/30 border border-border text-sm"
                        data-testid={`recommendation-${idx}`}
                      >
                        <Zap className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{rec}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-2 rounded-lg bg-muted/30 border border-border text-sm text-muted-foreground text-center">
                      Select a scenario and team to generate recommendations.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            <div className="flex gap-2 pt-2">
              <Button className="flex-1" data-testid="button-initiate-mission">
                <Crosshair className="h-4 w-4 mr-2" />
                Initiate Mission
              </Button>
              <Button variant="outline" data-testid="button-save-scenario">
                <Plus className="h-4 w-4 mr-2" />
                Save Scenario
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
