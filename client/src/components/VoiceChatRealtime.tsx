import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MessageSquare, Send, Wifi, WifiOff, Mic, MicOff, Globe } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

export default function VoiceChatRealtime() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [text, setText] = useState("");
  const [logs, setLogs] = useState<{ type: "sent" | "received"; content: string; time: string }[]>([]);
  const [speechLanguage, setSpeechLanguage] = useState<"ar" | "en">("en");
  const wasListeningRef = useRef(false);
  
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    isSupported: isSpeechSupported,
    error: speechError
  } = useSpeechRecognition(speechLanguage);

  useEffect(() => {
    if (transcript) {
      setText(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    if (wasListeningRef.current && !isListening && transcript.trim()) {
      const finalText = transcript.trim();
      if (socket && connected && finalText) {
        socket.send(JSON.stringify({ from: "L0-Comms", free_text: finalText }));
        setLogs((l) => [...l, { 
          type: "sent", 
          content: finalText, 
          time: new Date().toLocaleTimeString() 
        }]);
        setText("");
      }
    }
    wasListeningRef.current = isListening;
  }, [isListening, transcript, socket, connected]);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${window.location.host}/realtime`);
    
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
      } else if (msg.type === "audio") {
        const audio = new Audio(`data:audio/mpeg;base64,${msg.data}`);
        audio.play();
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

  const toggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const toggleSpeechLanguage = () => {
    if (isListening) {
      stopListening();
    }
    setSpeechLanguage((prev) => (prev === "en" ? "ar" : "en"));
  };

  return (
    <Card data-testid="card-voice-chat">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Realtime Voice Chat
        </CardTitle>
        <div className="flex items-center gap-2 flex-wrap">
          {isListening && (
            <Badge variant="destructive" className="animate-pulse" data-testid="status-listening">
              <Mic className="h-3 w-3 mr-1" /> Listening...
            </Badge>
          )}
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
        
        {speechError && (
          <p className="text-sm text-destructive" data-testid="text-speech-error">
            {speechError}
          </p>
        )}
        
        <div className="flex gap-2">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Speak now..." : "Type your message or use the mic..."}
            className="resize-none"
            rows={2}
            data-testid="input-message"
          />
          <div className="flex flex-col gap-1">
            {isSpeechSupported ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={toggleMic}
                    disabled={!connected}
                    size="icon"
                    variant={isListening ? "destructive" : "secondary"}
                    data-testid="button-mic"
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isListening ? "Stop listening" : "Start voice input"}
                </TooltipContent>
              </Tooltip>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    size="icon"
                    variant="secondary"
                    disabled
                    data-testid="button-mic-unsupported"
                  >
                    <MicOff className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Speech recognition not supported in this browser
                </TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={toggleSpeechLanguage}
                  size="icon"
                  variant="ghost"
                  data-testid="button-language"
                >
                  <Globe className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {speechLanguage === "en" ? "Switch to Arabic" : "Switch to English"} ({speechLanguage.toUpperCase()})
              </TooltipContent>
            </Tooltip>
            <Button 
              onClick={send} 
              disabled={!connected || !text.trim()}
              size="icon"
              data-testid="button-send"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
