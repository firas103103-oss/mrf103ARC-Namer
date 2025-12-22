import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Brain, Activity, RefreshCw, AlertCircle, Zap, GitBranch, CheckCircle, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { TerminalHeartbeat, type LogEvent } from "@/components/TerminalHeartbeat";
import { EventTimeline, type TimelineEvent } from "@/components/EventTimeline";
import { queryClient } from "@/lib/queryClient";

interface CausalTimelineAction {
  id: string;
  status: string | null;
  cost_usd: number | null;
  action_type: string;
  action_target: string | null;
}

interface CausalTimelineResult {
  id: string;
  error: string | null;
  latency_ms: number | null;
}

interface CausalTimelineImpact {
  id: string;
  impact_type: string;
  impact_score: number | null;
}

interface CausalTimelineEntry {
  intent_id: string;
  intent_at: string;
  actor_type: string;
  actor_id: string | null;
  intent_type: string;
  intent_text: string;
  actions: CausalTimelineAction[] | null;
  results: CausalTimelineResult[] | null;
  impacts: CausalTimelineImpact[] | null;
}

interface CommandLog {
  id: string;
  command: string;
  payload: Record<string, unknown>;
  status: string;
  duration_ms: number | null;
  source: string | null;
  created_at: string;
  completed_at: string | null;
}

interface AgentEvent {
  id: string;
  event_id: string;
  agent_id: string;
  type: string;
  payload: Record<string, unknown>;
  created_at: string;
  received_at: string;
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
  const { data: commands = [], isLoading: cmdLoading, refetch: refetchCommands } = useQuery<CommandLog[]>({
    queryKey: ["/api/dashboard/commands"],
  });

  const { data: events = [], isLoading: evtLoading, refetch: refetchEvents } = useQuery<AgentEvent[]>({
    queryKey: ["/api/dashboard/events"],
  });

  const { data: feedback = [], isLoading: fbLoading, refetch: refetchFeedback } = useQuery<ArcFeedback[]>({
    queryKey: ["/api/dashboard/feedback"],
  });

  const { data: causalTimeline = [], isLoading: causalLoading, refetch: refetchCausal } = useQuery<CausalTimelineEntry[]>({
    queryKey: ["/api/core/timeline", { window_minutes: 60 }],
  });

  const isLoading = cmdLoading || evtLoading || fbLoading || causalLoading;

  const convertToTerminalEvent = (data: CommandLog | AgentEvent | ArcFeedback, type: 'command' | 'event' | 'feedback'): LogEvent => {
    const timestampStr = type === 'event' 
      ? (data as AgentEvent).received_at 
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
      ? (data as AgentEvent).received_at
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
    refetchCommands();
    refetchEvents();
    refetchFeedback();
    refetchCausal();
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
    ...events.map(e => convertToTerminalEvent(e, 'event')),
    ...feedback.map(f => convertToTerminalEvent(f, 'feedback')),
  ].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  const timelineEvents: TimelineEvent[] = [
    ...commands.map(c => convertToTimelineEvent(c, 'command')),
    ...events.map(e => convertToTimelineEvent(e, 'event')),
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
    <div className="p-6 space-y-6" data-testid="realtime-dashboard">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" data-testid="dashboard-title">
            ARC Command Center
          </h1>
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
                        {format(new Date(evt.received_at || evt.created_at), "MMM d, HH:mm:ss")}
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

      <Card data-testid="card-live-timeline">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-primary" />
              Live Timeline (Causal Memory)
            </CardTitle>
            <Badge variant="secondary">{causalTimeline.length} intents</Badge>
          </div>
          <CardDescription>Intent/Action/Result chains from the last 60 minutes</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            {causalLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            ) : causalTimeline.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No causal events in the last 60 minutes
              </div>
            ) : (
              <div className="space-y-4">
                {causalTimeline.map((entry) => (
                  <div
                    key={entry.intent_id}
                    className="p-4 rounded-lg border bg-card space-y-3"
                    data-testid={`timeline-intent-${entry.intent_id}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline">{entry.intent_type}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {entry.actor_type}: {entry.actor_id || "unknown"}
                          </span>
                        </div>
                        <p className="text-sm font-medium">{entry.intent_text}</p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(entry.intent_at), "MMM d, HH:mm:ss")}
                      </span>
                    </div>

                    {entry.actions && entry.actions.length > 0 && (
                      <div className="pl-4 border-l-2 border-muted space-y-2">
                        <span className="text-xs font-medium text-muted-foreground">Actions</span>
                        {entry.actions.map((action) => (
                          <div
                            key={action.id}
                            className="flex items-center justify-between gap-2 p-2 rounded bg-muted/50"
                            data-testid={`timeline-action-${action.id}`}
                          >
                            <div className="flex items-center gap-2">
                              {getActionStatusIcon(action.status)}
                              <span className="text-sm">{action.action_type}</span>
                              {action.action_target && (
                                <span className="text-xs text-muted-foreground">
                                  ({action.action_target})
                                </span>
                              )}
                            </div>
                            <Badge variant={getActionStatusBadge(action.status)}>
                              {action.status || "queued"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}

                    {entry.results && entry.results.length > 0 && (
                      <div className="pl-4 border-l-2 border-green-500/30 space-y-2">
                        <span className="text-xs font-medium text-muted-foreground">Results</span>
                        {entry.results.map((result) => (
                          <div
                            key={result.id}
                            className="flex items-center justify-between gap-2 p-2 rounded bg-muted/50"
                            data-testid={`timeline-result-${result.id}`}
                          >
                            <div className="flex items-center gap-2">
                              {result.error ? (
                                <XCircle className="h-4 w-4 text-red-500" />
                              ) : (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                              <span className="text-sm">
                                {result.error ? `Error: ${result.error}` : "Completed"}
                              </span>
                            </div>
                            {result.latency_ms && (
                              <span className="text-xs text-muted-foreground">
                                {result.latency_ms}ms
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {entry.impacts && entry.impacts.length > 0 && (
                      <div className="pl-4 border-l-2 border-blue-500/30 space-y-2">
                        <span className="text-xs font-medium text-muted-foreground">Impacts</span>
                        {entry.impacts.map((impact) => (
                          <div
                            key={impact.id}
                            className="flex items-center justify-between gap-2 p-2 rounded bg-muted/50"
                            data-testid={`timeline-impact-${impact.id}`}
                          >
                            <div className="flex items-center gap-2">
                              <Zap className="h-4 w-4 text-blue-500" />
                              <span className="text-sm">{impact.impact_type}</span>
                            </div>
                            {impact.impact_score !== null && (
                              <Badge variant="secondary">Score: {impact.impact_score}</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
