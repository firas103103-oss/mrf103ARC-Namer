import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  Camera,
  FileText,
  Scale,
  TrendingUp,
  Palette,
  Search,
  Send,
  Users,
  MessageSquare,
  Loader2,
  Building2,
  Crown,
  Settings,
  Radio,
  Brain,
} from "lucide-react";
import type { VirtualAgent, AgentType, StoredChatMessage } from "@shared/schema";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  crown: Crown,
  settings: Settings,
  radio: Radio,
  brain: Brain,
  camera: Camera,
  "file-text": FileText,
  scale: Scale,
  "trending-up": TrendingUp,
  palette: Palette,
  search: Search,
};

interface ChatResponse {
  conversationId: string;
  responses: { agentId: AgentType; name: string; content: string }[];
}

export default function VirtualOffice() {
  const [selectedAgents, setSelectedAgents] = useState<AgentType[]>([]);
  const [message, setMessage] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [localMessages, setLocalMessages] = useState<StoredChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { data: agents = [] } = useQuery<VirtualAgent[]>({
    queryKey: ["/api/agents"],
  });

  const { data: messages = [] } = useQuery<StoredChatMessage[]>({
    queryKey: ["/api/conversations", conversationId, "messages"],
    enabled: !!conversationId,
  });

  useEffect(() => {
    if (messages.length > 0) {
      setLocalMessages(messages);
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]);

  const chatMutation = useMutation({
    mutationFn: async (data: { message: string; activeAgents: AgentType[]; conversationId?: string }) => {
      const response = await apiRequest("POST", "/api/chat", data);
      return response.json() as Promise<ChatResponse>;
    },
    onSuccess: (data) => {
      setConversationId(data.conversationId);
      const newMessages: StoredChatMessage[] = data.responses.map((r, idx) => ({
        id: `temp-${Date.now()}-${idx}`,
        conversationId: data.conversationId,
        role: "assistant" as const,
        content: r.content,
        agentId: r.agentId,
        timestamp: new Date().toISOString(),
      }));
      setLocalMessages(prev => [...prev, ...newMessages]);
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", data.conversationId, "messages"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const toggleAgent = (agentId: AgentType) => {
    setSelectedAgents(prev =>
      prev.includes(agentId)
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  const handleSend = () => {
    if (!message.trim() || selectedAgents.length === 0) {
      toast({
        title: "Cannot send message",
        description: selectedAgents.length === 0 
          ? "Please select at least one agent to chat with" 
          : "Please enter a message",
        variant: "destructive",
      });
      return;
    }

    const userMessage: StoredChatMessage = {
      id: `user-${Date.now()}`,
      conversationId: conversationId || "temp",
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
    };
    setLocalMessages(prev => [...prev, userMessage]);

    chatMutation.mutate({
      message,
      activeAgents: selectedAgents,
      conversationId: conversationId || undefined,
    });
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startNewConversation = () => {
    setConversationId(null);
    setLocalMessages([]);
    setSelectedAgents([]);
  };

  const getAgentInfo = (agentId: AgentType | undefined) => {
    return agents.find(a => a.id === agentId);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="border-b p-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold" data-testid="text-title">Virtual Office</h1>
              <p className="text-sm text-muted-foreground" data-testid="text-subtitle">Chat with specialized AI agents</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={startNewConversation}
            data-testid="button-new-conversation"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            New Conversation
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-80 border-r p-4 overflow-auto hidden md:block">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <h2 className="font-semibold">Select Agents</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Choose one or more agents to join your conversation
            </p>
          </div>

          <div className="space-y-2">
            {agents.map((agent) => {
              const IconComponent = iconMap[agent.avatar] || Users;
              const isSelected = selectedAgents.includes(agent.id);
              return (
                <Card
                  key={agent.id}
                  className={`cursor-pointer transition-colors ${
                    isSelected ? "border-primary bg-accent" : ""
                  }`}
                  onClick={() => toggleAgent(agent.id)}
                  data-testid={`card-agent-${agent.id}`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className={isSelected ? "bg-primary text-primary-foreground" : "bg-muted"}>
                          <IconComponent className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{agent.name}</span>
                          {isSelected && (
                            <Badge variant="default" className="text-xs">Active</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{agent.role}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {agent.specialty}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {selectedAgents.length > 0 && (
            <div className="mt-4 p-3 bg-muted rounded-md" data-testid="panel-active-agents">
              <p className="text-xs font-medium mb-2">Active in conversation:</p>
              <div className="flex flex-wrap gap-1">
                {selectedAgents.map(id => {
                  const agent = getAgentInfo(id);
                  return (
                    <Badge key={id} variant="secondary" className="text-xs" data-testid={`badge-active-agent-${id}`}>
                      {agent?.name}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="md:hidden p-3 border-b overflow-x-auto">
            <div className="flex gap-2">
              {agents.map((agent) => {
                const IconComponent = iconMap[agent.avatar] || Users;
                const isSelected = selectedAgents.includes(agent.id);
                return (
                  <Button
                    key={agent.id}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleAgent(agent.id)}
                    className="whitespace-nowrap"
                    data-testid={`button-agent-mobile-${agent.id}`}
                  >
                    <IconComponent className="h-4 w-4 mr-1" />
                    {agent.name.split(" ")[0]}
                  </Button>
                );
              })}
            </div>
          </div>

          <ScrollArea className="flex-1 p-4">
            {localMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2" data-testid="text-welcome">Welcome to Virtual Office</h3>
                <p className="text-muted-foreground max-w-md mb-4">
                  Select one or more AI agents from the panel, then start chatting. 
                  Each agent has their own specialty and will respond to your questions.
                </p>
                {selectedAgents.length === 0 && (
                  <p className="text-sm text-primary">
                    Select agents to begin
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4 max-w-3xl mx-auto">
                {localMessages.map((msg) => {
                  const agent = msg.agentId ? getAgentInfo(msg.agentId) : null;
                  const IconComponent = agent ? iconMap[agent.avatar] || Users : null;
                  
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      data-testid={`message-${msg.id}`}
                    >
                      {msg.role === "assistant" && agent && IconComponent && (
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            <IconComponent className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {msg.role === "assistant" && agent && (
                          <p className="text-xs font-medium mb-1 opacity-80">
                            {agent.name}
                          </p>
                        )}
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  );
                })}
                {chatMutation.isPending && (
                  <div className="flex gap-3 justify-start" data-testid="status-thinking">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-muted">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg p-3">
                      <p className="text-sm text-muted-foreground">Thinking...</p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          <div className="border-t p-4">
            <div className="max-w-3xl mx-auto flex gap-2">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  selectedAgents.length === 0
                    ? "Select agents to start chatting..."
                    : "Type your message... (Press Enter to send)"
                }
                className="resize-none min-h-[60px]"
                disabled={chatMutation.isPending}
                data-testid="input-message"
              />
              <Button
                onClick={handleSend}
                disabled={chatMutation.isPending || selectedAgents.length === 0 || !message.trim()}
                size="icon"
                className="h-[60px] w-[60px]"
                data-testid="button-send"
              >
                {chatMutation.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
            {selectedAgents.length > 0 && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                Chatting with: {selectedAgents.map(id => getAgentInfo(id)?.name).join(", ")}
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
