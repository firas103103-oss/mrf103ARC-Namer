import { useEffect, useState } from "react";
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
    const res = await fetch("/api/arc/command-metrics");
    if (!res.ok) return;
    const data = await res.json();
    setMetrics({
      total: Number(data.total) || 0,
      success: Number(data.success) || 0,
      failed: Number(data.failed) || 0,
      avgResponse: Number(data.avgResponse) || 0,
    });
  };

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
