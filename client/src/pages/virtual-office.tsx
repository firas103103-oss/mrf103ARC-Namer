import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Terminal, Bot, Wifi, WifiOff } from "lucide-react";

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
  created_at: string;
}

export default function VirtualOffice() {
  const [commands, setCommands] = useState<CommandLog[]>([]);
  const [agents, setAgents] = useState<AgentEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) {
      setLoading(false);
      return;
    }

    loadData();

    const cmdChannel = supabase
      .channel("arc_command_log_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "arc_command_log" },
        (payload) => {
          console.log("New Command Event:", payload);
          loadCommands();
        }
      )
      .subscribe(() => setConnected(true));

    const agentChannel = supabase
      .channel("agent_events_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "agent_events" },
        (payload) => {
          console.log("New Agent Event:", payload);
          loadAgents();
        }
      )
      .subscribe();

    return () => {
      supabase!.removeChannel(cmdChannel);
      supabase!.removeChannel(agentChannel);
    };
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadCommands(), loadAgents()]);
    setLoading(false);
  };

  const loadCommands = async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from("arc_command_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);
    if (data) setCommands(data);
  };

  const loadAgents = async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from("agent_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);
    if (data) setAgents(data);
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

  if (!isSupabaseConfigured()) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6" data-testid="supabase-not-configured">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <WifiOff className="h-5 w-5" />
              Supabase Not Configured
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables to enable the Virtual Office dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-8" data-testid="virtual-office">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-2xl md:text-3xl font-bold" data-testid="text-dashboard-title">
            ARC Virtual Office Dashboard
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
                Connecting...
              </>
            )}
          </Badge>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card data-testid="card-commands">
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Terminal className="h-5 w-5" />
                Latest Commands
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : commands.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8" data-testid="text-no-commands">
                    No commands yet.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {commands.map((cmd) => (
                      <li
                        key={cmd.id}
                        className="border-b border-border pb-3 last:border-0"
                        data-testid={`command-${cmd.id}`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="font-medium truncate">
                            {cmd.command || cmd.command_id || "No ID"}
                          </p>
                          <Badge variant={getStatusVariant(cmd.status)}>
                            {cmd.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(cmd.created_at).toLocaleString()}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          <Card data-testid="card-agent-events">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bot className="h-5 w-5" />
                Agent Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : agents.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8" data-testid="text-no-events">
                    No events yet.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {agents.map((ag) => (
                      <li
                        key={ag.id}
                        className="border-b border-border pb-3 last:border-0"
                        data-testid={`agent-event-${ag.id}`}
                      >
                        <p className="font-medium">{ag.agent_name}</p>
                        <p className="text-sm text-muted-foreground">{ag.event_type}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(ag.created_at).toLocaleString()}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
