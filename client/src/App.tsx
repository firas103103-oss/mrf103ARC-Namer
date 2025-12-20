import * as React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuth } from "@/hooks/useAuth";
import CommandLogsView from "@/pages/virtual-office";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import SelfCheck from "@/pages/SelfCheck";
import NotFound from "@/pages/not-found";
import ARCCommandMetrics from "@/components/ARCCommandMetrics";
import ARCMonitor from "@/components/ARCMonitor";
import ARCVoiceSelector from "@/components/ARCVoiceSelector";
import VoiceChatRealtime from "@/components/VoiceChatRealtime";
import AgentVoicesPage from "@/pages/VirtualOffice";

function CommandLogsPage() {
  return <CommandLogsView />;
}

function SystemMonitorPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground" data-testid="text-page-title">System Monitor</h1>
        <p className="text-muted-foreground mt-1">Monitor system health and reflex events</p>
      </div>
      <ARCMonitor />
    </div>
  );
}

function VoiceChatPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground" data-testid="text-page-title">Voice Chat</h1>
        <p className="text-muted-foreground mt-1">Real-time voice communication with ARC agents</p>
      </div>
      <VoiceChatRealtime />
    </div>
  );
}

function VoiceSelectorPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground" data-testid="text-page-title">Voice Selector</h1>
        <p className="text-muted-foreground mt-1">Choose your preferred AI voice</p>
      </div>
      <ARCVoiceSelector />
    </div>
  );
}

function MetricsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground" data-testid="text-page-title">Metrics</h1>
        <p className="text-muted-foreground mt-1">Command performance analytics</p>
      </div>
      <ARCCommandMetrics />
    </div>
  );
}

function AuthenticatedLayout() {
  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center gap-2 p-3 border-b border-border bg-card/50">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <span className="text-sm text-muted-foreground">ARC Command Center</span>
          </header>
          <main className="flex-1 overflow-auto">
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/command-logs" component={CommandLogsPage} />
              <Route path="/system-monitor" component={SystemMonitorPage} />
              <Route path="/voice-chat" component={VoiceChatPage} />
              <Route path="/voice-selector" component={VoiceSelectorPage} />
              <Route path="/agent-voices" component={AgentVoicesPage} />
              <Route path="/self-check" component={SelfCheck} />
              <Route path="/metrics" component={MetricsPage} />
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" data-testid="status-loading">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Landing />;
  }

  return <AuthenticatedLayout />;
}

function App() {
  React.useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
