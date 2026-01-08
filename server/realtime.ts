
import { WebSocketServer, WebSocket } from "ws";
import type { Server, IncomingMessage } from "http";
import type { Socket } from "net";
import { supabase, isSupabaseConfigured } from "./supabase";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { subscribeToEvents, type ArcEvent } from "./services/event-ledger";
import logger from "./utils/logger";

type Activity = { title?: string } & Record<string, any>;

// Create a WebSocket server instance, but don't attach it to a server yet.
const wss = new WebSocketServer({ noServer: true });

// A set to keep track of all connected dashboard clients.
const clients = new Set<WebSocket>();

/**
 * Broadcasts a message to all connected WebSocket clients.
 * @param message The message object to send.
 */
function broadcast(message: object) {
  const data = JSON.stringify(message);
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) client.send(data);
  });
}

/**
 * Sets up a real-time subscription to the 'activity_feed' table in Supabase.
 * When a new row is inserted, it broadcasts the new activity to all clients.
 */
function setupSupabaseSubscription() {
  if (!isSupabaseConfigured()) {
    console.log("Supabase not configured, skipping real-time subscription for activity feed.");
    return;
  }

  if (!supabase) return;

  console.log("Setting up Supabase real-time subscription for activity_feed...");

  supabase
    .channel("dashboard-activity-feed")
    .on<Activity>(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "activity_feed" },
      (payload: RealtimePostgresChangesPayload<Activity>) => {
        const row = payload.new as Activity;
        console.log(`[Realtime] New activity detected: ${row?.title ?? "(no title)"}`);
        // Broadcast the new activity record to all connected clients.
        broadcast({
          type: "new_activity",
          payload: row,
        });
      }
    )
    .subscribe((status, err) => {
      if (status === "SUBSCRIBED") {
        console.log("✅ Real-time subscription to activity_feed established.");
      } else if (status === "CHANNEL_ERROR") {
        logger.error("❌ Real-time subscription to activity_feed failed:", err);
      }
    });

  // Subscribe to anomalies table
  console.log("Setting up Supabase real-time subscription for anomalies...");
  supabase
    .channel("dashboard-anomalies")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "anomalies" },
      (payload: RealtimePostgresChangesPayload<any>) => {
        console.log(`[Realtime] Anomaly event: ${payload.eventType}`);
        broadcast({
          type: "anomaly_update",
          event: payload.eventType,
          payload: payload.eventType === "DELETE" ? payload.old : payload.new,
        });
      }
    )
    .subscribe((status, err) => {
      if (status === "SUBSCRIBED") {
        console.log("✅ Real-time subscription to anomalies established.");
      } else if (status === "CHANNEL_ERROR") {
        logger.error("❌ Real-time subscription to anomalies failed:", err);
      }
    });

  // Subscribe to mission_scenarios table
  console.log("Setting up Supabase real-time subscription for mission_scenarios...");
  supabase
    .channel("dashboard-scenarios")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "mission_scenarios" },
      (payload: RealtimePostgresChangesPayload<any>) => {
        console.log(`[Realtime] Scenario event: ${payload.eventType}`);
        broadcast({
          type: "scenario_update",
          event: payload.eventType,
          payload: payload.eventType === "DELETE" ? payload.old : payload.new,
        });
      }
    )
    .subscribe((status, err) => {
      if (status === "SUBSCRIBED") {
        console.log("✅ Real-time subscription to mission_scenarios established.");
      } else if (status === "CHANNEL_ERROR") {
        logger.error("❌ Real-time subscription to mission_scenarios failed:", err);
      }
    });

  // Subscribe to team_tasks table
  console.log("Setting up Supabase real-time subscription for team_tasks...");
  supabase
    .channel("dashboard-tasks")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "team_tasks" },
      (payload: RealtimePostgresChangesPayload<any>) => {
        console.log(`[Realtime] Task event: ${payload.eventType}`);
        broadcast({
          type: "task_update",
          event: payload.eventType,
          payload: payload.eventType === "DELETE" ? payload.old : payload.new,
        });
      }
    )
    .subscribe((status, err) => {
      if (status === "SUBSCRIBED") {
        console.log("✅ Real-time subscription to team_tasks established.");
      } else if (status === "CHANNEL_ERROR") {
        logger.error("❌ Real-time subscription to team_tasks failed:", err);
      }
    });

  // Subscribe to agent_performance table
  console.log("Setting up Supabase real-time subscription for agent_performance...");
  supabase
    .channel("dashboard-performance")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "agent_performance" },
      (payload: RealtimePostgresChangesPayload<any>) => {
        console.log(`[Realtime] Agent performance update`);
        broadcast({
          type: "performance_update",
          payload: payload.new,
        });
      }
    )
    .subscribe((status, err) => {
      if (status === "SUBSCRIBED") {
        console.log("✅ Real-time subscription to agent_performance established.");
      } else if (status === "CHANNEL_ERROR") {
        logger.error("❌ Real-time subscription to agent_performance failed:", err);
      }
    });
}

// Set up the WebSocket server event listeners.
wss.on("connection", (ws: WebSocket) => {
  console.log("[Activity Feed] New WebSocket connection established.");
  clients.add(ws);

  ws.on("close", () => {
    console.log("[Activity Feed] WebSocket connection closed.");
    clients.delete(ws);
  });

  ws.on("error", (err) => {
    logger.error("[Activity Feed] WebSocket error:", err);
    clients.delete(ws);
  });

  // Send a welcome message to the newly connected client.
  ws.send(JSON.stringify({ type: "connection_established", message: "Connected to real-time activity feed." }));
});

/**
 * Handles the HTTP upgrade request for the dashboard activity WebSocket.
 * This is called from the main server's 'upgrade' event handler.
 */
export function handleDashboardActivityUpgrade(request: IncomingMessage, socket: Socket, head: Buffer) {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
}

/**
 * Initializes the Supabase subscription. This should be called once when the server starts.
 */
export function initializeRealtimeSubscriptions() {
  console.log("Initializing real-time dashboard activity service...");
  setupSupabaseSubscription();
  
  // Subscribe to ARC Event Ledger and broadcast to all connected clients
  subscribeToEvents((event: ArcEvent) => {
    console.log(`[Realtime] Broadcasting event: ${event.type}`);
    broadcast({
      type: "arc_event",
      event: event.type,
      payload: event,
    });
  });
  console.log("✅ Event Ledger → WebSocket bridge established");
}
