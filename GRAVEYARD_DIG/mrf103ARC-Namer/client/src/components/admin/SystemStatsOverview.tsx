/**
 * System Stats Overview Component
 * Displays key system metrics in a dashboard format
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Bot,
  Briefcase,
  Activity,
  Database,
  Zap,
  TrendingUp,
  BarChart3,
} from "lucide-react";

interface SystemStats {
  totalAgents: number;
  activeAgents: number;
  totalProjects: number;
  activeProjects: number;
  totalUsers: number;
  apiCalls24h: number;
  avgResponseTime: number;
  successRate: number;
}

interface SystemStatsOverviewProps {
  stats?: SystemStats;
  isLoading?: boolean;
  className?: string;
}

export function SystemStatsOverview({ stats, isLoading, className }: SystemStatsOverviewProps) {
  if (isLoading) {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-4">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const metrics = [
    {
      icon: <Bot className="h-5 w-5" />,
      label: "Total Agents",
      value: stats?.totalAgents ?? 0,
      subValue: `${stats?.activeAgents ?? 0} active`,
      color: "text-blue-500",
    },
    {
      icon: <Briefcase className="h-5 w-5" />,
      label: "Projects",
      value: stats?.totalProjects ?? 0,
      subValue: `${stats?.activeProjects ?? 0} active`,
      color: "text-green-500",
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: "Users",
      value: stats?.totalUsers ?? 0,
      subValue: "registered",
      color: "text-purple-500",
    },
    {
      icon: <Zap className="h-5 w-5" />,
      label: "API Calls (24h)",
      value: stats?.apiCalls24h ?? 0,
      subValue: "requests",
      color: "text-yellow-500",
    },
    {
      icon: <Activity className="h-5 w-5" />,
      label: "Avg Response",
      value: `${stats?.avgResponseTime ?? 0}ms`,
      subValue: "latency",
      color: "text-cyan-500",
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      label: "Success Rate",
      value: `${stats?.successRate ?? 0}%`,
      subValue: "reliability",
      color: "text-emerald-500",
    },
    {
      icon: <Database className="h-5 w-5" />,
      label: "DB Status",
      value: "Healthy",
      subValue: "connected",
      color: "text-green-500",
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      label: "System Load",
      value: "Normal",
      subValue: "optimal",
      color: "text-blue-500",
    },
  ];

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      {metrics.map((metric, index) => (
        <Card key={index} tabIndex={0} role="article" aria-label={`${metric.label}: ${metric.value}`}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={metric.color}>{metric.icon}</div>
              <span className="text-sm text-muted-foreground">{metric.label}</span>
            </div>
            <p className="text-2xl font-bold">{metric.value}</p>
            <p className="text-xs text-muted-foreground">{metric.subValue}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
