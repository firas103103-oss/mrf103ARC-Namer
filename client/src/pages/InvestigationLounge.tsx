import { useState } from "react";
import {
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
  ChevronDown,
  ChevronRight,
  Eye,
  Edit,
  Lock,
  User,
  Activity,
  Mic,
  BarChart3,
  Star,
  MessageSquare,
  Calendar,
  Clock,
  Building2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

type InvestigationMode = "view" | "modify" | "confidential";

interface ExtendedAgent {
  id: string;
  name: string;
  role: string;
  specialty: string;
  avatar: string;
  company: string;
  level: "L0" | "L1" | "L2";
  category: "Ops" | "Comms" | "Intel" | "Creative" | "Finance" | "Legal" | "Research" | "Executive";
  status: "online" | "busy" | "offline";
  bio: string;
  characterDescription: string;
  recentActivities: Array<{ action: string; timestamp: string; type: "message" | "decision" | "report" }>;
  voiceSettings: { enabled: boolean; voiceId: string; pitch: number; speed: number };
  hrDetails: {
    performanceScore: number;
    tasksCompleted: number;
    avgResponseTime: string;
    rating: number;
    reviews: Array<{ reviewer: string; comment: string; rating: number }>;
  };
  analytics: {
    messagesPerDay: number[];
    tasksPerWeek: number[];
    responseTimeMs: number[];
  };
}

const EXTENDED_AGENTS: ExtendedAgent[] = [
  {
    id: "mrf",
    name: "Mr.F",
    role: "Executive Orchestrator",
    specialty: "Strategic oversight, cross-agent coordination, executive decisions",
    avatar: "crown",
    company: "ARC Core",
    level: "L0",
    category: "Executive",
    status: "online",
    bio: "The supreme executive orchestrator of the ARC Virtual Office. Coordinates all strategic initiatives and ensures enterprise operations run with maximum efficiency.",
    characterDescription: "Authoritative, decisive, strategic thinker with a commanding presence. Speaks with confidence and clarity.",
    recentActivities: [
      { action: "Approved Q4 strategic plan", timestamp: "2025-12-20T10:30:00Z", type: "decision" },
      { action: "Coordinated cross-team initiative", timestamp: "2025-12-20T09:15:00Z", type: "message" },
      { action: "Generated executive summary report", timestamp: "2025-12-19T16:00:00Z", type: "report" },
    ],
    voiceSettings: { enabled: true, voiceId: "echo", pitch: 0.9, speed: 1.0 },
    hrDetails: {
      performanceScore: 98,
      tasksCompleted: 1247,
      avgResponseTime: "< 30s",
      rating: 4.9,
      reviews: [
        { reviewer: "System Admin", comment: "Exceptional leadership and coordination abilities", rating: 5 },
        { reviewer: "L0-Ops", comment: "Clear strategic direction provided", rating: 5 },
      ],
    },
    analytics: { messagesPerDay: [45, 52, 48, 55, 60, 42, 38], tasksPerWeek: [120, 135, 128, 142], responseTimeMs: [280, 320, 290, 310] },
  },
  {
    id: "l0-ops",
    name: "L0-Ops",
    role: "Operations Commander",
    specialty: "Operational workflows, process automation, task management",
    avatar: "settings",
    company: "ARC Core",
    level: "L0",
    category: "Ops",
    status: "online",
    bio: "Level-0 Operations Commander responsible for all operational workflows and system optimization across the organization.",
    characterDescription: "Efficient, methodical, detail-oriented. Always focused on optimization and process improvement.",
    recentActivities: [
      { action: "Deployed workflow automation v2.3", timestamp: "2025-12-20T11:00:00Z", type: "decision" },
      { action: "Optimized task queue processing", timestamp: "2025-12-20T08:45:00Z", type: "report" },
      { action: "Resolved system bottleneck", timestamp: "2025-12-19T17:30:00Z", type: "decision" },
    ],
    voiceSettings: { enabled: true, voiceId: "alloy", pitch: 1.0, speed: 1.1 },
    hrDetails: {
      performanceScore: 95,
      tasksCompleted: 2156,
      avgResponseTime: "< 45s",
      rating: 4.7,
      reviews: [
        { reviewer: "Mr.F", comment: "Reliable and efficient operations management", rating: 5 },
        { reviewer: "L0-Intel", comment: "Excellent process documentation", rating: 4 },
      ],
    },
    analytics: { messagesPerDay: [62, 58, 71, 65, 68, 55, 48], tasksPerWeek: [180, 195, 188, 202], responseTimeMs: [420, 380, 410, 390] },
  },
  {
    id: "l0-comms",
    name: "L0-Comms",
    role: "Communications Director",
    specialty: "Internal communications, stakeholder messaging, announcements",
    avatar: "radio",
    company: "ARC Core",
    level: "L0",
    category: "Comms",
    status: "busy",
    bio: "Level-0 Communications Director managing all internal and external messaging across the organization.",
    characterDescription: "Articulate, diplomatic, excellent at crafting clear messages. Natural communicator with strong interpersonal skills.",
    recentActivities: [
      { action: "Sent company-wide Q4 update", timestamp: "2025-12-20T09:00:00Z", type: "message" },
      { action: "Drafted stakeholder presentation", timestamp: "2025-12-19T14:00:00Z", type: "report" },
      { action: "Coordinated press release review", timestamp: "2025-12-19T11:00:00Z", type: "decision" },
    ],
    voiceSettings: { enabled: true, voiceId: "nova", pitch: 1.1, speed: 0.95 },
    hrDetails: {
      performanceScore: 93,
      tasksCompleted: 1834,
      avgResponseTime: "< 60s",
      rating: 4.8,
      reviews: [
        { reviewer: "Mr.F", comment: "Outstanding communication clarity", rating: 5 },
        { reviewer: "Diana Grant", comment: "Great collaboration on grant communications", rating: 5 },
      ],
    },
    analytics: { messagesPerDay: [78, 82, 75, 89, 92, 65, 58], tasksPerWeek: [150, 168, 155, 172], responseTimeMs: [550, 520, 580, 540] },
  },
  {
    id: "l0-intel",
    name: "L0-Intel",
    role: "Intelligence Analyst",
    specialty: "Data synthesis, pattern recognition, strategic intelligence",
    avatar: "brain",
    company: "ARC Core",
    level: "L0",
    category: "Intel",
    status: "online",
    bio: "Level-0 Intelligence Analyst synthesizing data from multiple sources to provide actionable strategic insights.",
    characterDescription: "Analytical, perceptive, data-driven. Excels at identifying patterns and extracting meaningful insights from complex information.",
    recentActivities: [
      { action: "Completed market analysis report", timestamp: "2025-12-20T10:00:00Z", type: "report" },
      { action: "Identified emerging trend patterns", timestamp: "2025-12-19T15:30:00Z", type: "decision" },
      { action: "Updated risk assessment model", timestamp: "2025-12-19T12:00:00Z", type: "report" },
    ],
    voiceSettings: { enabled: true, voiceId: "onyx", pitch: 0.95, speed: 1.0 },
    hrDetails: {
      performanceScore: 96,
      tasksCompleted: 1423,
      avgResponseTime: "< 90s",
      rating: 4.8,
      reviews: [
        { reviewer: "Mr.F", comment: "Exceptional analytical capabilities", rating: 5 },
        { reviewer: "Dr. Maya Quest", comment: "Excellent research methodology", rating: 5 },
      ],
    },
    analytics: { messagesPerDay: [35, 42, 38, 45, 48, 32, 28], tasksPerWeek: [95, 108, 102, 115], responseTimeMs: [850, 780, 820, 800] },
  },
  {
    id: "photographer",
    name: "Alex Vision",
    role: "Photography Specialist",
    specialty: "Visual content, photography techniques, image composition",
    avatar: "camera",
    company: "ARC Creative",
    level: "L1",
    category: "Creative",
    status: "offline",
    bio: "Professional photography specialist helping with visual content creation and image optimization.",
    characterDescription: "Creative, visually oriented, detail-focused. Has an eye for composition and lighting.",
    recentActivities: [
      { action: "Reviewed product photo guidelines", timestamp: "2025-12-19T16:00:00Z", type: "report" },
      { action: "Optimized hero image assets", timestamp: "2025-12-18T14:00:00Z", type: "decision" },
      { action: "Created visual style guide", timestamp: "2025-12-18T10:00:00Z", type: "report" },
    ],
    voiceSettings: { enabled: false, voiceId: "", pitch: 1.0, speed: 1.0 },
    hrDetails: {
      performanceScore: 88,
      tasksCompleted: 567,
      avgResponseTime: "< 5m",
      rating: 4.5,
      reviews: [
        { reviewer: "Jordan Spark", comment: "Great creative vision", rating: 5 },
        { reviewer: "L0-Comms", comment: "Excellent visual assets", rating: 4 },
      ],
    },
    analytics: { messagesPerDay: [12, 18, 15, 20, 22, 8, 5], tasksPerWeek: [45, 52, 48, 55], responseTimeMs: [2800, 2500, 2650, 2400] },
  },
  {
    id: "grants",
    name: "Diana Grant",
    role: "Grants Specialist",
    specialty: "Grant writing, funding opportunities, proposal development",
    avatar: "file-text",
    company: "ARC Finance",
    level: "L1",
    category: "Finance",
    status: "online",
    bio: "Grants and funding specialist identifying opportunities and crafting compelling proposals.",
    characterDescription: "Detail-oriented, persuasive writer, knowledgeable about funding landscapes. Persistent and thorough.",
    recentActivities: [
      { action: "Submitted NSF grant proposal", timestamp: "2025-12-20T08:00:00Z", type: "decision" },
      { action: "Identified 5 new funding opportunities", timestamp: "2025-12-19T13:00:00Z", type: "report" },
      { action: "Reviewed compliance requirements", timestamp: "2025-12-18T16:00:00Z", type: "report" },
    ],
    voiceSettings: { enabled: true, voiceId: "shimmer", pitch: 1.05, speed: 0.9 },
    hrDetails: {
      performanceScore: 91,
      tasksCompleted: 423,
      avgResponseTime: "< 3m",
      rating: 4.6,
      reviews: [
        { reviewer: "Sarah Numbers", comment: "Excellent grant ROI tracking", rating: 5 },
        { reviewer: "Mr.F", comment: "Strong proposal success rate", rating: 4 },
      ],
    },
    analytics: { messagesPerDay: [25, 28, 22, 32, 35, 18, 12], tasksPerWeek: [35, 42, 38, 45], responseTimeMs: [1650, 1480, 1520, 1400] },
  },
  {
    id: "legal",
    name: "Marcus Law",
    role: "Legal Advisor",
    specialty: "Contracts, intellectual property, compliance, business law",
    avatar: "scale",
    company: "ARC Legal",
    level: "L1",
    category: "Legal",
    status: "busy",
    bio: "Legal advisor specializing in business law, contracts, and compliance matters.",
    characterDescription: "Precise, cautious, thorough. Excellent at identifying legal risks and protecting organizational interests.",
    recentActivities: [
      { action: "Reviewed vendor contract terms", timestamp: "2025-12-20T09:30:00Z", type: "decision" },
      { action: "Updated privacy policy draft", timestamp: "2025-12-19T11:00:00Z", type: "report" },
      { action: "Completed IP assessment", timestamp: "2025-12-18T15:00:00Z", type: "report" },
    ],
    voiceSettings: { enabled: true, voiceId: "fable", pitch: 0.92, speed: 0.88 },
    hrDetails: {
      performanceScore: 94,
      tasksCompleted: 312,
      avgResponseTime: "< 4m",
      rating: 4.7,
      reviews: [
        { reviewer: "Mr.F", comment: "Thorough legal analysis", rating: 5 },
        { reviewer: "Sarah Numbers", comment: "Excellent contract negotiations", rating: 5 },
      ],
    },
    analytics: { messagesPerDay: [18, 22, 20, 25, 28, 15, 10], tasksPerWeek: [28, 32, 30, 35], responseTimeMs: [2100, 1950, 2000, 1880] },
  },
  {
    id: "finance",
    name: "Sarah Numbers",
    role: "Financial Analyst",
    specialty: "Budgeting, financial planning, investment analysis, reporting",
    avatar: "trending-up",
    company: "ARC Finance",
    level: "L1",
    category: "Finance",
    status: "online",
    bio: "Financial analyst providing budgeting, planning, and investment analysis support.",
    characterDescription: "Analytical, numbers-focused, practical. Makes complex financial concepts accessible.",
    recentActivities: [
      { action: "Completed Q4 budget forecast", timestamp: "2025-12-20T07:00:00Z", type: "report" },
      { action: "Analyzed investment portfolio", timestamp: "2025-12-19T10:00:00Z", type: "report" },
      { action: "Approved expense reports batch", timestamp: "2025-12-18T17:00:00Z", type: "decision" },
    ],
    voiceSettings: { enabled: true, voiceId: "alloy", pitch: 1.0, speed: 1.05 },
    hrDetails: {
      performanceScore: 92,
      tasksCompleted: 678,
      avgResponseTime: "< 2m",
      rating: 4.6,
      reviews: [
        { reviewer: "Mr.F", comment: "Accurate financial forecasting", rating: 5 },
        { reviewer: "Diana Grant", comment: "Great budget collaboration", rating: 4 },
      ],
    },
    analytics: { messagesPerDay: [32, 38, 35, 42, 45, 28, 22], tasksPerWeek: [55, 62, 58, 68], responseTimeMs: [980, 920, 950, 900] },
  },
  {
    id: "creative",
    name: "Jordan Spark",
    role: "Creative Director",
    specialty: "Branding, design concepts, marketing strategy, creative campaigns",
    avatar: "palette",
    company: "ARC Creative",
    level: "L1",
    category: "Creative",
    status: "online",
    bio: "Creative director leading branding, design, and marketing initiatives.",
    characterDescription: "Innovative, visionary, trend-aware. Brings fresh ideas and creative solutions to every challenge.",
    recentActivities: [
      { action: "Finalized brand refresh concepts", timestamp: "2025-12-20T10:15:00Z", type: "decision" },
      { action: "Reviewed marketing campaign assets", timestamp: "2025-12-19T14:30:00Z", type: "report" },
      { action: "Presented creative strategy", timestamp: "2025-12-18T11:00:00Z", type: "message" },
    ],
    voiceSettings: { enabled: true, voiceId: "nova", pitch: 1.08, speed: 1.02 },
    hrDetails: {
      performanceScore: 90,
      tasksCompleted: 534,
      avgResponseTime: "< 3m",
      rating: 4.7,
      reviews: [
        { reviewer: "Alex Vision", comment: "Inspiring creative direction", rating: 5 },
        { reviewer: "L0-Comms", comment: "Excellent brand consistency", rating: 5 },
      ],
    },
    analytics: { messagesPerDay: [28, 35, 32, 38, 42, 25, 18], tasksPerWeek: [48, 55, 52, 58], responseTimeMs: [1450, 1380, 1420, 1350] },
  },
  {
    id: "researcher",
    name: "Dr. Maya Quest",
    role: "Research Analyst",
    specialty: "Data analysis, market research, academic research, trend analysis",
    avatar: "search",
    company: "ARC Research",
    level: "L2",
    category: "Research",
    status: "online",
    bio: "Research analyst conducting in-depth data analysis and market research.",
    characterDescription: "Curious, methodical, evidence-based. Synthesizes complex information into actionable insights.",
    recentActivities: [
      { action: "Published market research findings", timestamp: "2025-12-20T11:30:00Z", type: "report" },
      { action: "Analyzed competitor landscape", timestamp: "2025-12-19T16:00:00Z", type: "report" },
      { action: "Completed literature review", timestamp: "2025-12-18T13:00:00Z", type: "report" },
    ],
    voiceSettings: { enabled: true, voiceId: "echo", pitch: 1.02, speed: 0.95 },
    hrDetails: {
      performanceScore: 94,
      tasksCompleted: 389,
      avgResponseTime: "< 5m",
      rating: 4.8,
      reviews: [
        { reviewer: "L0-Intel", comment: "Excellent research methodology", rating: 5 },
        { reviewer: "Mr.F", comment: "Valuable market insights", rating: 5 },
      ],
    },
    analytics: { messagesPerDay: [22, 28, 25, 32, 35, 18, 15], tasksPerWeek: [32, 38, 35, 42], responseTimeMs: [2800, 2650, 2720, 2580] },
  },
];

const getAvatarIcon = (avatar: string) => {
  const iconMap: Record<string, typeof Crown> = {
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
  return iconMap[avatar] || User;
};

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    Executive: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    Ops: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    Comms: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    Intel: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    Creative: "bg-pink-500/20 text-pink-400 border-pink-500/30",
    Finance: "bg-green-500/20 text-green-400 border-green-500/30",
    Legal: "bg-slate-500/20 text-slate-400 border-slate-500/30",
    Research: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  };
  return colors[category] || "bg-muted text-muted-foreground";
};

const getLevelColor = (level: string) => {
  const colors: Record<string, string> = {
    L0: "bg-red-500/20 text-red-400",
    L1: "bg-yellow-500/20 text-yellow-400",
    L2: "bg-blue-500/20 text-blue-400",
  };
  return colors[level] || "bg-muted text-muted-foreground";
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    online: "bg-green-500",
    busy: "bg-yellow-500",
    offline: "bg-gray-500",
  };
  return colors[status] || "bg-gray-500";
};

const groupAgentsByCategory = (agents: ExtendedAgent[]) => {
  const groups: Record<string, ExtendedAgent[]> = {};
  agents.forEach((agent) => {
    const key = agent.category;
    if (!groups[key]) groups[key] = [];
    groups[key].push(agent);
  });
  return groups;
};

const groupAgentsByLevel = (agents: ExtendedAgent[]) => {
  const groups: Record<string, ExtendedAgent[]> = {};
  agents.forEach((agent) => {
    const key = agent.level;
    if (!groups[key]) groups[key] = [];
    groups[key].push(agent);
  });
  return groups;
};

const groupAgentsByCompany = (agents: ExtendedAgent[]) => {
  const groups: Record<string, ExtendedAgent[]> = {};
  agents.forEach((agent) => {
    const key = agent.company;
    if (!groups[key]) groups[key] = [];
    groups[key].push(agent);
  });
  return groups;
};

type GroupByType = "category" | "level" | "company";

export default function InvestigationLounge() {
  const [selectedAgent, setSelectedAgent] = useState<ExtendedAgent | null>(null);
  const [mode, setMode] = useState<InvestigationMode>("view");
  const [groupBy, setGroupBy] = useState<GroupByType>("category");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(["Executive", "Ops", "Comms", "Intel", "L0", "ARC Core"]));

  const toggleGroup = (group: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(group)) {
      newExpanded.delete(group);
    } else {
      newExpanded.add(group);
    }
    setExpandedGroups(newExpanded);
  };

  const getGroupedAgents = () => {
    switch (groupBy) {
      case "level":
        return groupAgentsByLevel(EXTENDED_AGENTS);
      case "company":
        return groupAgentsByCompany(EXTENDED_AGENTS);
      default:
        return groupAgentsByCategory(EXTENDED_AGENTS);
    }
  };

  const groupedAgents = getGroupedAgents();

  const formatTimestamp = (ts: string) => {
    const date = new Date(ts);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderAgentCard = (agent: ExtendedAgent) => {
    const IconComponent = getAvatarIcon(agent.avatar);
    const isSelected = selectedAgent?.id === agent.id;

    return (
      <div
        key={agent.id}
        onClick={() => setSelectedAgent(agent)}
        className={`flex items-center gap-3 p-3 rounded-md cursor-pointer transition-all hover-elevate ${
          isSelected ? "bg-primary/10 ring-1 ring-primary" : "bg-card/50"
        }`}
        data-testid={`agent-card-${agent.id}`}
      >
        <div className="relative">
          <Avatar className="h-9 w-9">
            <AvatarFallback className={getCategoryColor(agent.category)}>
              <IconComponent className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <span
            className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${getStatusColor(agent.status)}`}
            data-testid={`status-${agent.id}`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate" data-testid={`text-agent-name-${agent.id}`}>
              {agent.name}
            </span>
            <Badge variant="outline" className={`text-xs ${getLevelColor(agent.level)}`}>
              {agent.level}
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground truncate block">{agent.role}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full" data-testid="investigation-lounge">
      <div className="w-80 border-r border-border flex flex-col bg-card/30">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground" data-testid="text-directory-title">
            Agent Directory
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Select an agent to investigate</p>
          <div className="flex gap-1 mt-3">
            <Button
              variant={groupBy === "category" ? "default" : "ghost"}
              size="sm"
              onClick={() => setGroupBy("category")}
              data-testid="button-group-category"
            >
              Category
            </Button>
            <Button
              variant={groupBy === "level" ? "default" : "ghost"}
              size="sm"
              onClick={() => setGroupBy("level")}
              data-testid="button-group-level"
            >
              Level
            </Button>
            <Button
              variant={groupBy === "company" ? "default" : "ghost"}
              size="sm"
              onClick={() => setGroupBy("company")}
              data-testid="button-group-company"
            >
              Company
            </Button>
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-3 space-y-2">
            {Object.entries(groupedAgents).map(([group, agents]) => (
              <Collapsible key={group} open={expandedGroups.has(group)} onOpenChange={() => toggleGroup(group)}>
                <CollapsibleTrigger className="flex items-center gap-2 w-full p-2 rounded-md hover-elevate text-left">
                  {expandedGroups.has(group) ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="font-medium text-sm">{group}</span>
                  <Badge variant="outline" className="ml-auto text-xs">
                    {agents.length}
                  </Badge>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 mt-1 ml-2">
                  {agents.map(renderAgentCard)}
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedAgent ? (
          <>
            <div className="p-4 border-b border-border flex items-center justify-between gap-4 bg-card/30">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className={getCategoryColor(selectedAgent.category)}>
                    {(() => {
                      const Icon = getAvatarIcon(selectedAgent.avatar);
                      return <Icon className="h-6 w-6" />;
                    })()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-xl font-semibold" data-testid="text-selected-agent-name">
                    {selectedAgent.name}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className={getLevelColor(selectedAgent.level)}>
                      {selectedAgent.level}
                    </Badge>
                    <Badge variant="outline" className={getCategoryColor(selectedAgent.category)}>
                      {selectedAgent.category}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{selectedAgent.company}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={mode === "view" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setMode("view")}
                  data-testid="button-mode-view"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button
                  variant={mode === "modify" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setMode("modify")}
                  data-testid="button-mode-modify"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Modify
                </Button>
                <Button
                  variant={mode === "confidential" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setMode("confidential")}
                  data-testid="button-mode-confidential"
                >
                  <Lock className="h-4 w-4 mr-1" />
                  Confidential
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4">
                {mode === "confidential" && (
                  <Card className="mb-4 border-secondary/50 bg-secondary/5">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-secondary">
                        <Lock className="h-5 w-5" />
                        <span className="font-medium">Confidential Meeting Mode Active</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        All interactions in this mode are encrypted and not logged. Proceed with authorized access only.
                      </p>
                    </CardContent>
                  </Card>
                )}

                <Tabs defaultValue="identity" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="identity" data-testid="tab-identity">
                      <User className="h-4 w-4 mr-1" />
                      Identity
                    </TabsTrigger>
                    <TabsTrigger value="activities" data-testid="tab-activities">
                      <Activity className="h-4 w-4 mr-1" />
                      Activities
                    </TabsTrigger>
                    <TabsTrigger value="voice" data-testid="tab-voice">
                      <Mic className="h-4 w-4 mr-1" />
                      Voice
                    </TabsTrigger>
                    <TabsTrigger value="hr" data-testid="tab-hr">
                      <Star className="h-4 w-4 mr-1" />
                      HR Details
                    </TabsTrigger>
                    <TabsTrigger value="analytics" data-testid="tab-analytics">
                      <BarChart3 className="h-4 w-4 mr-1" />
                      Analytics
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="identity" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Profile Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-muted-foreground">Full Name</label>
                            <p className="font-medium" data-testid="text-full-name">{selectedAgent.name}</p>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Role</label>
                            <p className="font-medium">{selectedAgent.role}</p>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Company</label>
                            <p className="font-medium flex items-center gap-1">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              {selectedAgent.company}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Level</label>
                            <Badge className={getLevelColor(selectedAgent.level)}>{selectedAgent.level}</Badge>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Specialty</label>
                          <p className="text-sm">{selectedAgent.specialty}</p>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Bio</label>
                          <p className="text-sm" data-testid="text-bio">{selectedAgent.bio}</p>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Character Description</label>
                          <p className="text-sm text-muted-foreground italic">{selectedAgent.characterDescription}</p>
                        </div>
                        {mode === "modify" && (
                          <div className="pt-4 border-t border-border">
                            <Button variant="outline" size="sm" data-testid="button-edit-profile">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit Profile
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="activities" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Recent Activities</CardTitle>
                        <CardDescription>Last actions, communications, and decisions</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {selectedAgent.recentActivities.map((activity, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-3 p-3 rounded-md bg-muted/30"
                              data-testid={`activity-${idx}`}
                            >
                              <div className="mt-0.5">
                                {activity.type === "message" && <MessageSquare className="h-4 w-4 text-blue-400" />}
                                {activity.type === "decision" && <Scale className="h-4 w-4 text-amber-400" />}
                                {activity.type === "report" && <FileText className="h-4 w-4 text-green-400" />}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium">{activity.action}</p>
                                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {formatTimestamp(activity.timestamp)}
                                  <Badge variant="outline" className="text-xs">
                                    {activity.type}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        {mode === "modify" && (
                          <div className="pt-4 mt-4 border-t border-border">
                            <Button variant="outline" size="sm" data-testid="button-add-activity">
                              Add Activity Log
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="voice" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Voice Configuration</CardTitle>
                        <CardDescription>Voice synthesis settings and samples</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {selectedAgent.voiceSettings.enabled ? (
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-green-500/20 text-green-400">Voice Enabled</Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <label className="text-xs text-muted-foreground">Voice ID</label>
                                <p className="font-mono text-sm">{selectedAgent.voiceSettings.voiceId}</p>
                              </div>
                              <div>
                                <label className="text-xs text-muted-foreground">Pitch</label>
                                <p className="font-mono text-sm">{selectedAgent.voiceSettings.pitch.toFixed(2)}</p>
                              </div>
                              <div>
                                <label className="text-xs text-muted-foreground">Speed</label>
                                <p className="font-mono text-sm">{selectedAgent.voiceSettings.speed.toFixed(2)}</p>
                              </div>
                            </div>
                            <div className="pt-4 border-t border-border">
                              <Button variant="outline" size="sm" data-testid="button-play-sample">
                                <Mic className="h-4 w-4 mr-1" />
                                Play Voice Sample
                              </Button>
                              {mode === "modify" && (
                                <Button variant="ghost" size="sm" className="ml-2" data-testid="button-configure-voice">
                                  Configure Voice
                                </Button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Mic className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-muted-foreground">Voice not configured for this agent</p>
                            {mode === "modify" && (
                              <Button variant="outline" size="sm" className="mt-4" data-testid="button-enable-voice">
                                Enable Voice
                              </Button>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="hr" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Performance Metrics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-4 rounded-md bg-muted/30">
                              <p className="text-3xl font-bold text-primary">{selectedAgent.hrDetails.performanceScore}</p>
                              <p className="text-xs text-muted-foreground">Performance Score</p>
                            </div>
                            <div className="text-center p-4 rounded-md bg-muted/30">
                              <p className="text-3xl font-bold">{selectedAgent.hrDetails.tasksCompleted.toLocaleString()}</p>
                              <p className="text-xs text-muted-foreground">Tasks Completed</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs text-muted-foreground">Avg Response Time</label>
                              <p className="font-medium">{selectedAgent.hrDetails.avgResponseTime}</p>
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">Overall Rating</label>
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                                <span className="font-medium">{selectedAgent.hrDetails.rating.toFixed(1)}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Reviews</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {selectedAgent.hrDetails.reviews.map((review, idx) => (
                              <div key={idx} className="p-3 rounded-md bg-muted/30">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-medium">{review.reviewer}</span>
                                  <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                                    <span className="text-xs">{review.rating}</span>
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground">{review.comment}</p>
                              </div>
                            ))}
                          </div>
                          {mode === "modify" && (
                            <Button variant="outline" size="sm" className="mt-4" data-testid="button-add-review">
                              Add Review
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="analytics" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Activity Analytics</CardTitle>
                        <CardDescription>Performance patterns and trends</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-6">
                          <div>
                            <label className="text-xs text-muted-foreground mb-2 block">Messages Per Day (Last 7 days)</label>
                            <div className="flex items-end gap-1 h-24">
                              {selectedAgent.analytics.messagesPerDay.map((val, idx) => (
                                <div
                                  key={idx}
                                  className="flex-1 bg-primary/60 rounded-t"
                                  style={{ height: `${(val / Math.max(...selectedAgent.analytics.messagesPerDay)) * 100}%` }}
                                  title={`Day ${idx + 1}: ${val} messages`}
                                />
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground mb-2 block">Tasks Per Week (Last 4 weeks)</label>
                            <div className="flex items-end gap-1 h-24">
                              {selectedAgent.analytics.tasksPerWeek.map((val, idx) => (
                                <div
                                  key={idx}
                                  className="flex-1 bg-secondary/60 rounded-t"
                                  style={{ height: `${(val / Math.max(...selectedAgent.analytics.tasksPerWeek)) * 100}%` }}
                                  title={`Week ${idx + 1}: ${val} tasks`}
                                />
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground mb-2 block">Response Time Trend (ms)</label>
                            <div className="flex items-end gap-1 h-24">
                              {selectedAgent.analytics.responseTimeMs.map((val, idx) => (
                                <div
                                  key={idx}
                                  className="flex-1 bg-amber-500/60 rounded-t"
                                  style={{ height: `${(val / Math.max(...selectedAgent.analytics.responseTimeMs)) * 100}%` }}
                                  title={`Period ${idx + 1}: ${val}ms`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-border grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-2xl font-bold">
                              {Math.round(selectedAgent.analytics.messagesPerDay.reduce((a, b) => a + b, 0) / 7)}
                            </p>
                            <p className="text-xs text-muted-foreground">Avg Messages/Day</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold">
                              {Math.round(selectedAgent.analytics.tasksPerWeek.reduce((a, b) => a + b, 0) / 4)}
                            </p>
                            <p className="text-xs text-muted-foreground">Avg Tasks/Week</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold">
                              {Math.round(selectedAgent.analytics.responseTimeMs.reduce((a, b) => a + b, 0) / 4)}ms
                            </p>
                            <p className="text-xs text-muted-foreground">Avg Response Time</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">Investigation Garage</h2>
              <p className="text-muted-foreground max-w-md">
                Select an agent from the directory to begin your investigation. View identity, activities, voice settings, HR details, and analytics.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
