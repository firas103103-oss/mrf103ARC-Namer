import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest, classifyError, getErrorMessage } from "@/lib/queryClient";
import type { AgentType } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
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
  LogOut,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Plus,
  Trash2,
  History,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import type { VirtualAgent, StoredChatMessage, StoredConversation } from "@shared/schema";
import { format } from "date-fns";

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

function ConversationSidebar({
  conversations,
  isLoading,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  agents,
}: {
  conversations: StoredConversation[];
  isLoading: boolean;
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  agents: VirtualAgent[];
}) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const getAgentBadges = (activeAgents: AgentType[]) => {
    return activeAgents.slice(0, 3).map(agentId => {
      const agent = agents.find(a => a.id === agentId);
      return agent?.name.split(" ")[0] || agentId;
    });
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-3">
        <Button
          onClick={onNewConversation}
          className="w-full"
          data-testid="button-new-conversation"
        >
          {isCollapsed ? (
            <Plus className="h-4 w-4" />
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              New Conversation
            </>
          )}
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <History className="h-4 w-4 mr-2" />
            {!isCollapsed && "Conversation History"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isLoading ? (
                <div className="space-y-2 p-2">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  {!isCollapsed && "No conversations yet"}
                </div>
              ) : (
                conversations.map((conv) => (
                  <SidebarMenuItem key={conv.id}>
                    <div className="group relative w-full">
                      <SidebarMenuButton
                        onClick={() => onSelectConversation(conv.id)}
                        isActive={currentConversationId === conv.id}
                        className="w-full"
                        data-testid={`button-conversation-${conv.id}`}
                      >
                        <MessageSquare className="h-4 w-4 shrink-0" />
                        {!isCollapsed && (
                          <div className="flex-1 min-w-0 text-left">
                            <p className="text-sm font-medium truncate">
                              {conv.title}
                            </p>
                            <div className="flex items-center gap-1 mt-1 flex-wrap">
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(conv.updatedAt), "MMM d")}
                              </span>
                              {getAgentBadges(conv.activeAgents).map((name, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs py-0">
                                  {name}
                                </Badge>
                              ))}
                              {conv.activeAgents.length > 3 && (
                                <Badge variant="secondary" className="text-xs py-0">
                                  +{conv.activeAgents.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </SidebarMenuButton>
                      {!isCollapsed && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => e.stopPropagation()}
                              data-testid={`button-delete-conversation-${conv.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this conversation? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onDeleteConversation(conv.id)}
                                data-testid="button-confirm-delete"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

interface FailedMessage {
  id: string;
  content: string;
  activeAgents: AgentType[];
  conversationId?: string;
}

function VirtualOfficeContent() {
  const [selectedAgents, setSelectedAgents] = useState<AgentType[]>([]);
  const [message, setMessage] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [localMessages, setLocalMessages] = useState<StoredChatMessage[]>([]);
  const [voiceModeEnabled, setVoiceModeEnabled] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [failedMessage, setFailedMessage] = useState<FailedMessage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    isSupported: speechSupported,
    error: speechError,
  } = useSpeechRecognition();

  const { data: agents = [] } = useQuery<VirtualAgent[]>({
    queryKey: ["/api/agents"],
  });

  const { data: conversations = [], isLoading: conversationsLoading } = useQuery<StoredConversation[]>({
    queryKey: ["/api/conversations"],
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery<StoredChatMessage[]>({
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

  useEffect(() => {
    if (transcript && isListening) {
      setMessage(transcript);
    }
  }, [transcript, isListening]);

  useEffect(() => {
    if (speechError) {
      toast({
        title: "Speech Recognition Error",
        description: speechError,
        variant: "destructive",
      });
    }
  }, [speechError, toast]);

  const deleteConversationMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/conversations/${id}`);
    },
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      if (conversationId === deletedId) {
        setConversationId(null);
        setLocalMessages([]);
        setSelectedAgents([]);
      }
      toast({
        title: "Conversation deleted",
        description: "The conversation has been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete conversation",
        variant: "destructive",
      });
    },
  });

  const ttsMutation = useMutation({
    mutationFn: async (data: { text: string; messageId: string }) => {
      const response = await apiRequest("POST", "/api/tts", { text: data.text });
      const result = await response.json();
      return { ...result, messageId: data.messageId };
    },
    onSuccess: (data) => {
      if (data.audio) {
        playAudio(data.audio, data.messageId);
      }
    },
    onError: (error) => {
      toast({
        title: "Text-to-Speech Error",
        description: error instanceof Error ? error.message : "Failed to generate speech",
        variant: "destructive",
      });
      setPlayingAudioId(null);
    },
  });

  const playAudio = (base64Audio: string, messageId: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(`data:audio/mpeg;base64,${base64Audio}`);
    audioRef.current = audio;
    setPlayingAudioId(messageId);

    audio.onended = () => {
      setPlayingAudioId(null);
      audioRef.current = null;
    };

    audio.onerror = () => {
      toast({
        title: "Audio Playback Error",
        description: "Failed to play audio",
        variant: "destructive",
      });
      setPlayingAudioId(null);
      audioRef.current = null;
    };

    audio.play().catch((err) => {
      toast({
        title: "Audio Playback Error",
        description: "Failed to play audio: " + err.message,
        variant: "destructive",
      });
      setPlayingAudioId(null);
    });
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlayingAudioId(null);
  };

  const handlePlayAudio = (messageId: string, content: string) => {
    if (playingAudioId === messageId) {
      stopAudio();
    } else {
      setPlayingAudioId(messageId);
      ttsMutation.mutate({ text: content, messageId });
    }
  };

  const chatMutation = useMutation({
    mutationFn: async (data: { message: string; activeAgents: AgentType[]; conversationId?: string }) => {
      const response = await apiRequest("POST", "/api/chat", data);
      return response.json() as Promise<ChatResponse>;
    },
    onSuccess: (data) => {
      setFailedMessage(null);
      setConversationId(data.conversationId);
      const timestamp = Date.now();
      const newMessages: StoredChatMessage[] = data.responses.map((r, idx) => ({
        id: `temp-${timestamp}-${idx}`,
        conversationId: data.conversationId,
        role: "assistant" as const,
        content: r.content,
        agentId: r.agentId,
        timestamp: new Date().toISOString(),
      }));
      setLocalMessages(prev => [...prev, ...newMessages]);
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", data.conversationId, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });

      if (voiceModeEnabled && newMessages.length > 0) {
        const firstMessage = newMessages[0];
        ttsMutation.mutate({ text: firstMessage.content, messageId: firstMessage.id });
      }
    },
    onError: (error, variables) => {
      const errorType = classifyError(error);
      const errorMessage = getErrorMessage(error);
      
      setFailedMessage({
        id: `failed-${Date.now()}`,
        content: variables.message,
        activeAgents: variables.activeAgents,
        conversationId: variables.conversationId,
      });
      
      let title = "Error";
      if (errorType === "network") {
        title = "Connection Error";
      } else if (errorType === "server") {
        title = "Server Error";
      } else if (errorType === "auth") {
        title = "Authentication Error";
      }
      
      toast({
        title,
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleRetryFailedMessage = () => {
    if (!failedMessage) return;
    
    chatMutation.mutate({
      message: failedMessage.content,
      activeAgents: failedMessage.activeAgents,
      conversationId: failedMessage.conversationId,
    });
  };

  const dismissFailedMessage = () => {
    setFailedMessage(null);
    setLocalMessages(prev => prev.filter(m => !m.id.startsWith("user-failed-")));
  };

  const toggleAgent = (agentId: AgentType) => {
    setSelectedAgents(prev =>
      prev.includes(agentId)
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  const handleMicToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleVoiceModeToggle = () => {
    setVoiceModeEnabled(prev => !prev);
    toast({
      title: voiceModeEnabled ? "Voice Mode Disabled" : "Voice Mode Enabled",
      description: voiceModeEnabled 
        ? "Responses will no longer be read aloud automatically" 
        : "Responses will be read aloud automatically",
    });
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

    if (isListening) {
      stopListening();
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
    stopAudio();
    setConversationId(null);
    setLocalMessages([]);
    setSelectedAgents([]);
  };

  const handleSelectConversation = async (id: string) => {
    stopAudio();
    setConversationId(id);
    setLocalMessages([]);
    const conv = conversations.find(c => c.id === id);
    if (conv) {
      setSelectedAgents(conv.activeAgents);
    }
  };

  const handleDeleteConversation = (id: string) => {
    deleteConversationMutation.mutate(id);
  };

  const getAgentInfo = (agentId: AgentType | undefined) => {
    return agents.find(a => a.id === agentId);
  };

  return (
    <div className="flex h-screen w-full">
      <ConversationSidebar
        conversations={conversations}
        isLoading={conversationsLoading}
        currentConversationId={conversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={startNewConversation}
        onDeleteConversation={handleDeleteConversation}
        agents={agents}
      />
      <div className="flex flex-col flex-1 min-w-0">
        <header className="border-b p-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <Building2 className="h-6 w-6 text-muted-foreground" />
              <div>
                <h1 className="text-xl font-bold" data-testid="text-title">Virtual Office</h1>
                <p className="text-xs text-muted-foreground" data-testid="text-subtitle">Chat with specialized AI agents</p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Button
                variant={voiceModeEnabled ? "default" : "outline"}
                size="icon"
                onClick={handleVoiceModeToggle}
                data-testid="button-voice-mode"
                className={`toggle-elevate ${voiceModeEnabled ? "toggle-elevated" : ""}`}
              >
                {voiceModeEnabled ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
              </Button>
              {user && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      {user.profileImageUrl ? (
                        <AvatarImage src={user.profileImageUrl} alt={user.firstName ?? "User"} />
                      ) : null}
                      <AvatarFallback className="bg-muted text-sm">
                        {user.firstName?.charAt(0)?.toUpperCase() ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium hidden sm:inline" data-testid="text-username">
                      {user.firstName ?? "User"}
                    </span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    asChild
                    data-testid="button-logout"
                  >
                    <a href="/api/logout">
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <aside className="w-72 border-r p-4 overflow-auto hidden md:block">
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
              {messagesLoading && conversationId ? (
                <div className="space-y-4 max-w-3xl mx-auto">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-20 flex-1" />
                    </div>
                  ))}
                </div>
              ) : localMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2" data-testid="text-welcome">Welcome to Virtual Office</h3>
                  <p className="text-muted-foreground max-w-md mb-4">
                    Select one or more AI agents from the panel, then start chatting. 
                    Each agent has their own specialty and will respond to your questions.
                  </p>
                  {speechSupported && (
                    <p className="text-sm text-muted-foreground mb-2">
                      Voice input is available - click the microphone button to speak
                    </p>
                  )}
                  {selectedAgents.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Select agents to begin
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4 max-w-3xl mx-auto">
                  {localMessages.map((msg) => {
                    const agent = msg.agentId ? getAgentInfo(msg.agentId) : null;
                    const IconComponent = agent ? iconMap[agent.avatar] || Users : null;
                    const isPlaying = playingAudioId === msg.id;
                    
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
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <p className="text-xs font-medium opacity-80">
                                {agent.name}
                              </p>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handlePlayAudio(msg.id, msg.content)}
                                disabled={ttsMutation.isPending && playingAudioId === msg.id}
                                data-testid={`button-play-audio-${msg.id}`}
                              >
                                {ttsMutation.isPending && playingAudioId === msg.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : isPlaying ? (
                                  <VolumeX className="h-3 w-3" />
                                ) : (
                                  <Volume2 className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
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
                      : isListening 
                        ? "Listening... Speak now"
                        : "Type your message... (Press Enter to send)"
                  }
                  className={`resize-none min-h-[60px] ${isListening ? "border-primary ring-1 ring-primary" : ""}`}
                  disabled={chatMutation.isPending}
                  data-testid="input-message"
                />
                {speechSupported && (
                  <Button
                    onClick={handleMicToggle}
                    disabled={chatMutation.isPending}
                    size="icon"
                    variant={isListening ? "default" : "ghost"}
                    className={`h-[60px] w-[60px] ${isListening ? "animate-pulse" : ""}`}
                    data-testid="button-mic"
                  >
                    {isListening ? (
                      <MicOff className="h-5 w-5" />
                    ) : (
                      <Mic className="h-5 w-5" />
                    )}
                  </Button>
                )}
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
                  {voiceModeEnabled && " (Voice mode enabled)"}
                </p>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default function VirtualOffice() {
  const sidebarStyle = {
    "--sidebar-width": "18rem",
    "--sidebar-width-icon": "3.5rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <VirtualOfficeContent />
    </SidebarProvider>
  );
}
