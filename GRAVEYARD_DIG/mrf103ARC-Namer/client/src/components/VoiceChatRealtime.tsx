import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Wifi, WifiOff } from "lucide-react";

export default function VoiceChatRealtime() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [text, setText] = useState("");
  const [logs, setLogs] = useState<{ type: "sent" | "received"; content: string; time: string }[]>([]);
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = import.meta.env.VITE_WS_BACKEND_URL || window.location.host;
    const ws = new WebSocket(`${protocol}//${host}/realtime`);
    
    ws.onopen = () => {
      setConnected(true);
    };
    
    ws.onclose = () => {
      setConnected(false);
    };
    
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === "text") {
        setLogs((l) => [...l, { 
          type: "received", 
          content: msg.data, 
          time: new Date().toLocaleTimeString() 
        }]);
      }
    };
    
    setSocket(ws);
    return () => ws.close();
  }, []);

  const send = () => {
    if (!socket || !text.trim()) return;
    socket.send(JSON.stringify({ from: "L0-Comms", free_text: text }));
    setLogs((l) => [...l, { 
      type: "sent", 
      content: text, 
      time: new Date().toLocaleTimeString() 
    }]);
    setText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <Card data-testid="card-voice-chat">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Live Chat (Text)
        </CardTitle>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={connected ? "default" : "secondary"} data-testid="status-connection">
            {connected ? (
              <><Wifi className="h-3 w-3 mr-1" /> Connected</>
            ) : (
              <><WifiOff className="h-3 w-3 mr-1" /> Disconnected</>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="h-64 rounded-md border p-3 bg-muted/30" data-testid="chat-messages">
          {logs.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">
              No messages yet. Start a conversation!
            </p>
          ) : (
            <div className="space-y-2">
              {logs.map((log, i) => (
                <div 
                  key={i} 
                  className={`p-2 rounded-md text-sm ${
                    log.type === "sent" 
                      ? "bg-primary/10 text-foreground ml-8" 
                      : "bg-muted text-foreground mr-8"
                  }`}
                  data-testid={`message-${i}`}
                >
                  <p>{log.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">{log.time}</p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <div className="flex gap-2">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="resize-none"
            rows={2}
            data-testid="input-message"
          />
          <Button 
            onClick={send} 
            disabled={!connected || !text.trim()}
            size="icon"
            data-testid="button-send"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
