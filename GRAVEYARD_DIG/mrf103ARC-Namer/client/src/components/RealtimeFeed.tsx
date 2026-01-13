import * as React from "react";
import { connectRealtime } from "@/lib/realtime";

type FeedItem = {
  at: number;
  text: string;
};

export default function RealtimeFeed() {
  const [state, setState] = React.useState<string>("connecting");
  const [items, setItems] = React.useState<FeedItem[]>([]);

  React.useEffect(() => {
    const client = connectRealtime();

    const unsub = client.subscribe((msg) => {
      if (msg && typeof msg === "object" && (msg as any).type === "status") {
        setState(String((msg as any).state || "unknown"));
        return;
      }

      const text =
        typeof msg === "string"
          ? msg
          : msg && typeof msg === "object"
            ? JSON.stringify(msg)
            : String(msg);

      setItems((prev) => {
        const next = [...prev, { at: Date.now(), text }];
        return next.slice(-50);
      });
    });

    setState(client.getState());

    return () => {
      unsub();
      client.close();
    };
  }, []);

  return (
    <div className="border border-border rounded-md p-3 bg-card" data-testid="realtime-feed">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-foreground">Realtime Feed</div>
        <div className="text-xs text-muted-foreground" data-testid="realtime-status">
          {state}
        </div>
      </div>
      <div className="mt-2 max-h-56 overflow-auto text-xs font-mono space-y-1">
        {items.length === 0 ? (
          <div className="text-muted-foreground">No messages yet.</div>
        ) : (
          items.map((it, idx) => (
            <div key={`${it.at}-${idx}`} className="text-foreground/90">
              {it.text}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
