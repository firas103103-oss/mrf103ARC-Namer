type Listener = (message: unknown) => void;

type ConnectionState = "connecting" | "open" | "closed" | "error";

export type RealtimeClient = {
  getState: () => ConnectionState;
  subscribe: (cb: Listener) => () => void;
  close: () => void;
};

export function connectRealtime(): RealtimeClient {
  let ws: WebSocket | null = null;
  let state: ConnectionState = "closed";
  const listeners = new Set<Listener>();
  let pingTimer: number | null = null;
  let reconnectTimer: number | null = null;
  let backoffMs = 500;

  const notify = (msg: unknown) => {
    listeners.forEach((cb) => cb(msg));
  };

  const clearTimers = () => {
    if (pingTimer) {
      window.clearInterval(pingTimer);
      pingTimer = null;
    }
    if (reconnectTimer) {
      window.clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };

  const scheduleReconnect = () => {
    clearTimers();
    state = "closed";

    const delay = Math.min(backoffMs, 10_000);
    backoffMs = Math.min(backoffMs * 2, 10_000);

    reconnectTimer = window.setTimeout(() => {
      open();
    }, delay);
  };

  const open = () => {
    clearTimers();

    const proto = window.location.protocol === "https:" ? "wss" : "ws";
    const url = `${proto}://${window.location.host}/realtime`;

    state = "connecting";
    notify({ type: "status", state });

    ws = new WebSocket(url);

    ws.onopen = () => {
      state = "open";
      backoffMs = 500;
      notify({ type: "status", state });

      pingTimer = window.setInterval(() => {
        try {
          ws?.send(JSON.stringify({ type: "ping" }));
        } catch {
          // ignore
        }
      }, 20_000);
    };

    ws.onmessage = (evt) => {
      const raw = evt.data;
      try {
        notify(JSON.parse(String(raw)));
      } catch {
        notify(String(raw));
      }
    };

    ws.onerror = () => {
      state = "error";
      notify({ type: "status", state });
    };

    ws.onclose = () => {
      state = "closed";
      notify({ type: "status", state });
      scheduleReconnect();
    };
  };

  open();

  return {
    getState: () => state,
    subscribe: (cb: Listener) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    close: () => {
      clearTimers();
      try {
        ws?.close();
      } catch {
        // ignore
      }
      ws = null;
      state = "closed";
    },
  };
}
