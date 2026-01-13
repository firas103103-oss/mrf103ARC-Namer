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
  info: "text-secondary",
  warning: "text-chart-4",
  error: "text-destructive",
  success: "text-primary",
};

const severityBadgeClasses: Record<EventSeverity, string> = {
  info: "bg-secondary/20 text-secondary border-secondary/30",
  warning: "bg-chart-4/20 text-chart-4 border-chart-4/30",
  error: "bg-destructive/20 text-destructive border-destructive/30",
  success: "bg-primary/20 text-primary border-primary/30",
};

function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }) + "." + date.getMilliseconds().toString().padStart(3, "0");
}

export function TerminalHeartbeat({ 
  events: externalEvents, 
  maxEvents = 50,
  className 
}: TerminalHeartbeatProps) {
  const [events, setEvents] = useState<LogEvent[]>(() => 
    externalEvents || []
  );
  const [isPulsing, setIsPulsing] = useState(false);
  const [lastEventId, setLastEventId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const eventCountRef = useRef(0);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  useEffect(() => {
    // No mock events - only show real data from externalEvents prop
    if (!externalEvents || externalEvents.length === 0) return;
    
    setEvents(externalEvents);
  }, [externalEvents, maxEvents]);

  return (
    <div 
      className={cn(
        "relative rounded-lg overflow-hidden",
        "bg-card border border-border",
        className
      )}
      data-testid="terminal-heartbeat"
    >
      <div className="flex items-center justify-between gap-4 px-4 py-3 bg-muted/50 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <div 
              className={cn(
                "w-3 h-3 rounded-full bg-primary transition-all duration-300",
                isPulsing && "scale-110"
              )}
              data-testid="heartbeat-indicator"
            />
            <div 
              className={cn(
                "absolute inset-0 rounded-full bg-primary animate-ping opacity-75",
                !isPulsing && "opacity-0"
              )}
              style={{ animationDuration: "600ms" }}
            />
            <div 
              className={cn(
                "absolute -inset-1 rounded-full transition-all duration-300",
                isPulsing 
                  ? "bg-primary/20" 
                  : "bg-transparent"
              )}
            />
          </div>
          
          <span className="font-mono text-sm font-medium text-foreground/90">
            ARC Terminal
          </span>
          <Badge 
            variant="outline" 
            className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-primary/30"
            data-testid="badge-live"
          >
            LIVE
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
          <span data-testid="text-event-count">{events.length} events</span>
          <span className="text-border">|</span>
          <span className={cn(
            "transition-colors duration-300",
            isPulsing ? "text-primary" : "text-muted-foreground"
          )}>
            {formatTimestamp(new Date())}
          </span>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="h-72 overflow-y-auto p-3 space-y-1 font-mono text-xs bg-background"
        style={{
          scrollBehavior: "smooth",
        }}
        data-testid="terminal-log-area"
      >
        {events.map((event, index) => (
          <div
            key={event.id}
            className={cn(
              "flex items-start gap-2 py-1.5 px-2 rounded transition-all duration-500",
              lastEventId === event.id && "animate-pulse bg-primary/5",
              "hover:bg-muted/50"
            )}
            data-testid={`log-entry-${index}`}
          >
            <span className="flex-shrink-0 text-muted-foreground/70 tabular-nums">
              [{formatTimestamp(event.timestamp)}]
            </span>

            <Badge 
              variant="outline"
              className={cn(
                "flex-shrink-0 text-[9px] px-1.5 py-0 font-semibold border",
                severityBadgeClasses[event.severity]
              )}
            >
              {event.eventType}
            </Badge>

            <span className={cn("flex-shrink-0", severityColors[event.severity])}>
              {event.severity === "error" && "x"}
              {event.severity === "warning" && "!"}
              {event.severity === "success" && ">"}
              {event.severity === "info" && ">"}
            </span>

            <span className={cn(
              "flex-1 break-words",
              severityColors[event.severity]
            )}>
              {event.message}
            </span>
          </div>
        ))}

        <div className="flex items-center gap-2 py-1.5 px-2 text-muted-foreground/50">
          <span className="animate-pulse">|</span>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent pointer-events-none" />

      <div 
        className={cn(
          "absolute inset-0 pointer-events-none transition-opacity duration-300 rounded-lg",
          "border-2 border-primary/0",
          isPulsing && "border-primary/20"
        )}
      />
    </div>
  );
}

export type { LogEvent, EventSeverity, TerminalHeartbeatProps };
