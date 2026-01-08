import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Brain, Activity, RefreshCw, AlertCircle, Zap, GitBranch, CheckCircle, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { TerminalHeartbeat, type LogEvent } from "@/components/TerminalHeartbeat";
import { EventTimeline, type TimelineEvent } from "@/components/EventTimeline";
import { useDashboard } from "@/hooks/useDashboard";
import { useRealtimeEvents } from "@/hooks/useRealtimeEvents";
import RealtimeFeed from "@/components/RealtimeFeed";
import CommandConsole from "@/components/CommandConsole";

interface CommandLog {
  id: string;
  command: string;
  payload?: Record<string, unknown>;
  status: string;
  duration_ms: number | null;
  created_at: string;
}

interface AgentEvent {
  id: string;
  agent_id: string;
  type: string;
  payload?: Record<string, unknown>;
  created_at: string;
}

interface ArcFeedback {
  id: string;
  command_id: string | null;
  source: string | null;
  status: string | null;
  data: Record<string, unknown>;
  created_at: string;
}

export default function Dashboard() {
  const { commands: rawCommands, events: rawEvents, metrics, isLoading, error, refetchAll } = useDashboard();
  const { realtimeTimeline } = useRealtimeEvents();

  const cmdLoading = isLoading;
  const evtLoading = isLoading;
  const fbLoading = false;

  const commands: CommandLog[] = (rawCommands || []).map((c: any) => ({
    id: String(c.id),
    command: String(c.command || ""),
    payload: (c.payload || {}) as Record<string, unknown>,
    status: String(c.status || ""),
    duration_ms: typeof c.duration_ms === "number" ? c.duration_ms : (c.duration_ms ?? null),
    created_at: String(c.created_at || new Date().toISOString()),
  }));

  const events: AgentEvent[] = (rawEvents || []).map((e: any) => ({
    id: String(e.id),
    agent_id: String(e.agent_name || e.agent_id || "unknown"),
    type: String(e.event_type || e.type || "event"),
    payload: (e.payload || {}) as Record<string, unknown>,
    created_at: String(e.created_at || new Date().toISOString()),
  }));

  const wsEvents: AgentEvent[] = (realtimeTimeline || []).map((it: any) => ({
    id: String(it.id),
    agent_id: String(it.agent_name || "ARC"),
    type: String(it.event_type || "activity"),
    payload: (it.payload || {}) as Record<string, unknown>,
    created_at: String(it.created_at || new Date().toISOString()),
  }));

  const mergedEvents: AgentEvent[] = [...events, ...wsEvents].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  const feedback: ArcFeedback[] = [];

  const convertToTerminalEvent = (data: CommandLog | AgentEvent | ArcFeedback, type: 'command' | 'event' | 'feedback'): LogEvent => {
    const timestampStr = type === 'event' 
      ? (data as AgentEvent).created_at 
      : (data as CommandLog | ArcFeedback).created_at;
    const timestamp = new Date(timestampStr);
    
    if (type === 'command') {
      const cmd = data as CommandLog;
      return {
        id: `cmd-${cmd.id}`,
        timestamp,
        message: `${cmd.command} - ${cmd.status}`,
        severity: cmd.status === 'completed' ? 'success' : cmd.status === 'failed' ? 'error' : 'info',
        eventType: 'SYSTEM',
      };
    } else if (type === 'event') {
      const evt = data as AgentEvent;
      return {
        id: `evt-${evt.id}`,
        timestamp,
        message: `${evt.agent_id}: ${evt.type}`,
        severity: 'info',
        eventType: 'AGENT',
      };
    } else {
      const fb = data as ArcFeedback;
      return {
        id: `fb-${fb.id}`,
        timestamp,
        message: `Callback: ${fb.source || fb.command_id || 'n8n'} - ${fb.status || 'received'}`,
        severity: fb.status === 'success' ? 'success' : fb.status === 'error' ? 'error' : 'info',
        eventType: 'API',
      };
    }
  };

  const convertToTimelineEvent = (data: CommandLog | AgentEvent | ArcFeedback, type: 'command' | 'event' | 'feedback'): TimelineEvent => {
    const timestamp = type === 'event'
      ? (data as AgentEvent).created_at
      : (data as CommandLog | ArcFeedback).created_at;
    
    if (type === 'command') {
      const cmd = data as CommandLog;
      return {
        id: `cmd-${cmd.id}`,
        timestamp,
        agentName: 'Mr.F Brain',
        eventType: cmd.status === 'completed' ? 'success' : cmd.status === 'failed' ? 'alert' : 'action',
        description: cmd.command,
      };
    } else if (type === 'event') {
      const evt = data as AgentEvent;
      return {
        id: `evt-${evt.id}`,
        timestamp,
        agentName: evt.agent_id,
        eventType: evt.type === 'message' ? 'message' : 'action',
        description: evt.type,
      };
    } else {
      const fb = data as ArcFeedback;
      return {
        id: `fb-${fb.id}`,
        timestamp,
        agentName: 'n8n',
        eventType: 'system',
        description: `${fb.source || 'Callback'}: ${fb.status || 'received'}`,
      };
    }
  };

  const handleRefresh = () => {
    void refetchAll();
  };

  const getActionStatusIcon = (status: string | null) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "running":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActionStatusBadge = (status: string | null): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "success":
        return "default";
      case "failed":
        return "destructive";
      case "running":
        return "secondary";
      default:
        return "outline";
    }
  };

  const terminalEvents: LogEvent[] = [
    ...commands.map(c => convertToTerminalEvent(c, 'command')),
    ...mergedEvents.map(e => convertToTerminalEvent(e, 'event')),
    ...feedback.map(f => convertToTerminalEvent(f, 'feedback')),
  ].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  const timelineEvents: TimelineEvent[] = [
    ...commands.map(c => convertToTimelineEvent(c, 'command')),
    ...mergedEvents.map(e => convertToTimelineEvent(e, 'event')),
    ...feedback.map(f => convertToTimelineEvent(f, 'feedback')),
  ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const getStatusVariant = (status: string | null): "default" | "secondary" | "destructive" | "outline" => {
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

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <h1 className="text-lg font-semibold">ARC Command Center</h1>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 overflow-auto">
    <div className="p-6 space-y-6" data-testid="realtime-dashboard">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-muted-foreground text-sm">
            Live view of system activity, commands, and agent events
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            data-testid="button-refresh"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-destructive/30" data-testid="card-dashboard-error">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Error
            </CardTitle>
            <CardDescription>
              {error instanceof Error ? error.message : "Failed to load dashboard data."}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RealtimeFeed />
        <CommandConsole onSent={refetchAll} />
      </div>

      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4" data-testid="metrics-strip">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Total</CardTitle></CardHeader>
            <CardContent className="text-2xl font-semibold">{metrics.total}</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Success</CardTitle></CardHeader>
            <CardContent className="text-2xl font-semibold">{metrics.success}</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Failed</CardTitle></CardHeader>
            <CardContent className="text-2xl font-semibold">{metrics.failed}</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Avg (ms)</CardTitle></CardHeader>
            <CardContent className="text-2xl font-semibold">{Math.round(metrics.avgResponse)}</CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TerminalHeartbeat events={terminalEvents} maxEvents={30} />
        
        <Card data-testid="card-timeline-wrapper">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Event Timeline
            </CardTitle>
            <CardDescription>Horizontal view of all activity</CardDescription>
          </CardHeader>
          <CardContent>
            <EventTimeline events={timelineEvents} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card data-testid="card-commands">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Commands
              </CardTitle>
              <Badge variant="secondary">{commands.length}</Badge>
            </div>
            <CardDescription>Mr.F Brain command log</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              {cmdLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20" />
                  ))}
                </div>
              ) : commands.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No commands yet
                </div>
              ) : (
                <div className="space-y-3">
                  {commands.map((cmd) => (
                    <div
                      key={cmd.id}
                      className="p-3 rounded-lg bg-muted/50 space-y-2"
                      data-testid={`command-${cmd.id}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium truncate">{cmd.command}</span>
                        <Badge variant={getStatusVariant(cmd.status)}>
                          {cmd.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(cmd.created_at), "MMM d, HH:mm:ss")}
                        {cmd.duration_ms && ` (${cmd.duration_ms}ms)`}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card data-testid="card-events">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Agent Events
              </CardTitle>
              <Badge variant="secondary">{events.length}</Badge>
            </div>
            <CardDescription>Real-time agent activity</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              {evtLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20" />
                  ))}
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No events yet
                </div>
              ) : (
                <div className="space-y-3">
                  {events.map((evt) => (
                    <div
                      key={evt.id}
                      className="p-3 rounded-lg bg-muted/50 space-y-2"
                      data-testid={`event-${evt.id}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">{evt.agent_id}</span>
                        <Badge variant="outline">{evt.type}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(evt.created_at), "MMM d, HH:mm:ss")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card data-testid="card-feedback">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                n8n Callbacks
              </CardTitle>
              <Badge variant="secondary">{feedback.length}</Badge>
            </div>
            <CardDescription>Workflow feedback from n8n</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              {fbLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20" />
                  ))}
                </div>
              ) : feedback.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No callbacks yet
                </div>
              ) : (
                <div className="space-y-3">
                  {feedback.map((fb) => (
                    <div
                      key={fb.id}
                      className="p-3 rounded-lg bg-muted/50 space-y-2"
                      data-testid={`feedback-${fb.id}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium truncate">
                          {fb.command_id || fb.source || "Callback"}
                        </span>
                        <Badge variant={getStatusVariant(fb.status)}>
                          {fb.status || "received"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(fb.created_at), "MMM d, HH:mm:ss")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

    </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
