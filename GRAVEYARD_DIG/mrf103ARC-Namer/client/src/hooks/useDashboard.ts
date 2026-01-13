import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

type Wrapped<T> = { data: T; count?: number };

export type DashboardCommand = {
  id: string;
  command_id?: string | null;
  command: string;
  status: string;
  created_at: string;
  payload?: Record<string, unknown>;
  duration_ms?: number | null;
};

export type DashboardEvent = {
  id: string;
  agent_name: string;
  event_type: string;
  payload?: Record<string, unknown>;
  created_at: string;
};

export type TimelineItem = {
  id: string;
  type: "command" | "event";
  created_at: string;
  command?: string;
  status?: string;
  agent_name?: string;
  event_type?: string;
  payload?: Record<string, unknown>;
};

export type CommandMetrics = {
  total: number;
  success: number;
  failed: number;
  avgResponse: number;
};

export type Selfcheck = {
  reminders: Array<Record<string, unknown>>;
  summaries: Array<Record<string, unknown>>;
  events: DashboardEvent[];
};

export function useDashboard() {
  const commandsQuery = useQuery({
    queryKey: ["dashboard", "commands"],
    queryFn: async () => {
      const res = await api<Wrapped<DashboardCommand[]>>("/api/dashboard/commands");
      return res.data || [];
    },
  });

  const eventsQuery = useQuery({
    queryKey: ["dashboard", "events"],
    queryFn: async () => {
      const res = await api<Wrapped<DashboardEvent[]>>("/api/dashboard/events");
      return res.data || [];
    },
  });

  const timelineQuery = useQuery({
    queryKey: ["dashboard", "timeline"],
    queryFn: async () => {
      const res = await api<Wrapped<TimelineItem[]>>("/api/core/timeline");
      return res.data || [];
    },
  });

  const metricsQuery = useQuery({
    queryKey: ["dashboard", "metrics"],
    queryFn: async () => api<CommandMetrics>("/api/arc/command-metrics"),
  });

  const selfcheckQuery = useQuery({
    queryKey: ["dashboard", "selfcheck"],
    queryFn: async () => api<Selfcheck>("/api/arc/selfcheck"),
  });

  const isLoading =
    commandsQuery.isLoading ||
    eventsQuery.isLoading ||
    timelineQuery.isLoading ||
    metricsQuery.isLoading ||
    selfcheckQuery.isLoading;

  const error =
    commandsQuery.error ||
    eventsQuery.error ||
    timelineQuery.error ||
    metricsQuery.error ||
    selfcheckQuery.error;

  const refetchAll = async () => {
    await Promise.all([
      commandsQuery.refetch(),
      eventsQuery.refetch(),
      timelineQuery.refetch(),
      metricsQuery.refetch(),
      selfcheckQuery.refetch(),
    ]);
  };

  return {
    commands: commandsQuery.data || [],
    events: eventsQuery.data || [],
    timeline: timelineQuery.data || [],
    metrics: metricsQuery.data || null,
    selfcheck: selfcheckQuery.data || null,
    isLoading,
    error,
    refetchAll,
  };
}
