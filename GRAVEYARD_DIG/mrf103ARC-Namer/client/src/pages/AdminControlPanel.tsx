import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Shield,
  Users,
  Bot,
  Briefcase,
  Settings,
  Activity,
  Database,
  Zap,
  Plus,
  Trash2,
  Edit,
  Save,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Brain,
  Link,
  Mail,
  Phone,
  Globe,
  MessageSquare,
  TrendingUp,
  BarChart3,
  Target,
  Network,
  Cpu,
} from "lucide-react";
import { VIRTUAL_AGENTS, type InsertAgent } from "@shared/schema";

interface Agent {
  id: string;
  name: string;
  role: string;
  systemPrompt: string;
  specializations: string[];
  capabilities: string[];
  model: string;
  temperature: number;
  maxTokens: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Project {
  id: string;
  name: string;
  description: string;
  type: "individual" | "company" | "enterprise";
  status: "active" | "paused" | "completed";
  assignedAgents: string[];
  owner: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CoreAgentCapability {
  id: string;
  name: string;
  type: "communication" | "automation" | "analysis" | "integration";
  enabled: boolean;
  config: Record<string, any>;
}

const CORE_CAPABILITIES: CoreAgentCapability[] = [
  {
    id: "email",
    name: "Email Management",
    type: "communication",
    enabled: true,
    config: { provider: "smtp", autoRespond: true }
  },
  {
    id: "whatsapp",
    name: "WhatsApp Integration",
    type: "communication",
    enabled: true,
    config: { businessApi: true, autoReply: true }
  },
  {
    id: "calls",
    name: "Phone Calls (Twilio)",
    type: "communication",
    enabled: false,
    config: { provider: "twilio", voiceAI: true }
  },
  {
    id: "social-media",
    name: "Social Media Manager",
    type: "automation",
    enabled: true,
    config: { platforms: ["twitter", "linkedin", "instagram"], autoPost: true }
  },
  {
    id: "ad-campaigns",
    name: "Ad Campaign Manager",
    type: "automation",
    enabled: true,
    config: { platforms: ["google-ads", "facebook-ads"], budget: 5000 }
  },
  {
    id: "web-scraping",
    name: "Web Data Extraction",
    type: "integration",
    enabled: true,
    config: { respectRobots: true, rateLimit: 10 }
  },
  {
    id: "market-analysis",
    name: "Market Intelligence",
    type: "analysis",
    enabled: true,
    config: { sources: ["news", "social", "competitor"], frequency: "daily" }
  },
];

export default function AdminControlPanel() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [newAgentForm, setNewAgentForm] = useState<Partial<Agent>>({
    name: "",
    role: "",
    systemPrompt: "",
    specializations: [],
    capabilities: [],
    model: "gpt-4",
    temperature: 0.7,
    maxTokens: 4000,
    active: true,
  });
  const [newProjectForm, setNewProjectForm] = useState<Partial<Project>>({
    name: "",
    description: "",
    type: "individual",
    status: "active",
    assignedAgents: [],
    owner: "",
  });
  const [coreCapabilities, setCoreCapabilities] = useState(CORE_CAPABILITIES);

  // Queries
  const systemStatsQuery = useQuery({
    queryKey: ["/api/admin/stats"],
    retry: false,
  });

  const agentsQuery = useQuery<Agent[]>({
    queryKey: ["/api/admin/agents"],
    retry: false,
  });

  const projectsQuery = useQuery<Project[]>({
    queryKey: ["/api/admin/projects"],
    retry: false,
  });

  // Mutations
  const createAgentMutation = useMutation({
    mutationFn: async (agent: Partial<Agent>) => {
      const res = await fetch("/api/admin/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(agent),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create agent");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/agents"] });
      toast({ title: "Agent Created", description: "New agent added successfully" });
      setNewAgentForm({
        name: "",
        role: "",
        systemPrompt: "",
        specializations: [],
        capabilities: [],
        model: "gpt-4",
        temperature: 0.7,
        maxTokens: 4000,
        active: true,
      });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create agent", variant: "destructive" });
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (project: Partial<Project>) => {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(project),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create project");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/projects"] });
      toast({ title: "Project Created", description: "New project added successfully" });
      setNewProjectForm({
        name: "",
        description: "",
        type: "individual",
        status: "active",
        assignedAgents: [],
        owner: "",
      });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create project", variant: "destructive" });
    },
  });

  const updateCapabilityMutation = useMutation({
    mutationFn: async (capability: CoreAgentCapability) => {
      const res = await fetch("/api/admin/capabilities", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(capability),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update capability");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Updated", description: "Core capability updated successfully" });
    },
  });

  const handleCreateAgent = () => {
    if (!newAgentForm.name || !newAgentForm.role || !newAgentForm.systemPrompt) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }
    createAgentMutation.mutate(newAgentForm);
  };

  const handleCreateProject = () => {
    if (!newProjectForm.name || !newProjectForm.description) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }
    createProjectMutation.mutate(newProjectForm);
  };

  const handleToggleCapability = (capabilityId: string) => {
    const capability = coreCapabilities.find((c) => c.id === capabilityId);
    if (capability) {
      const updated = { ...capability, enabled: !capability.enabled };
      setCoreCapabilities((prev) =>
        prev.map((c) => (c.id === capabilityId ? updated : c))
      );
      updateCapabilityMutation.mutate(updated);
    }
  };

  const stats = systemStatsQuery.data as any || {
    totalAgents: 10,
    activeAgents: 10,
    totalProjects: 0,
    activeProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    systemUptime: 0,
    avgResponseTime: 0,
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1">
            <h1 className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Admin Control Panel
            </h1>
          </div>
          <Badge variant="outline" className="bg-success/20 text-success border-success/50">
            <Activity className="h-3 w-3 mr-1" />
            System Online
          </Badge>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-6 overflow-auto bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
    <div className="max-w-7xl mx-auto space-y-6 w-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              🛡️ ARC Admin Control Panel
            </h1>
            <p className="text-slate-400 mt-2">Master Control for Virtual Office System</p>
          </div>
          <Badge className="bg-success/20 text-success border-success/50 px-4 py-2">
            <Activity className="w-4 h-4 mr-2" />
            System Online
          </Badge>
        </div>

        {/* System Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-primary/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
                <Bot className="w-4 h-4" />
                Agents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{stats.activeAgents}</p>
              <p className="text-xs text-slate-400 mt-1">
                {stats.totalAgents} Total
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-secondary/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-secondary">{stats.activeProjects}</p>
              <p className="text-xs text-slate-400 mt-1">
                {stats.totalProjects} Total
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-success/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-success">{stats.completedTasks}</p>
              <p className="text-xs text-slate-400 mt-1">
                {stats.totalTasks} Total
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-warning/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-300 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-warning">
                {stats.avgResponseTime}ms
              </p>
              <p className="text-xs text-slate-400 mt-1">Avg Response</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="core-agent">Core Agent</TabsTrigger>
            <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  System Health Monitor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>System Uptime</span>
                      <span className="text-success">99.9%</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-success w-[99.9%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Agent Efficiency</span>
                      <span className="text-primary">95.3%</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-[95.3%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Task Success Rate</span>
                      <span className="text-secondary">92.7%</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-secondary w-[92.7%]" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-lg">Active Agents</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2">
                      {VIRTUAL_AGENTS.slice(0, 10).map((agent) => (
                        <div
                          key={agent.id}
                          className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                            <div>
                              <p className="font-medium">{agent.name}</p>
                              <p className="text-xs text-slate-400">{agent.role}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            Active
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-3">
                      {[
                        { agent: "Mr.F", action: "Orchestrated 12 tasks", time: "2m ago" },
                        { agent: "L0-Ops", action: "Completed system audit", time: "5m ago" },
                        { agent: "L0-Intel", action: "Generated market report", time: "15m ago" },
                        { agent: "Sarah Numbers", action: "Updated financials", time: "23m ago" },
                        { agent: "Marcus Law", action: "Reviewed contracts", time: "45m ago" },
                      ].map((activity, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg"
                        >
                          <CheckCircle className="w-4 h-4 text-success mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.agent}</p>
                            <p className="text-xs text-slate-400">{activity.action}</p>
                          </div>
                          <span className="text-xs text-slate-500">{activity.time}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Agents Tab */}
          <TabsContent value="agents" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add New Agent
                </CardTitle>
                <CardDescription>Create a new AI agent for the system</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Agent Name"
                    value={newAgentForm.name}
                    onChange={(e) =>
                      setNewAgentForm({ ...newAgentForm, name: e.target.value })
                    }
                    className="bg-slate-700/50 border-slate-600"
                  />
                  <Input
                    placeholder="Role/Title"
                    value={newAgentForm.role}
                    onChange={(e) =>
                      setNewAgentForm({ ...newAgentForm, role: e.target.value })
                    }
                    className="bg-slate-700/50 border-slate-600"
                  />
                </div>
                <Textarea
                  placeholder="System Prompt (defines agent personality and capabilities)"
                  value={newAgentForm.systemPrompt}
                  onChange={(e) =>
                    setNewAgentForm({ ...newAgentForm, systemPrompt: e.target.value })
                  }
                  className="bg-slate-700/50 border-slate-600 min-h-[120px]"
                />
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    placeholder="Model (gpt-4, claude-3)"
                    value={newAgentForm.model}
                    onChange={(e) =>
                      setNewAgentForm({ ...newAgentForm, model: e.target.value })
                    }
                    className="bg-slate-700/50 border-slate-600"
                  />
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Temperature"
                    value={newAgentForm.temperature}
                    onChange={(e) =>
                      setNewAgentForm({
                        ...newAgentForm,
                        temperature: parseFloat(e.target.value),
                      })
                    }
                    className="bg-slate-700/50 border-slate-600"
                  />
                  <Input
                    type="number"
                    placeholder="Max Tokens"
                    value={newAgentForm.maxTokens}
                    onChange={(e) =>
                      setNewAgentForm({
                        ...newAgentForm,
                        maxTokens: parseInt(e.target.value),
                      })
                    }
                    className="bg-slate-700/50 border-slate-600"
                  />
                </div>
                <Button
                  onClick={handleCreateAgent}
                  disabled={createAgentMutation.isPending}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {createAgentMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Agent
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle>Existing Agents ({VIRTUAL_AGENTS.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {VIRTUAL_AGENTS.map((agent) => (
                      <div
                        key={agent.id}
                        className="p-4 bg-slate-700/50 rounded-lg border border-slate-600"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">{agent.name}</h3>
                              <Badge variant="outline" className="text-xs">
                                {agent.role}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-400 mb-3">
                              {agent.systemPrompt.substring(0, 150)}...
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {(agent as any).specializations?.slice(0, 3).map((spec: string, idx: number) => (
                                <Badge key={idx} className="text-xs bg-primary/20">
                                  {spec}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" className="text-primary">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Create New Project
                </CardTitle>
                <CardDescription>
                  Add individual user, company, or enterprise project
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Project Name"
                    value={newProjectForm.name}
                    onChange={(e) =>
                      setNewProjectForm({ ...newProjectForm, name: e.target.value })
                    }
                    className="bg-slate-700/50 border-slate-600"
                  />
                  <select
                    value={newProjectForm.type}
                    onChange={(e) =>
                      setNewProjectForm({
                        ...newProjectForm,
                        type: e.target.value as any,
                      })
                    }
                    className="bg-slate-700/50 border border-slate-600 rounded-md px-3 py-2 text-white"
                  >
                    <option value="individual">Individual</option>
                    <option value="company">Company</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <Textarea
                  placeholder="Project Description"
                  value={newProjectForm.description}
                  onChange={(e) =>
                    setNewProjectForm({ ...newProjectForm, description: e.target.value })
                  }
                  className="bg-slate-700/50 border-slate-600 min-h-[100px]"
                />
                <Input
                  placeholder="Project Owner"
                  value={newProjectForm.owner}
                  onChange={(e) =>
                    setNewProjectForm({ ...newProjectForm, owner: e.target.value })
                  }
                  className="bg-slate-700/50 border-slate-600"
                />
                <Button
                  onClick={handleCreateProject}
                  disabled={createProjectMutation.isPending}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {createProjectMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Project
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {projectsQuery.data && projectsQuery.data.length > 0 && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle>Active Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {projectsQuery.data.map((project) => (
                        <div
                          key={project.id}
                          className="p-4 bg-slate-700/50 rounded-lg border border-slate-600"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-semibold text-lg">{project.name}</h3>
                              <p className="text-sm text-slate-400">{project.description}</p>
                            </div>
                            <Badge
                              className={
                                project.status === "active"
                                  ? "bg-success/20 text-success"
                                  : "bg-warning/20 text-warning"
                              }
                            >
                              {project.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {project.type}
                            </span>
                            <span className="flex items-center gap-1">
                              <Bot className="w-3 h-3" />
                              {project.assignedAgents.length} agents
                            </span>
                            <span>{project.owner}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Core Agent Tab */}
          <TabsContent value="core-agent" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="w-5 h-5" />
                  Core Agent Configuration
                </CardTitle>
                <CardDescription>
                  Central AI brain that orchestrates all agents and capabilities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary" />
                    Core Agent Status
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Model:</span>
                      <span className="ml-2 text-white font-medium">GPT-4 Turbo</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Status:</span>
                      <span className="ml-2 text-success font-medium flex items-center gap-1">
                        <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                        Online
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">Connected Agents:</span>
                      <span className="ml-2 text-white font-medium">10</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Active Tasks:</span>
                      <span className="ml-2 text-white font-medium">3</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-slate-300">Core Functions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      {
                        icon: Network,
                        title: "Agent Orchestration",
                        desc: "Coordinates all sub-agents",
                      },
                      {
                        icon: Target,
                        title: "Task Distribution",
                        desc: "Assigns tasks to specialized agents",
                      },
                      {
                        icon: Brain,
                        title: "Decision Making",
                        desc: "Makes strategic decisions",
                      },
                      {
                        icon: Zap,
                        title: "Real-time Processing",
                        desc: "Processes requests instantly",
                      },
                    ].map((func, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-700/50 rounded-lg flex items-start gap-3"
                      >
                        <func.icon className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">{func.title}</p>
                          <p className="text-xs text-slate-400">{func.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Capabilities Tab */}
          <TabsContent value="capabilities" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Core Capabilities
                </CardTitle>
                <CardDescription>
                  Enable/disable system-wide capabilities for all agents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {coreCapabilities.map((capability) => (
                    <div
                      key={capability.id}
                      className="p-4 bg-slate-700/50 rounded-lg border border-slate-600"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {capability.type === "communication" && (
                            <MessageSquare className="w-5 h-5 text-primary" />
                          )}
                          {capability.type === "automation" && (
                            <Zap className="w-5 h-5 text-secondary" />
                          )}
                          {capability.type === "analysis" && (
                            <BarChart3 className="w-5 h-5 text-success" />
                          )}
                          {capability.type === "integration" && (
                            <Link className="w-5 h-5 text-warning" />
                          )}
                          <div>
                            <h3 className="font-semibold">{capability.name}</h3>
                            <p className="text-xs text-slate-400">
                              Type: {capability.type}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleToggleCapability(capability.id)}
                          className={
                            capability.enabled
                              ? "bg-success hover:bg-success/80"
                              : "bg-slate-600 hover:bg-slate-700"
                          }
                        >
                          {capability.enabled ? "Enabled" : "Disabled"}
                        </Button>
                      </div>
                      <div className="mt-3 text-xs text-slate-400">
                        <pre className="bg-slate-800/50 p-2 rounded">
                          {JSON.stringify(capability.config, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
