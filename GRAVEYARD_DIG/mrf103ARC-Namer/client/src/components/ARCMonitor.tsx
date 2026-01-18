import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Activity, Server, Database, Clock, Brain } from "lucide-react";

interface RecentEvent {
  id: string;
  type: string;
  agent_id: string;
  created_at: string;
}

export default function ARCMonitor() {
  const [status, setStatus] = useState({
    server: "Checking...",
    database: "Checking...",
    lastHeartbeat: "—",
  });

  const { data: events = [] } = useQuery<RecentEvent[]>({
    queryKey: ["/api/dashboard/events"],
    select: (data) => data.slice(0, 5),
  });

  useEffect(() => {
    checkServerHealth();
    checkDatabase();

    const interval = setInterval(() => {
      checkServerHealth();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const checkServerHealth = async () => {
    try {
      const res = await fetch("/api/health");
      if (res.ok) {
        const json = await res.json();
        setStatus((s) => ({ ...s, server: "Active", lastHeartbeat: json.timestamp || new Date().toISOString() }));
      } else setStatus((s) => ({ ...s, server: "Unreachable" }));
    } catch {
      setStatus((s) => ({ ...s, server: "Offline" }));
    }
  };

  const checkDatabase = async () => {
    try {
      const res = await fetch("/api/dashboard/metrics", { credentials: "include" });
      if (res.ok) {
        setStatus((s) => ({ ...s, database: "Connected" }));
      } else if (res.status === 401) {
        setStatus((s) => ({ ...s, database: "Auth Required" }));
      } else {
        setStatus((s) => ({ ...s, database: "Error" }));
      }
    } catch {
      setStatus((s) => ({ ...s, database: "Offline" }));
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "Active" || status === "Connected") {
      return <Badge variant="default" className="bg-primary text-primary-foreground">{status}</Badge>;
    }
    if (status === "Checking..." || status === "Auth Required") {
      return <Badge variant="secondary">{status}</Badge>;
    }
    return <Badge variant="destructive">{status}</Badge>;
  };

  return (
    <Card data-testid="card-monitor">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          ARC System Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between" data-testid="status-server">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Server className="h-4 w-4" /> Server
            </span>
            {getStatusBadge(status.server)}
          </div>
          <div className="flex items-center justify-between" data-testid="status-database">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Database className="h-4 w-4" /> Database
            </span>
            {getStatusBadge(status.database)}
          </div>
          <div className="flex items-center justify-between" data-testid="status-heartbeat">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" /> Last Heartbeat
            </span>
            <span className="text-sm text-foreground">{status.lastHeartbeat}</span>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="flex items-center gap-2 text-sm font-medium mb-3">
            <Brain className="h-4 w-4 text-secondary" />
            Recent Agent Events
          </h3>
          {events.length === 0 ? (
            <p className="text-muted-foreground text-sm">No recent events yet.</p>
          ) : (
            <ul className="space-y-2">
              {events.map((e) => (
                <li 
                  key={e.id} 
                  className="text-xs text-muted-foreground bg-muted/50 p-2 rounded"
                  data-testid={`event-item-${e.id}`}
                >
                  <span className="font-medium text-foreground">{e.agent_id}</span>
                  <span className="mx-1">-</span>
                  <span>{e.type}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
