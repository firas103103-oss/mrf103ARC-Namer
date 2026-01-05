import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, Calendar, FileText, Brain, Activity } from "lucide-react";

export default function SelfCheck() {
  const [data, setData] = useState<any>({
    reminders: [],
    summaries: [],
    events: [],
  });
  const [loading, setLoading] = useState(true);
  const [healthScore, setHealthScore] = useState<number>(100);
  const [authError, setAuthError] = useState(false);

  async function loadData() {
    try {
      setAuthError(false);
      const res = await fetch("/api/arc/selfcheck");
      if (res.status === 401) {
        setAuthError(true);
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setHealthScore(50);
        setLoading(false);
        return;
      }

      const json = await res.json();
      const reminders = Array.isArray(json.reminders) ? json.reminders : [];
      const summaries = Array.isArray(json.summaries) ? json.summaries : [];
      const events = Array.isArray(json.events) ? json.events : [];

      setData({ reminders, summaries, events });

      const recentEvents = (Array.isArray(events) ? events : []).filter(
        (e: any) => new Date(e.created_at) > new Date(Date.now() - 3600 * 1000)
      ).length;
      const score = Math.min(100, 60 + recentEvents * 8);
      setHealthScore(score);

      setLoading(false);
    } catch (err) {
      setHealthScore(50);
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const getHealthBadge = () => {
    if (healthScore > 85) {
      return <Badge variant="default" className="text-lg px-4 py-1">Health: {healthScore}%</Badge>;
    }
    if (healthScore > 65) {
      return <Badge variant="secondary" className="text-lg px-4 py-1">Health: {healthScore}%</Badge>;
    }
    return <Badge variant="destructive" className="text-lg px-4 py-1">Health: {healthScore}%</Badge>;
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2" data-testid="text-page-title">
            <Shield className="h-6 w-6 text-primary" />
            ARC Self-Check
          </h1>
          <Badge variant="secondary" className="text-lg px-4 py-1">Not Authenticated</Badge>
        </div>
        <p className="text-muted-foreground">Please login to view system monitoring.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2" data-testid="text-page-title">
            <Shield className="h-6 w-6 text-primary" />
            ARC Self-Check
          </h1>
          <p className="text-muted-foreground mt-1">Live system monitoring and health status</p>
        </div>
        <div data-testid="health-score">
          {getHealthBadge()}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card data-testid="card-reminders">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-primary" />
              CEO Reminders
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.reminders.length === 0 ? (
              <p className="text-muted-foreground text-sm">No active reminders</p>
            ) : (
              <ScrollArea className="h-48">
                <ul className="space-y-2">
                  {data.reminders.map((r: any) => (
                    <li
                      key={r.id}
                      className="p-2 rounded-md bg-muted text-sm"
                      data-testid={`reminder-${r.id}`}
                    >
                      <span className="font-medium text-foreground">{r.title}</span>
                      <p className="text-muted-foreground text-xs mt-1">
                        {new Date(r.due_date).toLocaleDateString()} - {r.priority}
                      </p>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-summaries">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-secondary" />
              Executive Summaries
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.summaries.length === 0 ? (
              <p className="text-muted-foreground text-sm">No summaries available</p>
            ) : (
              <ScrollArea className="h-48">
                <ul className="space-y-2">
                  {data.summaries.map((s: any) => (
                    <li
                      key={s.id}
                      className="p-2 rounded-md bg-muted text-sm"
                      data-testid={`summary-${s.id}`}
                    >
                      <p className="text-foreground">{s.summary_text}</p>
                      <p className="text-muted-foreground text-xs mt-1">
                        {new Date(s.generated_at).toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-events">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="h-5 w-5 text-primary" />
              Agent Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.events.length === 0 ? (
              <p className="text-muted-foreground text-sm">No agent activity yet</p>
            ) : (
              <ScrollArea className="h-48">
                <ul className="space-y-2">
                  {data.events.slice().reverse().slice(0, 10).map((e: any) => (
                    <li
                      key={e.id}
                      className="p-2 rounded-md bg-muted text-sm"
                      data-testid={`event-${e.id}`}
                    >
                      <div className="flex items-center gap-2">
                        <Activity className="h-3 w-3 text-primary" />
                        <span className="font-medium text-primary">{e.agent_name}</span>
                        <Badge variant="outline">{e.event_type}</Badge>
                      </div>
                      <p className="text-muted-foreground text-xs mt-1">
                        {new Date(e.created_at).toLocaleTimeString()}
                      </p>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
