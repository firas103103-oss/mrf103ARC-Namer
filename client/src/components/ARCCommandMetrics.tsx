import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, CheckCircle2, XCircle, Zap } from "lucide-react";

export default function ARCCommandMetrics() {
  const [metrics, setMetrics] = useState({
    total: 0,
    success: 0,
    failed: 0,
    avgResponse: 0,
  });

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    if (!isSupabaseConfigured || !supabase) return;

    const result = await supabase
      .from("arc_command_log")
      .select("*")
      .limit(100);

    const commands = result?.data;
    if (!commands) return;

    const total = commands.length;
    const success = commands.filter((c) => c.status === "completed").length;
    const failed = commands.filter((c) => c.status === "failed").length;
    const avgResponse = commands.reduce((acc, c) => acc + (c.duration_ms || 0), 0) / (total || 1);

    setMetrics({ total, success, failed, avgResponse });
  };

  if (!isSupabaseConfigured) {
    return (
      <Card data-testid="card-metrics-error">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Command Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Supabase not configured</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="card-metrics">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          ARC Command Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-md bg-muted" data-testid="metric-total">
            <p className="text-muted-foreground text-sm">Total</p>
            <p className="text-2xl font-bold text-foreground">{metrics.total}</p>
          </div>
          <div className="p-4 rounded-md bg-muted" data-testid="metric-success">
            <p className="text-muted-foreground text-sm flex items-center justify-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-primary" /> Success
            </p>
            <p className="text-2xl font-bold text-primary">{metrics.success}</p>
          </div>
          <div className="p-4 rounded-md bg-muted" data-testid="metric-failed">
            <p className="text-muted-foreground text-sm flex items-center justify-center gap-1">
              <XCircle className="h-3 w-3 text-destructive" /> Failed
            </p>
            <p className="text-2xl font-bold text-destructive">{metrics.failed}</p>
          </div>
          <div className="p-4 rounded-md bg-muted" data-testid="metric-avg">
            <p className="text-muted-foreground text-sm flex items-center justify-center gap-1">
              <Zap className="h-3 w-3 text-secondary" /> Avg (ms)
            </p>
            <p className="text-2xl font-bold text-secondary">{Math.round(metrics.avgResponse)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
