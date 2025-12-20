import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Activity, Server, Database, Clock, Brain } from "lucide-react";

interface ReflexEvent {
  id: string;
  source: string;
  event_type: string;
  created_at: string;
}

export default function ARCMonitor() {
  const [status, setStatus] = useState({
    server: "Checking...",
    supabase: "Checking...",
    lastHeartbeat: "—",
  });
  const [reflex, setReflex] = useState<ReflexEvent[]>([]);

  useEffect(() => {
    checkServerHealth();
    checkSupabase();
    loadReflex();

    const interval = setInterval(() => {
      checkServerHealth();
      loadReflex();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const checkServerHealth = async () => {
    try {
      const res = await fetch("/health");
      if (res.ok) {
        const json = await res.json();
        setStatus((s) => ({ ...s, server: "Active", lastHeartbeat: json.time }));
      } else setStatus((s) => ({ ...s, server: "Unreachable" }));
    } catch {
      setStatus((s) => ({ ...s, server: "Offline" }));
    }
  };

  const checkSupabase = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setStatus((s) => ({ ...s, supabase: "Not Configured" }));
      return;
    }
    try {
      const { error } = await supabase.from("arc_reflex_logs").select("*").limit(1);
      if (error) throw error;
      setStatus((s) => ({ ...s, supabase: "Connected" }));
    } catch {
      setStatus((s) => ({ ...s, supabase: "Error" }));
    }
  };

  const loadReflex = async () => {
    if (!isSupabaseConfigured || !supabase) return;
    const { data } = await supabase
      .from("arc_reflex_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);
    if (data) setReflex(data);
  };

  const getStatusBadge = (status: string) => {
    if (status === "Active" || status === "Connected") {
      return <Badge variant="default" className="bg-primary text-primary-foreground">{status}</Badge>;
    }
    if (status === "Checking..." || status === "Not Configured") {
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
          <div className="flex items-center justify-between" data-testid="status-supabase">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Database className="h-4 w-4" /> Supabase
            </span>
            {getStatusBadge(status.supabase)}
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
            Recent Reflex Events
          </h3>
          {reflex.length === 0 ? (
            <p className="text-muted-foreground text-sm">No reflex events yet.</p>
          ) : (
            <ul className="space-y-2">
              {reflex.map((r) => (
                <li 
                  key={r.id} 
                  className="text-sm p-2 rounded-md bg-muted"
                  data-testid={`reflex-event-${r.id}`}
                >
                  <span className="text-primary font-medium">{r.event_type}</span>
                  <span className="text-muted-foreground"> from </span>
                  <span className="text-foreground">{r.source}</span>
                  <p className="text-muted-foreground text-xs mt-1">
                    {new Date(r.created_at).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
