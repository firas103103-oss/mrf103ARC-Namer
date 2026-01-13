import * as React from "react";
import { connectRealtime } from "@/lib/realtime";

export type RealtimeTimelineItem = {
  id: string;
  type: "event";
  created_at: string;
  agent_name?: string;
  event_type?: string;
  payload?: Record<string, unknown>;
};

function toTimelineItem(msg: unknown): RealtimeTimelineItem | null {
  if (!msg || typeof msg !== "object") return null;

  const anyMsg = msg as any;

  if (anyMsg.type === "new_activity" && anyMsg.payload && typeof anyMsg.payload === "object") {
    const p = anyMsg.payload as any;
    const id = String(p.id || p.uuid || `${Date.now()}`);
    const created_at = String(p.created_at || new Date().toISOString());
    const agent_name = String(p.agent_name || p.agent || p.source || "ARC");
    const event_type = String(p.event_type || p.type || p.title || "activity");

    return {
      id: `ws-${id}`,
      type: "event",
      created_at,
      agent_name,
      event_type,
      payload: p,
    };
  }

  // ignore other message types
  return null;
}

export function useRealtimeEvents() {
  const [items, setItems] = React.useState<RealtimeTimelineItem[]>([]);

  React.useEffect(() => {
    let mounted = true;
    let client: ReturnType<typeof connectRealtime> | null = null;

    try {
      client = connectRealtime();

      const unsub = client.subscribe((msg) => {
        const it = toTimelineItem(msg);
        if (!it || !mounted) return;
        setItems((prev) => {
          const next = [...prev, it];
          return next.slice(-100);
        });
      });

      return () => {
        mounted = false;
        unsub();
        client?.close();
      };
    } catch {
      // fail silently
      return () => {
        mounted = false;
        client?.close();
      };
    }
  }, []);

  return {
    realtimeTimeline: items,
  };
}
