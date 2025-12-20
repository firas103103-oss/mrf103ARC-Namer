import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type EventSeverity = "info" | "warning" | "error" | "success";

interface LogEvent {
  id: string;
  timestamp: Date;
  message: string;
  severity: EventSeverity;
  eventType: string;
}

interface TerminalHeartbeatProps {
  events?: LogEvent[];
  maxEvents?: number;
  className?: string;
}

const severityColors: Record<EventSeverity, string> = {
  info: "text-cyan-400",
  warning: "text-yellow-400",
  error: "text-red-400",
  success: "text-emerald-400",
};

const severityBadgeClasses: Record<EventSeverity, string> = {
  info: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  warning: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  error: "bg-red-500/20 text-red-400 border-red-500/30",
  success: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

const severityGlowClasses: Record<EventSeverity, string> = {
  info: "shadow-[0_0_10px_rgba(34,211,238,0.3)]",
  warning: "shadow-[0_0_10px_rgba(250,204,21,0.3)]",
  error: "shadow-[0_0_10px_rgba(248,113,113,0.3)]",
  success: "shadow-[0_0_10px_rgba(52,211,153,0.3)]",
};

function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }) + "." + date.getMilliseconds().toString().padStart(3, "0");
}

function generateMockEvents(): LogEvent[] {
  const eventTypes = ["SYSTEM", "AUTH", "API", "DB", "AGENT", "NETWORK", "CACHE"];
  const messages = [
    "Connection established to primary server",
    "Agent workflow initialized successfully",
    "Database query completed in 45ms",
    "API rate limit approaching threshold",
    "Cache invalidation triggered",
    "Authentication token refreshed",
    "WebSocket connection stable",
    "Memory usage within normal parameters",
    "Backup process initiated",
    "Load balancer health check passed",
  ];
  const severities: EventSeverity[] = ["info", "success", "warning", "error"];
  
  return Array.from({ length: 5 }, (_, i) => ({
    id: `initial-${i}`,
    timestamp: new Date(Date.now() - (5 - i) * 2000),
    message: messages[Math.floor(Math.random() * messages.length)],
    severity: severities[Math.floor(Math.random() * 3)], // Favor non-errors initially
    eventType: eventTypes[Math.floor(Math.random() * eventTypes.length)],
  }));
}

export function TerminalHeartbeat({ 
  events: externalEvents, 
  maxEvents = 50,
  className 
}: TerminalHeartbeatProps) {
  const [events, setEvents] = useState<LogEvent[]>(() => 
    externalEvents || generateMockEvents()
  );
  const [isPulsing, setIsPulsing] = useState(false);
  const [lastEventId, setLastEventId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const eventCountRef = useRef(0);

  // Auto-scroll to bottom when new events arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  // Simulate streaming events if no external events provided
  useEffect(() => {
    if (externalEvents) return;

    const eventTypes = ["SYSTEM", "AUTH", "API", "DB", "AGENT", "NETWORK", "CACHE", "HEARTBEAT"];
    const messages = [
      "Health check completed successfully",
      "Agent status: All systems operational",
      "Memory pool reallocated",
      "Request processed: /api/agents/status",
      "Task queue length: 3 pending",
      "Websocket ping: 12ms latency",
      "Session token validated",
      "Background job completed",
      "Metrics exported to monitoring",
      "Configuration reloaded",
      "Connection pool: 8/20 active",
      "Cache hit ratio: 94.2%",
    ];
    const severities: EventSeverity[] = ["info", "success", "warning", "error"];
    const weights = [0.5, 0.3, 0.15, 0.05]; // Weighted probabilities

    const interval = setInterval(() => {
      const random = Math.random();
      let severityIndex = 0;
      let cumulative = 0;
      for (let i = 0; i < weights.length; i++) {
        cumulative += weights[i];
        if (random < cumulative) {
          severityIndex = i;
          break;
        }
      }

      const newEvent: LogEvent = {
        id: `event-${Date.now()}-${eventCountRef.current++}`,
        timestamp: new Date(),
        message: messages[Math.floor(Math.random() * messages.length)],
        severity: severities[severityIndex],
        eventType: eventTypes[Math.floor(Math.random() * eventTypes.length)],
      };

      setEvents(prev => {
        const updated = [...prev, newEvent];
        return updated.slice(-maxEvents);
      });
      setLastEventId(newEvent.id);
      
      // Trigger pulse animation
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 600);
    }, 1500 + Math.random() * 2000);

    return () => clearInterval(interval);
  }, [externalEvents, maxEvents]);

  return (
    <div 
      className={cn(
        "relative rounded-lg overflow-hidden",
        "bg-[hsl(222,47%,6%)] border border-[hsl(220,30%,16%)]",
        className
      )}
      data-testid="terminal-heartbeat"
    >
      {/* Terminal Header */}
      <div className="flex items-center justify-between gap-4 px-4 py-3 bg-[hsl(222,40%,8%)] border-b border-[hsl(220,30%,14%)]">
        <div className="flex items-center gap-3">
          {/* Heartbeat indicator */}
          <div className="relative flex items-center justify-center">
            <div 
              className={cn(
                "w-3 h-3 rounded-full bg-emerald-500 transition-all duration-300",
                isPulsing && "scale-110"
              )}
            />
            <div 
              className={cn(
                "absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75",
                !isPulsing && "opacity-0"
              )}
              style={{ animationDuration: "600ms" }}
            />
            {/* Outer glow ring */}
            <div 
              className={cn(
                "absolute -inset-1 rounded-full transition-all duration-300",
                isPulsing 
                  ? "bg-emerald-500/20 shadow-[0_0_15px_rgba(52,211,153,0.5)]" 
                  : "bg-transparent"
              )}
            />
          </div>
          
          <span className="font-mono text-sm font-medium text-foreground/90">
            ARC Terminal
          </span>
          <Badge 
            variant="outline" 
            className="text-[10px] px-1.5 py-0 bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
          >
            LIVE
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
          <span>{events.length} events</span>
          <span className="text-[hsl(220,30%,25%)]">|</span>
          <span className={cn(
            "transition-colors duration-300",
            isPulsing ? "text-emerald-400" : "text-muted-foreground"
          )}>
            {formatTimestamp(new Date())}
          </span>
        </div>
      </div>

      {/* Terminal Body */}
      <div 
        ref={scrollRef}
        className="h-72 overflow-y-auto p-3 space-y-1 font-mono text-xs scrollbar-thin scrollbar-thumb-[hsl(220,30%,20%)] scrollbar-track-transparent"
        style={{
          scrollBehavior: "smooth",
        }}
      >
        {events.map((event, index) => (
          <div
            key={event.id}
            className={cn(
              "flex items-start gap-2 py-1.5 px-2 rounded transition-all duration-500",
              lastEventId === event.id && "animate-terminal-entry",
              lastEventId === event.id && severityGlowClasses[event.severity],
              "hover:bg-[hsl(222,35%,10%)]"
            )}
            data-testid={`log-entry-${index}`}
          >
            {/* Timestamp */}
            <span className="flex-shrink-0 text-muted-foreground/70 tabular-nums">
              [{formatTimestamp(event.timestamp)}]
            </span>

            {/* Event Type Badge */}
            <Badge 
              variant="outline"
              className={cn(
                "flex-shrink-0 text-[9px] px-1.5 py-0 font-semibold border",
                severityBadgeClasses[event.severity]
              )}
            >
              {event.eventType}
            </Badge>

            {/* Severity Indicator */}
            <span className={cn("flex-shrink-0", severityColors[event.severity])}>
              {event.severity === "error" && "✗"}
              {event.severity === "warning" && "⚠"}
              {event.severity === "success" && "✓"}
              {event.severity === "info" && "›"}
            </span>

            {/* Message */}
            <span className={cn(
              "flex-1 break-words",
              severityColors[event.severity]
            )}>
              {event.message}
            </span>
          </div>
        ))}

        {/* Cursor blink effect */}
        <div className="flex items-center gap-2 py-1.5 px-2 text-muted-foreground/50">
          <span className="animate-pulse">▌</span>
        </div>
      </div>

      {/* Gradient fade at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[hsl(222,47%,6%)] to-transparent pointer-events-none" />

      {/* Pulse overlay effect */}
      <div 
        className={cn(
          "absolute inset-0 pointer-events-none transition-opacity duration-300 rounded-lg",
          "border-2 border-emerald-500/0",
          isPulsing && "border-emerald-500/20 shadow-[inset_0_0_30px_rgba(52,211,153,0.1)]"
        )}
      />

      <style>{`
        @keyframes terminal-entry {
          0% {
            opacity: 0;
            transform: translateX(-10px);
            background-color: hsl(168deg 65% 46% / 0.1);
          }
          50% {
            background-color: hsl(168deg 65% 46% / 0.05);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
            background-color: transparent;
          }
        }

        .animate-terminal-entry {
          animation: terminal-entry 0.5s ease-out forwards;
        }

        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: hsl(220, 30%, 20%);
          border-radius: 3px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background-color: hsl(220, 30%, 28%);
        }
      `}</style>
    </div>
  );
}

export type { LogEvent, EventSeverity, TerminalHeartbeatProps };
