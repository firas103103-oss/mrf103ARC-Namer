import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Brain, Activity, RefreshCw, AlertCircle, Zap } from "lucide-react";
import { format } from "date-fns";
import { TerminalHeartbeat, type LogEvent } from "@/components/TerminalHeartbeat";
import { EventTimeline, type TimelineEvent } from "@/components/EventTimeline";

interface CommandLog {
  id: string;
  command: string;
  payload: Record<string, unknown>;
  status: string;
  created_at: string;
}

interface AgentEvent {
  id: string;
  agent_name: string;
  event_type: string;
  payload: Record<string, unknown>;
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
  const [commands, setCommands] = useState<CommandLog[]>([]);
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [feedback, setFeedback] = useState<ArcFeedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [terminalEvents, setTerminalEvents] = useState<LogEvent[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);

  const convertToTerminalEvent = (data: CommandLog | AgentEvent | ArcFeedback, type: 'command' | 'event' | 'feedback'): LogEvent => {
    const timestamp = new Date(data.created_at);
    
    if (type === 'command') {
      const cmd = data as CommandLog;
      return {
        id: `cmd-${cmd.id}`,
        timestamp,
        message: `${cmd.command} - ${cmd.status}`,
        severity: cmd.status === 'completed' ? 'success' : cmd.status === 'failed' ? 'error' : 'info',
        source: 'SYSTEM',
      };
    } else if (type === 'event') {
      const evt = data as AgentEvent;
      return {
        id: `evt-${evt.id}`,
        timestamp,
        message: `${evt.agent_name}: ${evt.event_type}`,
        severity: 'info',
        source: 'AGENT',
      };
    } else {
      const fb = data as ArcFeedback;
      return {
        id: `fb-${fb.id}`,
        timestamp,
        message: `Callback: ${fb.source || fb.command_id || 'n8n'} - ${fb.status || 'received'}`,
        severity: fb.status === 'success' ? 'success' : fb.status === 'error' ? 'error' : 'info',
        source: 'API',
      };
    }
  };

  const convertToTimelineEvent = (data: CommandLog | AgentEvent | ArcFeedback, type: 'command' | 'event' | 'feedback'): TimelineEvent => {
    const timestamp = new Date(data.created_at);
    
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
        agentName: evt.agent_name,
        eventType: evt.event_type === 'message' ? 'message' : 'action',
        description: evt.event_type,
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

  const fetchData = async () => {
    if (!supabase) {
      setError("Supabase not configured");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const [cmdResult, evtResult, fbResult] = await Promise.all([
        supabase
          .from("arc_command_log")
          .select("*")
          .order("id", { ascending: false })
          .limit(10),
        supabase
          .from("agent_events")
          .select("*")
          .order("id", { ascending: false })
          .limit(10),
        supabase
          .from("arc_feedback")
          .select("*")
          .order("id", { ascending: false })
          .limit(10),
      ]);

      if (cmdResult.error) console.warn("arc_command_log query failed:", cmdResult.error);
      if (evtResult.error) console.warn("agent_events query failed:", evtResult.error);
      if (fbResult.error) console.warn("arc_feedback query failed:", fbResult.error);

      const cmds = cmdResult.data || [];
      const evts = evtResult.data || [];
      const fbs = fbResult.data || [];

      setCommands(cmds);
      setEvents(evts);
      setFeedback(fbs);
      setLastUpdated(new Date());

      const allTerminal: LogEvent[] = [
        ...cmds.map(c => convertToTerminalEvent(c, 'command')),
        ...evts.map(e => convertToTerminalEvent(e, 'event')),
        ...fbs.map(f => convertToTerminalEvent(f, 'feedback')),
      ].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      setTerminalEvents(allTerminal);

      const allTimeline: TimelineEvent[] = [
        ...cmds.map(c => convertToTimelineEvent(c, 'command')),
        ...evts.map(e => convertToTimelineEvent(e, 'event')),
        ...fbs.map(f => convertToTimelineEvent(f, 'feedback')),
      ].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      setTimelineEvents(allTimeline);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    if (!supabase) return;

    const cmdChannel = supabase!
      .channel("arc-command-log-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "arc_command_log" },
        () => fetchData()
      )
      .subscribe();

    const evtChannel = supabase!
      .channel("agent-events-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "agent_events" },
        () => fetchData()
      )
      .subscribe();

    const fbChannel = supabase!
      .channel("arc-feedback-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "arc_feedback" },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase!.removeChannel(cmdChannel);
      supabase!.removeChannel(evtChannel);
      supabase!.removeChannel(fbChannel);
    };
  }, []);

  if (!isSupabaseConfigured()) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Supabase Not Configured
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Real-time dashboard requires Supabase configuration. Please set
              VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">
              Updated: {format(lastUpdated, "HH:mm:ss")}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={isLoading}
            data-testid="button-refresh"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="flex items-center gap-2 py-4">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <span className="text-destructive">{error}</span>
          </CardContent>
        </Card>
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
              {isLoading ? (
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
              {isLoading ? (
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
                        <span className="font-medium">{evt.agent_name}</span>
                        <Badge variant="outline">{evt.event_type}</Badge>
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
              {isLoading ? (
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
  );
}
