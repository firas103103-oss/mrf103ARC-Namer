import { useTranslation } from "react-i18next";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Shield,
  Brain,
  Cpu,
  Database,
  Server,
  Zap,
  Users,
  MessageSquare,
  Mic2,
  BarChart3,
  Search,
  Crosshair,
  Clock,
  Target,
  Workflow,
  TrendingUp,
  Activity,
  Terminal,
  Home,
  LayoutDashboard,
  Radio,
  Camera,
  FileText,
  Scale,
  Palette,
  Sparkles,
  Network,
  Globe,
  Smartphone,
  Lock,
  Key,
  ArrowRight,
  CheckCircle2,
  Circle,
  Layers,
  Box,
  GitBranch,
  Cloud,
  HardDrive,
} from "lucide-react";

const VIRTUAL_AGENTS = [
  { id: "mrf", name: "Mr.F", role: "Executive Orchestrator", icon: "crown", color: "text-warning" },
  { id: "l0-ops", name: "L0-Ops", role: "Operations Commander", icon: "settings", color: "text-primary" },
  { id: "l0-comms", name: "L0-Comms", role: "Communications Director", icon: "radio", color: "text-success" },
  { id: "l0-intel", name: "L0-Intel", role: "Intelligence Analyst", icon: "brain", color: "text-secondary" },
  { id: "photographer", name: "Alex Vision", role: "Photography Specialist", icon: "camera", color: "text-pink-500" },
  { id: "grants", name: "Diana Grant", role: "Grants Specialist", icon: "file-text", color: "text-orange-500" },
  { id: "legal", name: "Marcus Law", role: "Legal Advisor", icon: "scale", color: "text-destructive" },
  { id: "finance", name: "Sarah Numbers", role: "Financial Analyst", icon: "trending-up", color: "text-success" },
  { id: "creative", name: "Jordan Spark", role: "Creative Director", icon: "palette", color: "text-primary" },
  { id: "researcher", name: "Dr. Maya Quest", role: "Research Analyst", icon: "search", color: "text-secondary" },
];

const CAPABILITIES = [
  { name: "Virtual Office", description: "Multi-agent AI chat with 10 specialized agents", icon: Home, status: "active", category: "core" },
  { name: "Voice Chat", description: "Bidirectional voice with TTS and Speech Recognition", icon: Mic2, status: "active", category: "communications" },
  { name: "Dashboard", description: "Real-time monitoring of commands and events", icon: LayoutDashboard, status: "active", category: "operations" },
  { name: "Team Command", description: "Task management and agent coordination", icon: Target, status: "active", category: "operations" },
  { name: "Operations Simulator", description: "Workflow builder with 4 step types", icon: Workflow, status: "active", category: "operations" },
  { name: "Analytics Hub", description: "Business intelligence and metrics", icon: TrendingUp, status: "active", category: "intelligence" },
  { name: "Investigation Lounge", description: "Agent investigation and analysis", icon: Search, status: "active", category: "intelligence" },
  { name: "Quantum WarRoom", description: "AI-powered tactical recommendations", icon: Crosshair, status: "active", category: "intelligence" },
  { name: "Temporal Anomaly Lab", description: "Real-time anomaly detection", icon: Clock, status: "active", category: "intelligence" },
  { name: "Bio Sentinel", description: "ESP32 BME688 smell identification", icon: Zap, status: "active", category: "hardware" },
  { name: "Command Logs", description: "Historical command tracking", icon: Terminal, status: "active", category: "monitoring" },
  { name: "System Monitor", description: "Health and reflex events", icon: Activity, status: "active", category: "monitoring" },
  { name: "Self Check", description: "System diagnostics and brain state", icon: Shield, status: "active", category: "monitoring" },
  { name: "Metrics", description: "Command performance analytics", icon: BarChart3, status: "active", category: "monitoring" },
  { name: "Agent Voices", description: "Voice configuration per agent", icon: Users, status: "active", category: "communications" },
  { name: "Voice Selector", description: "AI voice preferences", icon: MessageSquare, status: "active", category: "communications" },
];

const API_ENDPOINTS = {
  authentication: [
    { method: "GET", path: "/api/login", description: "Initiate OIDC login" },
    { method: "GET", path: "/api/logout", description: "End session" },
    { method: "GET", path: "/api/callback", description: "OAuth callback" },
    { method: "GET", path: "/api/auth/user", description: "Get authenticated user" },
    { method: "GET", path: "/api/health", description: "Health check endpoint" },
  ],
  virtualOffice: [
    { method: "GET", path: "/api/agents", description: "List all 10 agents" },
    { method: "POST", path: "/api/chat", description: "Send message to agents" },
    { method: "POST", path: "/api/tts", description: "Text-to-speech synthesis" },
    { method: "GET", path: "/api/conversations", description: "List conversations" },
    { method: "POST", path: "/api/conversations", description: "Create conversation" },
    { method: "GET", path: "/api/conversations/:id", description: "Get conversation" },
    { method: "GET", path: "/api/conversations/:id/messages", description: "Get messages" },
  ],
  dashboard: [
    { method: "GET", path: "/api/dashboard/commands", description: "Command log history" },
    { method: "GET", path: "/api/dashboard/events", description: "Agent event log" },
    { method: "GET", path: "/api/dashboard/feedback", description: "n8n callback data" },
    { method: "GET", path: "/api/dashboard/metrics", description: "Aggregated metrics" },
    { method: "GET", path: "/api/agents/performance", description: "Performance by agent" },
    { method: "GET", path: "/api/agents/anomalies", description: "Anomaly detection" },
    { method: "GET", path: "/api/agents/analytics", description: "Analytics data" },
  ],
  teamManagement: [
    { method: "GET", path: "/api/team/tasks", description: "List tasks" },
    { method: "POST", path: "/api/team/tasks", description: "Create task" },
    { method: "PATCH", path: "/api/team/tasks/:id", description: "Update task" },
    { method: "GET", path: "/api/activity", description: "Get activity feed" },
    { method: "POST", path: "/api/activity", description: "Log activity" },
  ],
  operations: [
    { method: "GET", path: "/api/simulations", description: "List workflows" },
    { method: "POST", path: "/api/simulations", description: "Create workflow" },
    { method: "PATCH", path: "/api/simulations/:id", description: "Update workflow" },
    { method: "POST", path: "/api/simulations/:id/run", description: "Execute workflow" },
    { method: "GET", path: "/api/scenarios", description: "List mission scenarios" },
    { method: "POST", path: "/api/scenarios", description: "Create scenario" },
    { method: "PATCH", path: "/api/scenarios/:id", description: "Update scenario" },
  ],
  bioSentinel: [
    { method: "GET", path: "/api/bio-sentinel/profiles", description: "Smell profiles" },
    { method: "POST", path: "/api/bio-sentinel/profiles", description: "Create profile" },
    { method: "GET", path: "/api/bio-sentinel/profiles/:id", description: "Get profile" },
    { method: "DELETE", path: "/api/bio-sentinel/profiles/:id", description: "Delete profile" },
    { method: "POST", path: "/api/bio-sentinel/readings", description: "Sensor data" },
    { method: "GET", path: "/api/bio-sentinel/readings", description: "Get readings" },
    { method: "POST", path: "/api/bio-sentinel/chat", description: "AI smell analysis" },
    { method: "GET", path: "/api/bio-sentinel/export", description: "Export profiles" },
    { method: "POST", path: "/api/bio-sentinel/import", description: "Import profiles" },
    { method: "WS", path: "/ws/bio-sentinel", description: "WebSocket for ESP32" },
  ],
  arcBrain: [
    { method: "GET", path: "/api/arc/brain/state", description: "Brain manifest" },
    { method: "GET", path: "/api/arc/brain/self-awareness", description: "Self-awareness data" },
    { method: "POST", path: "/api/arc/agent-events", description: "Ingest from n8n" },
    { method: "POST", path: "/api/arc/receive", description: "n8n callback storage" },
    { method: "POST", path: "/api/arc/command", description: "Log command" },
    { method: "POST", path: "/api/arc/reality-report", description: "AI reality report" },
    { method: "POST", path: "/api/arc/ceo-reminders", description: "CEO reminders" },
    { method: "POST", path: "/api/arc/executive-summary", description: "Executive summary" },
    { method: "POST", path: "/api/arc/governance/notify", description: "Governance notify" },
    { method: "POST", path: "/api/arc/rules/broadcast", description: "Rules broadcast" },
    { method: "POST", path: "/api/arc/notifications/high", description: "High priority alerts" },
  ],
  android: [
    { method: "GET", path: "/api/android/download", description: "Download APK project" },
  ],
};

const DATABASE_TABLES = [
  { name: "users", description: "Authenticated users", fields: "id, email, firstName, lastName, profileImageUrl" },
  { name: "sessions", description: "Session storage", fields: "sid, sess, expire" },
  { name: "conversations", description: "Chat threads", fields: "id, userId, title, createdAt" },
  { name: "chat_messages", description: "Individual messages", fields: "id, conversationId, role, content, agentId" },
  { name: "team_tasks", description: "Task management", fields: "id, title, description, status, assignedAgent" },
  { name: "workflow_simulations", description: "Saved workflows", fields: "id, name, steps, status" },
  { name: "mission_scenarios", description: "WarRoom scenarios", fields: "id, name, type, riskLevel, status" },
  { name: "agent_events", description: "Agent activity log", fields: "id, agentId, type, payload, timestamp" },
  { name: "arc_command_log", description: "Command history", fields: "id, command, payload, status" },
  { name: "arc_feedback", description: "n8n callback storage", fields: "id, commandId, source, status, data" },
  { name: "smell_profiles", description: "Bio Sentinel profiles", fields: "id, name, category, signature, embedding" },
  { name: "sensor_readings", description: "BME688 readings", fields: "id, temperature, humidity, pressure, gas" },
  { name: "activity_feed", description: "Activity log", fields: "id, type, message, timestamp" },
];

const INTEGRATIONS = [
  { name: "OpenAI", description: "GPT-4 for all agent responses", icon: Brain, status: "active", color: "text-success" },
  { name: "ElevenLabs", description: "Text-to-speech synthesis", icon: Mic2, status: "active", color: "text-secondary" },
  { name: "Replit Auth", description: "OpenID Connect authentication", icon: Lock, status: "active", color: "text-primary" },
  { name: "PostgreSQL", description: "Primary database storage", icon: Database, status: "active", color: "text-primary" },
  { name: "n8n", description: "Workflow automation webhooks", icon: Workflow, status: "ready", color: "text-orange-500" },
  { name: "Supabase", description: "Legacy queries only", icon: Cloud, status: "legacy", color: "text-gray-500" },
  { name: "Twilio", description: "SMS capabilities", icon: MessageSquare, status: "configured", color: "text-destructive" },
  { name: "Capacitor", description: "Android APK generation", icon: Smartphone, status: "ready", color: "text-success" },
];

const FILE_STRUCTURE = [
  { path: "client/src/pages/", description: "16 React page components", count: 16 },
  { path: "client/src/components/", description: "UI components and features", count: 25 },
  { path: "server/routes.ts", description: "40+ API endpoints", count: 1 },
  { path: "server/storage.ts", description: "Database operations", count: 1 },
  { path: "shared/schema.ts", description: "Drizzle ORM schemas", count: 1 },
  { path: "server/modules/", description: "n8n webhook, voice map", count: 2 },
  { path: "docs/", description: "Bio Sentinel specs", count: 2 },
];

function getAgentIcon(iconName: string) {
  const icons: Record<string, any> = {
    crown: Shield,
    settings: Cpu,
    radio: Radio,
    brain: Brain,
    camera: Camera,
    "file-text": FileText,
    scale: Scale,
    "trending-up": TrendingUp,
    palette: Palette,
    search: Search,
  };
  return icons[iconName] || Shield;
}

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: "bg-success/20 text-success border-success/30",
    POST: "bg-primary/20 text-primary border-primary/30",
    PATCH: "bg-warning/20 text-warning border-warning/30",
    DELETE: "bg-destructive/20 text-destructive border-destructive/30",
    WS: "bg-secondary/20 text-secondary border-secondary/30",
  };
  return (
    <Badge variant="outline" className={`${colors[method] || ""} text-xs font-mono`}>
      {method}
    </Badge>
  );
}

function StatusIndicator({ status }: { status: string }) {
  const configs: Record<string, { color: string; label: string }> = {
    active: { color: "bg-success", label: "Active" },
    ready: { color: "bg-warning", label: "Ready" },
    configured: { color: "bg-primary", label: "Configured" },
    legacy: { color: "bg-muted", label: "Legacy" },
  };
  const config = configs[status] || configs.active;
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${config.color}`} />
      <span className="text-xs text-muted-foreground">{config.label}</span>
    </div>
  );
}

export default function SystemArchitecture() {
  const { t } = useTranslation();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <h1 className="text-lg font-semibold">System Architecture</h1>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 overflow-auto">
    <div className="p-6 space-y-8">
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-primary/20 via-background to-secondary/20 border border-border p-8">
        <div className="absolute inset-0 bg-grid-white/5" />
        <div className="relative">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-2xl">
              ARC
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground" data-testid="text-page-title">
                System Architecture
              </h1>
              <p className="text-muted-foreground mt-1">
                ARC Intelligence Framework v2.0 + X Bio Sentinel
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-6">
            <Badge variant="outline" className="bg-success/10 text-success border-success/30">
              <CheckCircle2 className="w-3 h-3 ltr:mr-1 rtl:ml-1" />
              10 AI Agents
            </Badge>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
              <Layers className="w-3 h-3 ltr:mr-1 rtl:ml-1" />
              16 Pages
            </Badge>
            <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/30">
              <Server className="w-3 h-3 ltr:mr-1 rtl:ml-1" />
              40+ APIs
            </Badge>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
              <Database className="w-3 h-3 ltr:mr-1 rtl:ml-1" />
              20 Tables
            </Badge>
            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
              <Zap className="w-3 h-3 ltr:mr-1 rtl:ml-1" />
              Hardware Ready
            </Badge>
          </div>
        </div>
      </div>

      <Tabs defaultValue="map" className="w-full">
        <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-flex">
          <TabsTrigger value="map" data-testid="tab-system-map">
            <Network className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
            <span className="hidden sm:inline">System Map</span>
          </TabsTrigger>
          <TabsTrigger value="agents" data-testid="tab-agents">
            <Users className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
            <span className="hidden sm:inline">Agents</span>
          </TabsTrigger>
          <TabsTrigger value="capabilities" data-testid="tab-capabilities">
            <Sparkles className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
            <span className="hidden sm:inline">Capabilities</span>
          </TabsTrigger>
          <TabsTrigger value="api" data-testid="tab-api">
            <Server className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
            <span className="hidden sm:inline">API</span>
          </TabsTrigger>
          <TabsTrigger value="database" data-testid="tab-database">
            <Database className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
            <span className="hidden sm:inline">Database</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" data-testid="tab-integrations">
            <Globe className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
            <span className="hidden sm:inline">Integrations</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="w-5 h-5 text-primary" />
                  Unified System Architecture
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative p-6 bg-secondary/20 rounded-lg border border-border">
                  <div className="grid grid-cols-3 gap-8">
                    <div className="space-y-4">
                      <div className="text-center p-4 bg-primary/10 rounded-lg border border-primary/30">
                        <Globe className="w-8 h-8 mx-auto text-primary mb-2" />
                        <p className="font-semibold text-sm">Frontend</p>
                        <p className="text-xs text-muted-foreground">React + Vite</p>
                      </div>
                      <div className="flex justify-center">
                        <ArrowRight className="w-4 h-4 text-muted-foreground rotate-90" />
                      </div>
                      <div className="text-center p-4 bg-primary/10 rounded-lg border border-primary/30">
                        <Smartphone className="w-8 h-8 mx-auto text-primary mb-2" />
                        <p className="font-semibold text-sm">Mobile</p>
                        <p className="text-xs text-muted-foreground">Capacitor APK</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="text-center p-4 bg-success/10 rounded-lg border border-success/30">
                        <Server className="w-8 h-8 mx-auto text-success mb-2" />
                        <p className="font-semibold text-sm">Backend</p>
                        <p className="text-xs text-muted-foreground">Express + TypeScript</p>
                      </div>
                      <div className="flex justify-center">
                        <ArrowRight className="w-4 h-4 text-muted-foreground rotate-90" />
                      </div>
                      <div className="text-center p-4 bg-primary/10 rounded-lg border border-primary/30">
                        <Database className="w-8 h-8 mx-auto text-primary mb-2" />
                        <p className="font-semibold text-sm">PostgreSQL</p>
                        <p className="text-xs text-muted-foreground">20 Tables</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="text-center p-4 bg-secondary/10 rounded-lg border border-secondary/30">
                        <Brain className="w-8 h-8 mx-auto text-secondary mb-2" />
                        <p className="font-semibold text-sm">AI Services</p>
                        <p className="text-xs text-muted-foreground">OpenAI + ElevenLabs</p>
                      </div>
                      <div className="flex justify-center">
                        <ArrowRight className="w-4 h-4 text-muted-foreground rotate-90" />
                      </div>
                      <div className="text-center p-4 bg-warning/10 rounded-lg border border-warning/30">
                        <Zap className="w-8 h-8 mx-auto text-warning mb-2" />
                        <p className="font-semibold text-sm">Bio Sentinel</p>
                        <p className="text-xs text-muted-foreground">ESP32 + BME688</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-border">
                    <div className="flex items-center justify-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/30 rounded-md">
                        <Lock className="w-4 h-4 text-primary" />
                        <span className="text-xs">Replit Auth</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/30 rounded-md">
                        <Workflow className="w-4 h-4 text-warning" />
                        <span className="text-xs">n8n Webhooks</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/30 rounded-md">
                        <HardDrive className="w-4 h-4 text-primary" />
                        <span className="text-xs">WebSocket</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-primary" />
                  File Structure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {FILE_STRUCTURE.map((item) => (
                    <div
                      key={item.path}
                      className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <Box className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-mono">{item.path}</p>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                      {item.count > 1 && (
                        <Badge variant="secondary" className="text-xs">
                          {item.count}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="agents" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Virtual Agents (10)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {VIRTUAL_AGENTS.map((agent) => {
                  const IconComponent = getAgentIcon(agent.icon);
                  return (
                    <div
                      key={agent.id}
                      className="p-4 bg-secondary/20 rounded-lg border border-border hover-elevate"
                      data-testid={`card-agent-${agent.id}`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-lg bg-secondary/50 ${agent.color}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                      </div>
                      <p className="font-semibold text-sm">{agent.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{agent.role}</p>
                      <Badge variant="outline" className="mt-2 text-xs">
                        {agent.id}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="capabilities" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                System Capabilities (16 Features)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {CAPABILITIES.map((cap) => (
                  <div
                    key={cap.name}
                    className="p-4 bg-secondary/20 rounded-lg border border-border"
                    data-testid={`card-capability-${cap.name.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <cap.icon className="w-5 h-5 text-primary" />
                      </div>
                      <StatusIndicator status={cap.status} />
                    </div>
                    <p className="font-semibold text-sm">{cap.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{cap.description}</p>
                    <Badge variant="outline" className="mt-2 text-xs capitalize">
                      {cap.category}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {Object.entries(API_ENDPOINTS).map(([category, endpoints]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 capitalize">
                    <Server className="w-5 h-5 text-primary" />
                    {category.replace(/([A-Z])/g, " $1").trim()}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {endpoints.map((endpoint, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-2 bg-secondary/20 rounded-lg"
                        >
                          <MethodBadge method={endpoint.method} />
                          <code className="text-xs font-mono flex-1 truncate">
                            {endpoint.path}
                          </code>
                          <span className="text-xs text-muted-foreground hidden lg:block">
                            {endpoint.description}
                          </span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="database" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                Database Schema (PostgreSQL)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {DATABASE_TABLES.map((table) => (
                  <div
                    key={table.name}
                    className="p-4 bg-secondary/20 rounded-lg border border-border"
                    data-testid={`card-table-${table.name}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <HardDrive className="w-4 h-4 text-primary" />
                      <code className="text-sm font-mono font-semibold">{table.name}</code>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{table.description}</p>
                    <p className="text-xs font-mono text-muted-foreground/70 truncate">
                      {table.fields}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                External Integrations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {INTEGRATIONS.map((integration) => (
                  <div
                    key={integration.name}
                    className="p-4 bg-secondary/20 rounded-lg border border-border"
                    data-testid={`card-integration-${integration.name.toLowerCase()}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2 rounded-lg bg-secondary/50 ${integration.color}`}>
                        <integration.icon className="w-5 h-5" />
                      </div>
                      <StatusIndicator status={integration.status} />
                    </div>
                    <p className="font-semibold text-sm">{integration.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{integration.description}</p>
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
