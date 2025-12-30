
import { WebSocketServer, WebSocket } from "ws";
import type { Server, IncomingMessage } from "http";
import type { Socket } from "net";
import { supabase, isSupabaseConfigured } from "./supabase";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import type { Activity } from "@shared/schema";

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
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  }
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

  console.log("Setting up Supabase real-time subscription for activity_feed...");

  supabase
    .channel("dashboard-activity-feed")
    .on<Activity>(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "activity_feed" },
      (payload: RealtimePostgresChangesPayload<Activity>) => {
        console.log(`[Realtime] New activity detected: ${payload.new.title}`);
        // Broadcast the new activity record to all connected clients.
        broadcast({
          type: "new_activity",
          payload: payload.new,
        });
      }
    )
    .subscribe((status, err) => {
      if (status === "SUBSCRIBED") {
        console.log("✅ Real-time subscription to activity_feed established.");
      } else if (status === "CHANNEL_ERROR") {
        console.error("❌ Real-time subscription to activity_feed failed:", err);
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
    console.error("[Activity Feed] WebSocket error:", err);
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
}
