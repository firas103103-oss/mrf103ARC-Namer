import { useState } from "react";
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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MissionScenario {
  id: string;
  name: string;
  description: string;
  objectives: string[];
  riskLevel: number;
  category: string;
}

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

const SCENARIOS: MissionScenario[] = [
  {
    id: "alpha-recon",
    name: "Alpha Reconnaissance",
    description: "Deep intelligence gathering operation targeting competitor analysis and market positioning. Requires stealth and precision.",
    objectives: [
      "Gather competitive intelligence",
      "Analyze market positioning",
      "Identify strategic opportunities",
      "Report findings within 48 hours",
    ],
    riskLevel: 35,
    category: "Intelligence",
  },
  {
    id: "crisis-response",
    name: "Crisis Response Protocol",
    description: "Rapid response scenario for handling unexpected market disruptions or public relations challenges.",
    objectives: [
      "Assess situation severity",
      "Coordinate multi-team response",
      "Implement damage control measures",
      "Establish communication protocols",
    ],
    riskLevel: 72,
    category: "Emergency",
  },
  {
    id: "expansion-omega",
    name: "Expansion Omega",
    description: "Strategic expansion into new markets requiring coordinated efforts across legal, finance, and creative teams.",
    objectives: [
      "Complete market analysis",
      "Secure regulatory compliance",
      "Develop localization strategy",
      "Establish initial partnerships",
    ],
    riskLevel: 58,
    category: "Growth",
  },
  {
    id: "innovation-delta",
    name: "Innovation Delta",
    description: "R&D initiative for breakthrough product development with cross-functional collaboration.",
    objectives: [
      "Identify innovation opportunities",
      "Prototype development",
      "User testing and validation",
      "Go-to-market preparation",
    ],
    riskLevel: 45,
    category: "Research",
  },
];

const AGENTS: Agent[] = [
  { id: "mrf", name: "Mr.F", role: "Executive Orchestrator", specialty: "Strategic Command", icon: Crown, synergy: 95 },
  { id: "l0-ops", name: "L0-Ops", role: "Operations Commander", specialty: "Process Optimization", icon: Settings, synergy: 88 },
  { id: "l0-comms", name: "L0-Comms", role: "Communications Director", specialty: "Stakeholder Management", icon: Radio, synergy: 82 },
  { id: "l0-intel", name: "L0-Intel", role: "Intelligence Analyst", specialty: "Data Synthesis", icon: Brain, synergy: 90 },
  { id: "photographer", name: "Alex Vision", role: "Photography Specialist", specialty: "Visual Content", icon: Camera, synergy: 75 },
  { id: "grants", name: "Diana Grant", role: "Grants Specialist", specialty: "Funding Opportunities", icon: FileText, synergy: 78 },
  { id: "legal", name: "Marcus Law", role: "Legal Advisor", specialty: "Compliance & Contracts", icon: Scale, synergy: 85 },
  { id: "finance", name: "Sarah Numbers", role: "Financial Analyst", specialty: "Budget Planning", icon: TrendingUp, synergy: 87 },
  { id: "creative", name: "Jordan Spark", role: "Creative Director", specialty: "Brand Strategy", icon: Palette, synergy: 80 },
  { id: "researcher", name: "Dr. Maya Quest", role: "Research Analyst", specialty: "Market Research", icon: Search, synergy: 83 },
];

const DECISION_TREE: DecisionNode = {
  id: "root",
  label: "Mission Initiation",
  probability: 100,
  children: [
    {
      id: "branch-a",
      label: "Stealth Approach",
      probability: 78,
      children: [
        { id: "a1", label: "Intel Gathered", probability: 85, outcome: "success" },
        { id: "a2", label: "Partial Data", probability: 12, outcome: "partial" },
        { id: "a3", label: "Detection Risk", probability: 3, outcome: "failure" },
      ],
    },
    {
      id: "branch-b",
      label: "Direct Engagement",
      probability: 22,
      children: [
        { id: "b1", label: "Full Success", probability: 65, outcome: "success" },
        { id: "b2", label: "Negotiated Outcome", probability: 25, outcome: "partial" },
        { id: "b3", label: "Mission Abort", probability: 10, outcome: "failure" },
      ],
    },
  ],
};

const TACTICAL_RECOMMENDATIONS = [
  "Deploy L0-Intel for initial reconnaissance phase before committing full taskforce.",
  "Coordinate with L0-Comms to establish secure communication channels before mission start.",
  "Consider adding Legal Advisor if regulatory concerns are anticipated.",
  "Finance team should prepare contingency budget allocation for unexpected scenarios.",
  "Synergy analysis indicates optimal team composition achieved at current configuration.",
];

export default function QuantumWarRoom() {
  const [selectedScenario, setSelectedScenario] = useState<string>("alpha-recon");
  const [selectedAgents, setSelectedAgents] = useState<string[]>(["mrf", "l0-intel", "l0-ops"]);
  const [briefingText, setBriefingText] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);

  const currentScenario = SCENARIOS.find((s) => s.id === selectedScenario);
  const selectedAgentData = AGENTS.filter((a) => selectedAgents.includes(a.id));
  
  const teamSynergy = selectedAgentData.length > 0
    ? Math.round(selectedAgentData.reduce((sum, a) => sum + a.synergy, 0) / selectedAgentData.length)
    : 0;

  const successProbability = Math.min(95, Math.round(
    (teamSynergy * 0.4) + 
    ((100 - (currentScenario?.riskLevel || 50)) * 0.3) + 
    (selectedAgentData.length * 5)
  ));

  const toggleAgent = (agentId: string) => {
    setSelectedAgents((prev) =>
      prev.includes(agentId)
        ? prev.filter((id) => id !== agentId)
        : [...prev, agentId]
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
      case "success": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "partial": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "failure": return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-muted";
    }
  };

  return (
    <div className="p-6 space-y-6 bg-grid-pattern min-h-full" data-testid="quantum-warroom">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold enterprise-title flex items-center gap-2" data-testid="text-page-title">
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
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Mission Scenario</label>
              <Select value={selectedScenario} onValueChange={setSelectedScenario}>
                <SelectTrigger data-testid="select-scenario">
                  <SelectValue placeholder="Select a scenario" />
                </SelectTrigger>
                <SelectContent>
                  {SCENARIOS.map((scenario) => (
                    <SelectItem key={scenario.id} value={scenario.id}>
                      <div className="flex items-center gap-2">
                        <span>{scenario.name}</span>
                        <Badge variant="secondary" className="text-xs">{scenario.category}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {currentScenario && (
              <>
                <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-3">
                  <p className="text-sm text-muted-foreground" data-testid="text-scenario-description">
                    {currentScenario.description}
                  </p>
                  <div className="space-y-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Objectives</span>
                    <ul className="space-y-1">
                      {currentScenario.objectives.map((obj, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span>{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Risk Assessment
                    </span>
                    <span className={`text-sm font-bold ${getRiskColor(currentScenario.riskLevel)}`} data-testid="text-risk-level">
                      {currentScenario.riskLevel}%
                    </span>
                  </div>
                  <Progress 
                    value={currentScenario.riskLevel} 
                    className="h-2"
                    data-testid="progress-risk"
                  />
                  <p className="text-xs text-muted-foreground">
                    {currentScenario.riskLevel < 40 
                      ? "Low risk operation - standard protocols apply"
                      : currentScenario.riskLevel < 70
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
                {AGENTS.map((agent) => {
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
                          <IconComponent className={`h-4 w-4 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
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
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Selected Team</span>
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
                        className="ml-1 hover:text-destructive"
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
                  {selectedAgentData.length} agents selected | {teamSynergy >= 80 ? "Optimal" : teamSynergy >= 60 ? "Good" : "Needs improvement"} synergy
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
                  <span className="text-sm font-medium">{DECISION_TREE.label}</span>
                  <Badge variant="outline" className="text-xs">{DECISION_TREE.probability}%</Badge>
                </div>
                
                <div className="pl-6 border-l-2 border-border space-y-3">
                  {DECISION_TREE.children?.map((branch) => (
                    <div key={branch.id} className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-secondary" />
                        <span className="text-sm">{branch.label}</span>
                        <Badge variant="secondary" className="text-xs">{branch.probability}%</Badge>
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
              <Progress 
                value={successProbability} 
                className="h-3"
                data-testid="progress-success"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Based on team synergy and scenario risk</span>
                <span className={successProbability >= 75 ? "text-green-400" : successProbability >= 50 ? "text-yellow-400" : "text-red-400"}>
                  {successProbability >= 75 ? "High confidence" : successProbability >= 50 ? "Moderate confidence" : "Low confidence"}
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
            <Button 
              variant="outline" 
              size="sm"
              data-testid="button-voice-briefing"
            >
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
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">AI Tactical Recommendations</span>
                <Badge variant="outline" className="text-xs">
                  <Brain className="h-3 w-3 mr-1" />
                  AI Generated
                </Badge>
              </div>
              <ScrollArea className="h-[140px]">
                <div className="space-y-2 pr-4">
                  {TACTICAL_RECOMMENDATIONS.map((rec, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-start gap-2 p-2 rounded-lg bg-muted/30 border border-border text-sm"
                      data-testid={`recommendation-${idx}`}
                    >
                      <Zap className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{rec}</span>
                    </div>
                  ))}
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
