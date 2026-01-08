import { useEffect, useState, useCallback } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAuth } from "@/hooks/useAuth";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Terminal,
  Bot,
  Wifi,
  WifiOff,
  RefreshCw,
  Search,
  ChevronDown,
  ChevronRight,
  LogOut,
  BarChart3,
  Activity,
  Clock,
  Zap,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface CommandLog {
  id: string;
  command_id: string;
  command: string;
  status: string;
  created_at: string;
  payload: unknown;
}

interface AgentEvent {
  id: string;
  agent_name: string;
  event_type: string;
  payload?: unknown;
  created_at: string;
}

const ITEMS_PER_PAGE = 10;

export default function VirtualOffice() {
  const { user } = useAuth();
  
  const handleLogout = () => {
    window.location.href = "/api/auth/logout";
  };
  const [commands, setCommands] = useState<CommandLog[]>([]);
  const [agents, setAgents] = useState<AgentEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [authError, setAuthError] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);
  
  const [commandSearch, setCommandSearch] = useState("");
  const [agentSearch, setAgentSearch] = useState("");
  
  const [commandsPage, setCommandsPage] = useState(1);
  const [agentsPage, setAgentsPage] = useState(1);
  const [hasMoreCommands, setHasMoreCommands] = useState(true);
  const [hasMoreAgents, setHasMoreAgents] = useState(true);
  const [loadingMoreCommands, setLoadingMoreCommands] = useState(false);
  const [loadingMoreAgents, setLoadingMoreAgents] = useState(false);
  
  const [expandedCommands, setExpandedCommands] = useState<Set<string>>(new Set());
  const [expandedAgents, setExpandedAgents] = useState<Set<string>>(new Set());

  const [totalCommands, setTotalCommands] = useState(0);
  const [totalAgents, setTotalAgents] = useState(0);

  const loadCommands = useCallback(async (page = 1, append = false) => {
    const limit = ITEMS_PER_PAGE;
    setAuthError(false);
    setBackendError(null);

    const res = await fetch(`/api/arc/command-log?page=${page}&pageSize=${limit}`, { credentials: "include" });
    if (res.status === 401) {
      setAuthError(true);
      return;
    }
    if (!res.ok) {
      setBackendError(`Failed to load command log (${res.status})`);
      return;
    }

    const json = await res.json();
    const data = Array.isArray(json.data) ? (json.data as CommandLog[]) : [];
    const count = typeof json.count === "number" ? json.count : null;

    if (append) {
      setCommands((prev) => [...prev, ...data]);
    } else {
      setCommands(data);
    }
    setHasMoreCommands(data.length === limit);
    if (count !== null) setTotalCommands(count);
  }, []);

  const loadAgents = useCallback(async (page = 1, append = false) => {
    const limit = ITEMS_PER_PAGE;
    setAuthError(false);
    setBackendError(null);

    const res = await fetch(`/api/arc/agent-events?page=${page}&pageSize=${limit}`, { credentials: "include" });
    if (res.status === 401) {
      setAuthError(true);
      return;
    }
    if (!res.ok) {
      setBackendError(`Failed to load agent events (${res.status})`);
      return;
    }

    const json = await res.json();
    const data = Array.isArray(json.data) ? (json.data as AgentEvent[]) : [];
    const count = typeof json.count === "number" ? json.count : null;

    if (append) {
      setAgents((prev) => [...prev, ...data]);
    } else {
      setAgents(data);
    }
    setHasMoreAgents(data.length === limit);
    if (count !== null) setTotalAgents(count);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setCommandsPage(1);
    setAgentsPage(1);
    await Promise.all([loadCommands(1), loadAgents(1)]);
    setLastUpdated(new Date());
    setLoading(false);
  }, [loadCommands, loadAgents]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const loadMoreCommands = async () => {
    setLoadingMoreCommands(true);
    const nextPage = commandsPage + 1;
    await loadCommands(nextPage, true);
    setCommandsPage(nextPage);
    setLoadingMoreCommands(false);
  };

  const loadMoreAgents = async () => {
    setLoadingMoreAgents(true);
    const nextPage = agentsPage + 1;
    await loadAgents(nextPage, true);
    setAgentsPage(nextPage);
    setLoadingMoreAgents(false);
  };

  useEffect(() => {
    loadData().then(() => setConnected(true)).catch(() => setConnected(false));
  }, [loadData, loadCommands, loadAgents]);

  const toggleCommandExpanded = (id: string) => {
    setExpandedCommands(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAgentExpanded = (id: string) => {
    setExpandedAgents(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "success":
        return "default";
      case "pending":
        return "secondary";
      case "failed":
      case "error":
        return "destructive";
      default:
        return "outline";
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return dateStr;
    }
  };

  const filteredCommands = commands.filter(cmd => {
    if (!commandSearch) return true;
    const search = commandSearch.toLowerCase();
    return (
      cmd.command?.toLowerCase().includes(search) ||
      cmd.command_id?.toLowerCase().includes(search) ||
      cmd.status?.toLowerCase().includes(search)
    );
  });

  const filteredAgents = agents.filter(ag => {
    if (!agentSearch) return true;
    const search = agentSearch.toLowerCase();
    return (
      ag.agent_name?.toLowerCase().includes(search) ||
      ag.event_type?.toLowerCase().includes(search)
    );
  });

  const recentCommandsCount = commands.filter(cmd => {
    const created = new Date(cmd.created_at);
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return created > hourAgo;
  }).length;

  const recentAgentsCount = agents.filter(ag => {
    const created = new Date(ag.created_at);
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return created > hourAgo;
  }).length;

  if (authError) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6" data-testid="auth-not-configured">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <WifiOff className="h-5 w-5" />
              Not Authenticated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Please login to access the Virtual Office dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (backendError) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6" data-testid="backend-error">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <WifiOff className="h-5 w-5" />
              Backend Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{backendError}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Terminal className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-semibold">ARC Virtual Office</h1>
              <Badge variant={connected ? "default" : "secondary"} data-testid="status-connection">
                {connected ? (
                  <>
                    <Wifi className="h-3 w-3 mr-1" />
                    Live
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3 mr-1" />
                    Connecting
                  </>
                )}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {lastUpdated && (
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  Updated {formatRelativeTime(lastUpdated.toISOString())}
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                data-testid="button-refresh"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 overflow-auto">
    <div className="min-h-screen bg-background" data-testid="virtual-office">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <h1 className="text-xl md:text-2xl font-bold" data-testid="text-dashboard-title">
              ARC Virtual Office
            </h1>
            <Badge variant={connected ? "default" : "secondary"} data-testid="status-connection">
              {connected ? (
                <>
                  <Wifi className="h-3 w-3 mr-1" />
                  Live
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 mr-1" />
                  Connecting
                </>
              )}
            </Badge>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {lastUpdated && (
              <span className="text-xs text-muted-foreground hidden sm:inline">
                Updated {formatRelativeTime(lastUpdated.toISOString())}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              data-testid="button-refresh"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Link href="/dashboard">
              <Button variant="outline" size="sm" data-testid="link-dashboard">
                <BarChart3 className="h-4 w-4 mr-1" />
                Analytics
              </Button>
            </Link>
            {user && (
              <Button variant="ghost" size="sm" onClick={handleLogout} data-testid="button-logout">
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card data-testid="stat-total-commands">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Total Commands</span>
              </div>
              <p className="text-2xl font-bold mt-1">{totalCommands}</p>
            </CardContent>
          </Card>
          <Card data-testid="stat-total-events">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Total Events</span>
              </div>
              <p className="text-2xl font-bold mt-1">{totalAgents}</p>
            </CardContent>
          </Card>
          <Card data-testid="stat-recent-commands">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Last Hour</span>
              </div>
              <p className="text-2xl font-bold mt-1">{recentCommandsCount} cmds</p>
            </CardContent>
          </Card>
          <Card data-testid="stat-recent-events">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Active Agents</span>
              </div>
              <p className="text-2xl font-bold mt-1">{recentAgentsCount} events</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card data-testid="card-commands">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Terminal className="h-5 w-5" />
                Commands
              </CardTitle>
              <Badge variant="outline">{filteredCommands.length}</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search commands..."
                  value={commandSearch}
                  onChange={(e) => setCommandSearch(e.target.value)}
                  className="pl-9"
                  data-testid="input-search-commands"
                />
              </div>
              <ScrollArea className="h-[350px]">
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : filteredCommands.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8" data-testid="text-no-commands">
                    {commandSearch ? "No matching commands." : "No commands yet."}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {filteredCommands.map((cmd) => (
                      <Collapsible
                        key={cmd.id}
                        open={expandedCommands.has(cmd.id)}
                        onOpenChange={() => toggleCommandExpanded(cmd.id)}
                      >
                        <div
                          className="border border-border rounded-md p-3 hover-elevate"
                          data-testid={`command-${cmd.id}`}
                        >
                          <CollapsibleTrigger className="w-full text-left">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <div className="flex items-center gap-2 min-w-0">
                                {expandedCommands.has(cmd.id) ? (
                                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                                )}
                                <p className="font-medium truncate">
                                  {cmd.command || cmd.command_id || "No ID"}
                                </p>
                              </div>
                              <Badge variant={getStatusVariant(cmd.status)}>
                                {cmd.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground pl-6">
                              {formatRelativeTime(cmd.created_at)}
                            </p>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <pre className="mt-3 p-3 bg-muted rounded-md text-xs overflow-x-auto">
                              {cmd.payload ? JSON.stringify(cmd.payload, null, 2) : "No payload"}
                            </pre>
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    ))}
                    {hasMoreCommands && !commandSearch && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={loadMoreCommands}
                        disabled={loadingMoreCommands}
                        data-testid="button-load-more-commands"
                      >
                        {loadingMoreCommands ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>
                            <Zap className="h-4 w-4 mr-2" />
                            Load More
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          <Card data-testid="card-agent-events">
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bot className="h-5 w-5" />
                Agent Events
              </CardTitle>
              <Badge variant="outline">{filteredAgents.length}</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search agents..."
                  value={agentSearch}
                  onChange={(e) => setAgentSearch(e.target.value)}
                  className="pl-9"
                  data-testid="input-search-agents"
                />
              </div>
              <ScrollArea className="h-[350px]">
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : filteredAgents.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8" data-testid="text-no-events">
                    {agentSearch ? "No matching events." : "No events yet."}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {filteredAgents.map((ag) => (
                      <Collapsible
                        key={ag.id}
                        open={expandedAgents.has(ag.id)}
                        onOpenChange={() => toggleAgentExpanded(ag.id)}
                      >
                        <div
                          className="border border-border rounded-md p-3 hover-elevate"
                          data-testid={`agent-event-${ag.id}`}
                        >
                          <CollapsibleTrigger className="w-full text-left">
                            <div className="flex items-center gap-2 mb-1">
                              {expandedAgents.has(ag.id) ? (
                                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                              )}
                              <p className="font-medium">{ag.agent_name}</p>
                            </div>
                            <div className="pl-6">
                              <p className="text-sm text-muted-foreground">{ag.event_type}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatRelativeTime(ag.created_at)}
                              </p>
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <pre className="mt-3 p-3 bg-muted rounded-md text-xs overflow-x-auto">
                              {ag.payload ? JSON.stringify(ag.payload, null, 2) : "No payload"}
                            </pre>
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    ))}
                    {hasMoreAgents && !agentSearch && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={loadMoreAgents}
                        disabled={loadingMoreAgents}
                        data-testid="button-load-more-agents"
                      >
                        {loadingMoreAgents ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>
                            <Zap className="h-4 w-4 mr-2" />
                            Load More
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
