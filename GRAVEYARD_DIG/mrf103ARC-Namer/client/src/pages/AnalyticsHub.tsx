import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle
} from "lucide-react";

interface DashboardMetrics {
  commands: {
    total: number;
    success: number;
    failed: number;
    avg_response: number;
  };
  tasks: {
    total: number;
    completed: number;
    in_progress: number;
  };
  activity24h: number;
}

interface AgentPerformance {
  agentId: string;
  name: string;
  tasksCompleted: number;
  avgResponseTime: number;
  successRate: number;
  messageCount?: number;
}

export default function AnalyticsHub() {
  const { data: metrics, isLoading: metricsLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
  });

  const { data: agentPerformance, isLoading: agentLoading, error: agentError } = useQuery<AgentPerformance[]>({
    queryKey: ["/api/agents/analytics"],
  });

  const commandMetrics = metrics?.commands || { total: 0, success: 0, failed: 0, avg_response: 0 };
  const taskMetrics = metrics?.tasks || { total: 0, completed: 0, in_progress: 0 };

  const successRate = commandMetrics.total > 0 
    ? ((commandMetrics.success / commandMetrics.total) * 100).toFixed(1)
    : "0";

  const taskCompletionRate = taskMetrics.total > 0
    ? ((taskMetrics.completed / taskMetrics.total) * 100).toFixed(1)
    : "0";

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">Analytics Hub</h1>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 overflow-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <Card data-testid="card-metric-commands">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Total Commands</span>
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <p className="text-3xl font-bold">{commandMetrics.total}</p>
              <div className="flex items-center gap-1 mt-1 text-xs">
                <TrendingUp className="h-3 w-3 text-success" />
                <span className="text-success">+12%</span>
                <span className="text-muted-foreground">from last week</span>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-metric-success-rate">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Success Rate</span>
                <CheckCircle2 className="h-4 w-4 text-success" />
              </div>
              <p className="text-3xl font-bold">{successRate}%</p>
              <div className="flex items-center gap-1 mt-1 text-xs">
                <ArrowUpRight className="h-3 w-3 text-success" />
                <span className="text-success">+2.5%</span>
                <span className="text-muted-foreground">improvement</span>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-metric-tasks">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Tasks Completed</span>
                <Target className="h-4 w-4 text-primary" />
              </div>
              <p className="text-3xl font-bold">{taskMetrics.completed}</p>
              <div className="flex items-center gap-1 mt-1 text-xs">
                <span className="text-muted-foreground">{taskMetrics.in_progress} in progress</span>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-metric-activity">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">24h Activity</span>
                <Activity className="h-4 w-4 text-secondary" />
              </div>
              <p className="text-3xl font-bold">{metrics?.activity24h || 0}</p>
              <div className="flex items-center gap-1 mt-1 text-xs">
                <span className="text-muted-foreground">events logged</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
          <Card className="xl:col-span-2" data-testid="card-command-breakdown">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Command Breakdown
              </CardTitle>
              <CardDescription>Success vs failure distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 rounded-md bg-muted">
                  <p className="text-3xl font-bold text-success">{commandMetrics.success}</p>
                  <p className="text-sm text-muted-foreground">Successful</p>
                </div>
                <div className="text-center p-4 rounded-md bg-muted">
                  <p className="text-3xl font-bold text-destructive">{commandMetrics.failed}</p>
                  <p className="text-sm text-muted-foreground">Failed</p>
                </div>
                <div className="text-center p-4 rounded-md bg-muted">
                  <p className="text-3xl font-bold">{Math.round(Number(commandMetrics.avg_response) || 0)}</p>
                  <p className="text-sm text-muted-foreground">Avg Response (ms)</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-success transition-all"
                      style={{ width: `${successRate}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-16">{successRate}%</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Success</span>
                  <span>Failed</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-task-completion">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Task Completion
              </CardTitle>
              <CardDescription>Overall task progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-8 border-muted relative">
                  <div 
                    className="absolute inset-0 rounded-full border-8 border-primary transition-all"
                    style={{ 
                      clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.sin(Number(taskCompletionRate) / 100 * 2 * Math.PI)}% ${50 - 50 * Math.cos(Number(taskCompletionRate) / 100 * 2 * Math.PI)}%, 50% 50%)` 
                    }}
                  />
                  <span className="text-2xl font-bold">{taskCompletionRate}%</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Completed</span>
                  <span className="font-medium">{taskMetrics.completed}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">In Progress</span>
                  <span className="font-medium">{taskMetrics.in_progress}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-medium">{taskMetrics.total}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card data-testid="card-agent-performance">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Agent Performance
            </CardTitle>
            <CardDescription>Individual agent metrics and productivity</CardDescription>
          </CardHeader>
          <CardContent>
            {agentLoading ? (
              <div className="space-y-3" data-testid="agent-performance-loading">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : agentError ? (
              <div className="flex items-center gap-2 text-destructive p-4" data-testid="agent-performance-error">
                <AlertCircle className="h-5 w-5" />
                <span>Failed to load agent performance data</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Agent</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Tasks Completed</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Avg Response</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Success Rate</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(agentPerformance || []).map((agent) => (
                      <tr key={agent.agentId} className="border-b last:border-0 hover:bg-muted/50" data-testid={`row-agent-${agent.agentId}`}>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <Users className="h-4 w-4 text-primary" />
                            </div>
                            <span className="font-medium">{agent.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-medium">{agent.tasksCompleted}</td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-muted-foreground">{agent.avgResponseTime > 0 ? `${agent.avgResponseTime}ms` : '-'}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={agent.successRate >= 90 ? "text-success" : agent.successRate >= 80 ? "text-warning" : "text-destructive"}>
                            {agent.successRate}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Badge variant="outline" className="bg-success/20 text-success dark:text-success">
                            Active
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
