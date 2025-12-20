import { useState } from "react";
import {
  Clock,
  Calendar,
  Users,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  CheckCircle,
  Circle,
  XCircle,
  Crown,
  Settings,
  Radio,
  Brain,
  Camera,
  FileText,
  Scale,
  Palette,
  Search,
  Play,
  Pause,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Agent {
  id: string;
  name: string;
  role: string;
  icon: typeof Crown;
  currentPerformance: number;
  historicalAvg: number;
  trend: "up" | "down" | "stable";
}

interface Anomaly {
  id: string;
  agentId: string;
  agentName: string;
  type: "spike" | "drop" | "pattern";
  severity: "minor" | "moderate" | "critical";
  description: string;
  timestamp: string;
  metric: string;
  deviation: number;
}

interface Playbook {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "skipped";
  priority: "low" | "medium" | "high";
  relatedAnomalyId: string;
}

interface ClusterGroup {
  id: string;
  name: string;
  color: string;
  agents: string[];
  performance: number;
}

const AGENTS: Agent[] = [
  { id: "mrf", name: "Mr.F", role: "Executive Orchestrator", icon: Crown, currentPerformance: 94, historicalAvg: 91, trend: "up" },
  { id: "l0-ops", name: "L0-Ops", role: "Operations Commander", icon: Settings, currentPerformance: 87, historicalAvg: 89, trend: "down" },
  { id: "l0-comms", name: "L0-Comms", role: "Communications Director", icon: Radio, currentPerformance: 82, historicalAvg: 80, trend: "up" },
  { id: "l0-intel", name: "L0-Intel", role: "Intelligence Analyst", icon: Brain, currentPerformance: 91, historicalAvg: 88, trend: "up" },
  { id: "photographer", name: "Alex Vision", role: "Photography Specialist", icon: Camera, currentPerformance: 78, historicalAvg: 82, trend: "down" },
  { id: "grants", name: "Diana Grant", role: "Grants Specialist", icon: FileText, currentPerformance: 85, historicalAvg: 84, trend: "stable" },
  { id: "legal", name: "Marcus Law", role: "Legal Advisor", icon: Scale, currentPerformance: 89, historicalAvg: 87, trend: "up" },
  { id: "finance", name: "Sarah Numbers", role: "Financial Analyst", icon: TrendingUp, currentPerformance: 92, historicalAvg: 90, trend: "up" },
  { id: "creative", name: "Jordan Spark", role: "Creative Director", icon: Palette, currentPerformance: 76, historicalAvg: 81, trend: "down" },
  { id: "researcher", name: "Dr. Maya Quest", role: "Research Analyst", icon: Search, currentPerformance: 88, historicalAvg: 86, trend: "up" },
];

const ANOMALIES: Anomaly[] = [
  { id: "a1", agentId: "creative", agentName: "Jordan Spark", type: "drop", severity: "moderate", description: "Response time increased by 45% compared to baseline", timestamp: "2024-12-19 14:32", metric: "Response Time", deviation: -45 },
  { id: "a2", agentId: "l0-ops", agentName: "L0-Ops", type: "pattern", severity: "minor", description: "Unusual task completion pattern detected during off-hours", timestamp: "2024-12-19 03:15", metric: "Task Pattern", deviation: -12 },
  { id: "a3", agentId: "photographer", agentName: "Alex Vision", type: "drop", severity: "critical", description: "Quality score dropped below threshold for 3 consecutive periods", timestamp: "2024-12-18 09:45", metric: "Quality Score", deviation: -28 },
  { id: "a4", agentId: "mrf", agentName: "Mr.F", type: "spike", severity: "minor", description: "Exceptional performance spike in decision accuracy", timestamp: "2024-12-18 16:20", metric: "Decision Accuracy", deviation: 18 },
  { id: "a5", agentId: "finance", agentName: "Sarah Numbers", type: "spike", severity: "minor", description: "Above-average processing speed maintained for extended period", timestamp: "2024-12-17 11:00", metric: "Processing Speed", deviation: 22 },
];

const PLAYBOOKS: Playbook[] = [
  { id: "p1", title: "Recalibrate Creative Workflows", description: "Adjust task distribution and priority settings for Creative Director to optimize response times", status: "in-progress", priority: "high", relatedAnomalyId: "a1" },
  { id: "p2", title: "Review Off-Hours Scheduling", description: "Investigate L0-Ops task scheduling to prevent resource contention during maintenance windows", status: "pending", priority: "medium", relatedAnomalyId: "a2" },
  { id: "p3", title: "Quality Assurance Protocol", description: "Implement enhanced quality checks for Photography Specialist output before delivery", status: "pending", priority: "high", relatedAnomalyId: "a3" },
  { id: "p4", title: "Document Best Practices", description: "Capture Mr.F decision patterns from high-performance period for training data", status: "completed", priority: "low", relatedAnomalyId: "a4" },
  { id: "p5", title: "Scale Finance Processing", description: "Consider allocating additional resources to Finance Analyst during peak periods", status: "skipped", priority: "low", relatedAnomalyId: "a5" },
];

const CLUSTER_GROUPS: ClusterGroup[] = [
  { id: "c1", name: "High Performers", color: "hsl(168deg 65% 46%)", agents: ["mrf", "l0-intel", "finance", "legal"], performance: 92 },
  { id: "c2", name: "Stable Core", color: "hsl(207deg 90% 54%)", agents: ["l0-comms", "grants", "researcher"], performance: 85 },
  { id: "c3", name: "Needs Attention", color: "hsl(38deg 92% 50%)", agents: ["l0-ops", "creative", "photographer"], performance: 80 },
];

const CHART_DATA = [
  { date: "Dec 14", mrF: 88, l0Ops: 91, l0Intel: 85, creative: 83, avg: 86 },
  { date: "Dec 15", mrF: 90, l0Ops: 89, l0Intel: 87, creative: 80, avg: 86 },
  { date: "Dec 16", mrF: 92, l0Ops: 88, l0Intel: 89, creative: 79, avg: 87 },
  { date: "Dec 17", mrF: 91, l0Ops: 87, l0Intel: 90, creative: 78, avg: 86 },
  { date: "Dec 18", mrF: 93, l0Ops: 86, l0Intel: 91, creative: 75, avg: 86 },
  { date: "Dec 19", mrF: 94, l0Ops: 87, l0Intel: 91, creative: 76, avg: 87 },
  { date: "Dec 20", mrF: 94, l0Ops: 87, l0Intel: 91, creative: 76, avg: 87 },
];

const TIME_PRESETS = [
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "Last 90 days", value: "90d" },
];

export default function TemporalAnomalyLab() {
  const [timeRange, setTimeRange] = useState("7d");
  const [selectedAgents, setSelectedAgents] = useState<string[]>(["mrf", "l0-intel", "creative"]);
  const [isLiveMode, setIsLiveMode] = useState(false);

  const toggleAgent = (agentId: string) => {
    setSelectedAgents((prev) =>
      prev.includes(agentId)
        ? prev.filter((id) => id !== agentId)
        : prev.length < 4
          ? [...prev, agentId]
          : prev
    );
  };

  const selectedAgentData = AGENTS.filter((a) => selectedAgents.includes(a.id));

  const getSeverityColor = (severity: Anomaly["severity"]) => {
    switch (severity) {
      case "critical": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "moderate": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "minor": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    }
  };

  const getAnomalyIcon = (type: Anomaly["type"]) => {
    switch (type) {
      case "spike": return <TrendingUp className="h-4 w-4" />;
      case "drop": return <TrendingDown className="h-4 w-4" />;
      case "pattern": return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: Playbook["status"]) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4 text-green-400" />;
      case "in-progress": return <Circle className="h-4 w-4 text-yellow-400 animate-pulse" />;
      case "pending": return <Circle className="h-4 w-4 text-muted-foreground" />;
      case "skipped": return <XCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendIcon = (trend: Agent["trend"]) => {
    switch (trend) {
      case "up": return <TrendingUp className="h-4 w-4 text-green-400" />;
      case "down": return <TrendingDown className="h-4 w-4 text-red-400" />;
      case "stable": return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="p-6 space-y-6 bg-grid-pattern min-h-full" data-testid="temporal-anomaly-lab">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold enterprise-title flex items-center gap-2" data-testid="text-page-title">
            <Clock className="h-6 w-6" />
            Temporal Anomaly Lab
          </h1>
          <p className="text-muted-foreground mt-1">Retrospective analytics for agent performance comparison</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={isLiveMode ? "default" : "outline"}
            size="sm"
            onClick={() => setIsLiveMode(!isLiveMode)}
            data-testid="button-toggle-live"
          >
            {isLiveMode ? (
              <>
                <Pause className="h-4 w-4 mr-1" />
                Live Mode
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-1" />
                Historical
              </>
            )}
          </Button>
          <Badge variant="outline" className="font-code">
            <Zap className="h-3 w-3 mr-1" />
            {isLiveMode ? "Real-time" : "Analysis Mode"}
          </Badge>
        </div>
      </div>

      <Card data-testid="card-time-selector">
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-primary" />
              Time Range Selector
            </CardTitle>
            <CardDescription>Select the analysis period for comparison</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex gap-2">
              {TIME_PRESETS.map((preset) => (
                <Button
                  key={preset.value}
                  variant={timeRange === preset.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeRange(preset.value)}
                  data-testid={`button-preset-${preset.value}`}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>|</span>
              <span>Custom Range:</span>
              <input
                type="date"
                className="bg-input border border-border rounded-md px-2 py-1 text-sm"
                data-testid="input-date-start"
              />
              <span>to</span>
              <input
                type="date"
                className="bg-input border border-border rounded-md px-2 py-1 text-sm"
                data-testid="input-date-end"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card data-testid="card-agent-comparison">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-primary" />
                Agent Comparison Panel
              </CardTitle>
              <CardDescription>Select up to 4 agents to compare side-by-side</CardDescription>
            </div>
            <Select defaultValue="performance">
              <SelectTrigger className="w-[140px]" data-testid="select-comparison-metric">
                <SelectValue placeholder="Metric" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="response">Response Time</SelectItem>
                <SelectItem value="quality">Quality Score</SelectItem>
                <SelectItem value="throughput">Throughput</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScrollArea className="h-[120px]">
              <div className="flex flex-wrap gap-2">
                {AGENTS.map((agent) => {
                  const isSelected = selectedAgents.includes(agent.id);
                  const IconComponent = agent.icon;
                  return (
                    <Button
                      key={agent.id}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleAgent(agent.id)}
                      className="gap-1"
                      data-testid={`button-agent-${agent.id}`}
                    >
                      <IconComponent className="h-3 w-3" />
                      {agent.name}
                    </Button>
                  );
                })}
              </div>
            </ScrollArea>

            {selectedAgentData.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {selectedAgentData.map((agent) => {
                  const IconComponent = agent.icon;
                  const delta = agent.currentPerformance - agent.historicalAvg;
                  return (
                    <div
                      key={agent.id}
                      className="p-3 rounded-lg border border-border bg-muted/30 space-y-2"
                      data-testid={`card-agent-comparison-${agent.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-md bg-primary/20">
                            <IconComponent className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium text-sm">{agent.name}</span>
                        </div>
                        {getTrendIcon(agent.trend)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Current</span>
                          <span className="font-mono font-medium">{agent.currentPerformance}%</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Historical Avg</span>
                          <span className="font-mono">{agent.historicalAvg}%</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Delta</span>
                          <span className={`font-mono ${delta >= 0 ? "text-green-400" : "text-red-400"}`}>
                            {delta >= 0 ? "+" : ""}{delta}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-anomaly-detection">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="h-5 w-5 text-primary" />
                Anomaly Detection
              </CardTitle>
              <CardDescription>Detected performance anomalies and patterns</CardDescription>
            </div>
            <Badge variant="outline">
              {ANOMALIES.length} detected
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScrollArea className="h-[240px]">
              <div className="space-y-2 pr-4">
                {ANOMALIES.map((anomaly) => (
                  <div
                    key={anomaly.id}
                    className={`p-3 rounded-lg border ${getSeverityColor(anomaly.severity)} space-y-2`}
                    data-testid={`anomaly-${anomaly.id}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {getAnomalyIcon(anomaly.type)}
                        <span className="font-medium text-sm">{anomaly.agentName}</span>
                      </div>
                      <Badge
                        variant="outline"
                        className={getSeverityColor(anomaly.severity)}
                        data-testid={`badge-severity-${anomaly.id}`}
                      >
                        {anomaly.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{anomaly.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{anomaly.timestamp}</span>
                      <span className={`font-mono ${anomaly.deviation >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {anomaly.deviation >= 0 ? "+" : ""}{anomaly.deviation}% deviation
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Performance Clusters</span>
              <div className="flex flex-wrap gap-2">
                {CLUSTER_GROUPS.map((cluster) => (
                  <div
                    key={cluster.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-muted/30"
                    data-testid={`cluster-${cluster.id}`}
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: cluster.color }}
                    />
                    <span className="text-xs font-medium">{cluster.name}</span>
                    <span className="text-xs text-muted-foreground">({cluster.agents.length})</span>
                    <span className="text-xs font-mono">{cluster.performance}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-intervention-playbooks">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-primary" />
                Intervention Playbooks
              </CardTitle>
              <CardDescription>Recommended actions based on detected anomalies</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[280px]">
              <div className="space-y-3 pr-4">
                {PLAYBOOKS.map((playbook) => (
                  <div
                    key={playbook.id}
                    className="p-3 rounded-lg border border-border bg-muted/30 space-y-2"
                    data-testid={`playbook-${playbook.id}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(playbook.status)}
                        <span className="font-medium text-sm">{playbook.title}</span>
                      </div>
                      <Badge
                        variant={playbook.priority === "high" ? "destructive" : "outline"}
                        data-testid={`badge-priority-${playbook.id}`}
                      >
                        {playbook.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{playbook.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground capitalize">
                        Status: {playbook.status.replace("-", " ")}
                      </span>
                      {playbook.status === "pending" && (
                        <Button size="sm" variant="outline" data-testid={`button-start-${playbook.id}`}>
                          Start
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card data-testid="card-performance-chart">
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
                Performance Trends
              </CardTitle>
              <CardDescription>Historical vs live performance comparison</CardDescription>
            </div>
            <Select defaultValue="performance">
              <SelectTrigger className="w-[120px]" data-testid="select-chart-metric">
                <SelectValue placeholder="Metric" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="response">Response</SelectItem>
                <SelectItem value="quality">Quality</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={CHART_DATA} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <YAxis
                    domain={[70, 100]}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 11 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="mrF"
                    name="Mr.F"
                    stroke="hsl(168deg 65% 46%)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="l0Ops"
                    name="L0-Ops"
                    stroke="hsl(207deg 90% 54%)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="l0Intel"
                    name="L0-Intel"
                    stroke="hsl(280deg 65% 60%)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="creative"
                    name="Creative"
                    stroke="hsl(38deg 92% 50%)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="avg"
                    name="Average"
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
