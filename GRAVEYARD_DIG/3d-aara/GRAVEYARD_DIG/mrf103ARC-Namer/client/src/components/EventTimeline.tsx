import { useEffect, useRef } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Zap, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Send,
  Bell,
  FileText,
  Settings,
  Bot
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export interface TimelineEvent {
  id: string;
  timestamp: string;
  agentName: string;
  eventType: "communication" | "action" | "alert" | "success" | "system" | "message";
  description: string;
}

interface EventTimelineProps {
  events: TimelineEvent[];
  autoScroll?: boolean;
  className?: string;
}

const eventTypeConfig: Record<string, { 
  icon: typeof MessageSquare; 
  bgClass: string;
  borderClass: string;
}> = {
  communication: { 
    icon: MessageSquare, 
    bgClass: "bg-secondary/20",
    borderClass: "border-secondary/40"
  },
  action: { 
    icon: Zap, 
    bgClass: "bg-primary/20",
    borderClass: "border-primary/40"
  },
  alert: { 
    icon: AlertCircle, 
    bgClass: "bg-destructive/20",
    borderClass: "border-destructive/40"
  },
  success: { 
    icon: CheckCircle, 
    bgClass: "bg-primary/20",
    borderClass: "border-primary/40"
  },
  system: { 
    icon: Settings, 
    bgClass: "bg-muted",
    borderClass: "border-muted-foreground/20"
  },
  message: { 
    icon: Send, 
    bgClass: "bg-secondary/20",
    borderClass: "border-secondary/40"
  },
};

const agentColorMap: Record<string, string> = {
  "CEO": "text-primary",
  "CTO": "text-secondary",
  "CFO": "text-chart-4",
  "Legal": "text-chart-3",
  "HR": "text-chart-5",
  "Research": "text-secondary",
  "Security": "text-destructive",
  "Marketing": "text-chart-4",
  "Operations": "text-muted-foreground",
  "System": "text-muted-foreground",
};

function getAgentColor(agentName: string): string {
  for (const [key, color] of Object.entries(agentColorMap)) {
    if (agentName.toLowerCase().includes(key.toLowerCase())) {
      return color;
    }
  }
  return "text-foreground";
}

export function EventTimeline({ events, autoScroll = true, className = "" }: EventTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTo({
        left: scrollRef.current.scrollWidth,
        behavior: "smooth"
      });
    }
  }, [events, autoScroll]);

  if (events.length === 0) {
    return (
      <div className={`flex items-center justify-center h-20 text-muted-foreground text-sm ${className}`}>
        <Clock className="w-4 h-4 mr-2" />
        No events yet
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      
      <ScrollArea className="w-full">
        <div 
          ref={scrollRef}
          className="flex gap-3 p-4 min-w-max"
          data-testid="timeline-events-container"
        >
          {events.map((event, index) => {
            const config = eventTypeConfig[event.eventType] || eventTypeConfig.system;
            const Icon = config.icon;
            const agentColor = getAgentColor(event.agentName);
            
            return (
              <div
                key={event.id}
                className={`
                  flex flex-col gap-1.5 p-3 rounded-md border min-w-[180px] max-w-[220px]
                  ${config.bgClass} ${config.borderClass}
                  transition-all duration-200
                `}
                data-testid={`timeline-event-${event.id}`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  <span className={`text-xs font-medium truncate ${agentColor}`}>
                    {event.agentName}
                  </span>
                </div>
                
                <Badge 
                  variant="outline" 
                  className="w-fit text-[10px] py-0 px-1.5 font-normal"
                >
                  {event.eventType}
                </Badge>
                
                <p className="text-xs text-foreground/80 line-clamp-2 leading-relaxed">
                  {event.description}
                </p>
                
                <span className="text-[10px] text-muted-foreground mt-auto">
                  {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                </span>
              </div>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}

export function convertAgentEventToTimelineEvent(agentEvent: {
  id: string;
  agent_name: string;
  event_type: string;
  payload?: unknown;
  created_at: string;
}): TimelineEvent {
  let eventType: TimelineEvent["eventType"] = "system";
  const lowerType = agentEvent.event_type.toLowerCase();
  
  if (lowerType.includes("message") || lowerType.includes("chat") || lowerType.includes("comm")) {
    eventType = "communication";
  } else if (lowerType.includes("action") || lowerType.includes("execute") || lowerType.includes("task")) {
    eventType = "action";
  } else if (lowerType.includes("alert") || lowerType.includes("warn") || lowerType.includes("error")) {
    eventType = "alert";
  } else if (lowerType.includes("success") || lowerType.includes("complete") || lowerType.includes("done")) {
    eventType = "success";
  } else if (lowerType.includes("send") || lowerType.includes("notify")) {
    eventType = "message";
  }

  let description = agentEvent.event_type;
  if (agentEvent.payload && typeof agentEvent.payload === "object") {
    const payload = agentEvent.payload as Record<string, unknown>;
    if (payload.message && typeof payload.message === "string") {
      description = payload.message;
    } else if (payload.description && typeof payload.description === "string") {
      description = payload.description;
    }
  }

  return {
    id: agentEvent.id,
    timestamp: agentEvent.created_at,
    agentName: agentEvent.agent_name,
    eventType,
    description,
  };
}
