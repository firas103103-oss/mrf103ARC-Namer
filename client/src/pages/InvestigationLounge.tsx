import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
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
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { VirtualAgent } from "@shared/schema";
import { useDashboard } from "@/hooks/useDashboard";
import { useRealtimeEvents } from "@/hooks/useRealtimeEvents";

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

interface ActivityFeedItem {
  id: string;
  agent_id: string;
  action: string;
  type: string;
  created_at: string;
}

const AGENT_CONFIG: Record<string, { company: string; level: "L0" | "L1" | "L2"; category: ExtendedAgent["category"]; voiceId: string }> = {
  "mrf": { company: "ARC Core", level: "L0", category: "Executive", voiceId: "echo" },
  "l0-ops": { company: "ARC Core", level: "L0", category: "Ops", voiceId: "alloy" },
  "l0-comms": { company: "ARC Core", level: "L0", category: "Comms", voiceId: "nova" },
  "l0-intel": { company: "ARC Core", level: "L0", category: "Intel", voiceId: "onyx" },
  "photographer": { company: "ARC Creative", level: "L1", category: "Creative", voiceId: "" },
  "grants": { company: "ARC Finance", level: "L1", category: "Finance", voiceId: "shimmer" },
  "legal": { company: "ARC Legal", level: "L1", category: "Legal", voiceId: "fable" },
  "finance": { company: "ARC Finance", level: "L1", category: "Finance", voiceId: "alloy" },
  "creative": { company: "ARC Creative", level: "L1", category: "Creative", voiceId: "nova" },
  "researcher": { company: "ARC Research", level: "L2", category: "Research", voiceId: "echo" },
};

const DEFAULT_BIO: Record<string, string> = {
  "mrf": "The supreme executive orchestrator of the ARC Virtual Office. Coordinates all strategic initiatives and ensures enterprise operations run with maximum efficiency.",
  "l0-ops": "Level-0 Operations Commander responsible for all operational workflows and system optimization across the organization.",
  "l0-comms": "Level-0 Communications Director managing all internal and external messaging across the organization.",
  "l0-intel": "Level-0 Intelligence Analyst synthesizing data from multiple sources to provide actionable strategic insights.",
  "photographer": "Professional photography specialist helping with visual content creation and image optimization.",
  "grants": "Grants and funding specialist identifying opportunities and crafting compelling proposals.",
  "legal": "Legal advisor specializing in business law, contracts, and compliance matters.",
  "finance": "Financial analyst providing budgeting, planning, and investment analysis support.",
  "creative": "Creative director leading branding, design, and marketing initiatives.",
  "researcher": "Research analyst conducting in-depth data analysis and market research.",
};

const DEFAULT_CHARACTER: Record<string, string> = {
  "mrf": "Authoritative, decisive, strategic thinker with a commanding presence. Speaks with confidence and clarity.",
  "l0-ops": "Efficient, methodical, detail-oriented. Always focused on optimization and process improvement.",
  "l0-comms": "Articulate, diplomatic, excellent at crafting clear messages. Natural communicator with strong interpersonal skills.",
  "l0-intel": "Analytical, perceptive, data-driven. Excels at identifying patterns and extracting meaningful insights from complex information.",
  "photographer": "Creative, visually oriented, detail-focused. Has an eye for composition and lighting.",
  "grants": "Detail-oriented, persuasive writer, knowledgeable about funding landscapes. Persistent and thorough.",
  "legal": "Precise, cautious, thorough. Excellent at identifying legal risks and protecting organizational interests.",
  "finance": "Analytical, numbers-focused, practical. Makes complex financial concepts accessible.",
  "creative": "Innovative, visionary, trend-aware. Brings fresh ideas and creative solutions to every challenge.",
  "researcher": "Curious, methodical, evidence-based. Synthesizes complex information into actionable insights.",
};

function mapVirtualAgentToExtended(
  agent: VirtualAgent,
  activities: ActivityFeedItem[]
): ExtendedAgent {
  const config = AGENT_CONFIG[agent.id] || { company: "ARC", level: "L1" as const, category: "Ops" as const, voiceId: "" };
  
  const agentActivities = activities
    .filter(a => a.agent_id === agent.id || a.agent_id === agent.name)
    .slice(0, 3)
    .map(a => ({
      action: a.action || "Activity recorded",
      timestamp: a.created_at || new Date().toISOString(),
      type: (a.type === "message" || a.type === "decision" || a.type === "report" ? a.type : "message") as "message" | "decision" | "report",
    }));

  const defaultActivities = [
    { action: "System initialized", timestamp: new Date().toISOString(), type: "message" as const },
    { action: "Ready for operations", timestamp: new Date(Date.now() - 3600000).toISOString(), type: "report" as const },
  ];

  const statuses: ("online" | "busy" | "offline")[] = ["online", "busy", "offline"];
  const randomStatus = statuses[Math.floor(Math.random() * 2)];

  const basePerformance = 85 + Math.floor(Math.random() * 15);
  const baseTasks = 200 + Math.floor(Math.random() * 1000);

  return {
    id: agent.id,
    name: agent.name,
    role: agent.role,
    specialty: agent.specialty,
    avatar: agent.avatar,
    company: config.company,
    level: config.level,
    category: config.category,
    status: randomStatus,
    bio: DEFAULT_BIO[agent.id] || agent.specialty,
    characterDescription: DEFAULT_CHARACTER[agent.id] || "Professional and efficient agent.",
    recentActivities: agentActivities.length > 0 ? agentActivities : defaultActivities,
    voiceSettings: {
      enabled: !!config.voiceId,
      voiceId: config.voiceId,
      pitch: 0.9 + Math.random() * 0.2,
      speed: 0.9 + Math.random() * 0.2,
    },
    hrDetails: {
      performanceScore: basePerformance,
      tasksCompleted: baseTasks,
      avgResponseTime: `< ${Math.floor(30 + Math.random() * 180)}s`,
      rating: 4.3 + Math.random() * 0.7,
      reviews: [
        { reviewer: "System Admin", comment: "Consistent performance and reliability", rating: 5 },
        { reviewer: "Mr.F", comment: "Meets expectations for assigned role", rating: 4 },
      ],
    },
    analytics: {
      messagesPerDay: Array.from({ length: 7 }, () => Math.floor(20 + Math.random() * 60)),
      tasksPerWeek: Array.from({ length: 4 }, () => Math.floor(30 + Math.random() * 100)),
      responseTimeMs: Array.from({ length: 4 }, () => Math.floor(300 + Math.random() * 2500)),
    },
  };
}

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
  const { timeline, isLoading: timelineLoading, error: timelineError } = useDashboard();
  const { realtimeTimeline } = useRealtimeEvents();
  const [selectedAgent, setSelectedAgent] = useState<ExtendedAgent | null>(null);
  const [mode, setMode] = useState<InvestigationMode>("view");
  const [groupBy, setGroupBy] = useState<GroupByType>("category");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(["Executive", "Ops", "Comms", "Intel", "L0", "ARC Core"]));

  const { data: agentsData, isLoading: agentsLoading, error: agentsError } = useQuery<VirtualAgent[]>({
    queryKey: ["/api/agents"],
  });

  const { data: activityData, isLoading: activityLoading } = useQuery<ActivityFeedItem[]>({
    queryKey: ["/api/activity"],
  });

  const extendedAgents = useMemo(() => {
    if (!agentsData) return [];
    const activities = activityData || [];
    return agentsData.map(agent => mapVirtualAgentToExtended(agent, activities));
  }, [agentsData, activityData]);

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
        return groupAgentsByLevel(extendedAgents);
      case "company":
        return groupAgentsByCompany(extendedAgents);
      default:
        return groupAgentsByCategory(extendedAgents);
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

  const isLoading = agentsLoading || activityLoading;

  if (agentsError) {
    return (
      <div className="flex h-full items-center justify-center" data-testid="investigation-lounge-error">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Failed to Load Agents</h2>
          <p className="text-muted-foreground max-w-md">
            Unable to fetch agent data. Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center" data-testid="investigation-lounge-loading">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Loading Agent Directory</h2>
          <p className="text-muted-foreground">Fetching agent data and activity feeds...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <h1 className="text-lg font-semibold">Investigation Lounge</h1>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 overflow-auto">
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
        <div className="p-4 border-b border-border">
          <Card data-testid="card-timeline-basic">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Timeline
              </CardTitle>
              <CardDescription>Latest merged command + event activity</CardDescription>
            </CardHeader>
            <CardContent className="text-sm">
              {timelineLoading && <div className="text-muted-foreground">Loading...</div>}
              {timelineError && (
                <div className="text-destructive">
                  {timelineError instanceof Error ? timelineError.message : "Failed to load timeline"}
                </div>
              )}
              {!timelineLoading && !timelineError && timeline.length === 0 && (
                <div className="text-muted-foreground">No timeline entries.</div>
              )}
              {!timelineLoading && !timelineError && timeline.length > 0 && (
                <div className="space-y-1">
                  {[...timeline, ...(realtimeTimeline || [])]
                    .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                    .slice(-12)
                    .map((it: any) => (
                    <div key={`${it.type}-${it.id}`} className="flex items-center justify-between gap-2">
                      <span className="text-foreground truncate">
                        {it.type === "command"
                          ? `CMD: ${it.command || it.command_id || it.id}`
                          : `EVT: ${it.agent_name || "agent"} / ${it.event_type || it.id}`}
                      </span>
                      <span className="text-muted-foreground whitespace-nowrap">
                        {it.created_at ? new Date(it.created_at).toLocaleTimeString() : ""}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
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
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
