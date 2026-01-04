import * as React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import CommandLogsView from "@/pages/virtual-office";
import Landing from "@/pages/landing";
import MatrixLogin from "@/pages/MatrixLogin";
import Dashboard from "@/pages/dashboard";
import Home from "@/pages/Home";
import SelfCheck from "@/pages/SelfCheck";
import NotFound from "@/pages/not-found";
import ARCCommandMetrics from "@/components/ARCCommandMetrics";
import ARCMonitor from "@/components/ARCMonitor";
import ARCVoiceSelector from "@/components/ARCVoiceSelector";
import VoiceChatRealtime from "@/components/VoiceChatRealtime";
import AgentVoicesPage from "@/pages/VirtualOffice";
import InvestigationLounge from "@/pages/InvestigationLounge";
import QuantumWarRoom from "@/pages/QuantumWarRoom";
import TemporalAnomalyLab from "@/pages/TemporalAnomalyLab";
import BioSentinel from "@/pages/BioSentinel";
import TeamCommandCenter from "@/pages/TeamCommandCenter";
import OperationsSimulator from "@/pages/OperationsSimulator";
import AnalyticsHub from "@/pages/AnalyticsHub";
import SystemArchitecture from "@/pages/SystemArchitecture";
import { Shield, Activity, Lock } from "lucide-react";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useTranslation } from "react-i18next";
import OperatorLogin from "@/components/OperatorLogin";

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
  const { t } = useTranslation();
  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="command-bar flex items-center justify-between gap-4 px-4 h-14">
            <div className="flex items-center gap-3">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="font-display text-sm text-foreground hidden sm:inline">{t('header.arcCommandCenter')}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/30 text-[10px]" data-testid="badge-online-status">
                <Activity className="w-3 h-3 ltr:mr-1 rtl:ml-1" />
                {t('common.online')}
              </Badge>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-[10px]" data-testid="badge-secure-status">
                <Lock className="w-3 h-3 ltr:mr-1 rtl:ml-1" />
                {t('common.secure')}
              </Badge>
              <LanguageToggle />
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/home" component={Home} />
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/command-logs" component={CommandLogsPage} />
              <Route path="/system-monitor" component={SystemMonitorPage} />
              <Route path="/voice-chat" component={VoiceChatPage} />
              <Route path="/voice-selector" component={VoiceSelectorPage} />
              <Route path="/agent-voices" component={AgentVoicesPage} />
              <Route path="/self-check" component={SelfCheck} />
              <Route path="/metrics" component={MetricsPage} />
              <Route path="/investigation-lounge" component={InvestigationLounge} />
              <Route path="/quantum-warroom" component={QuantumWarRoom} />
              <Route path="/temporal-anomaly-lab" component={TemporalAnomalyLab} />
              <Route path="/bio-sentinel" component={BioSentinel} />
              <Route path="/team-command" component={TeamCommandCenter} />
              <Route path="/operations-simulator" component={OperationsSimulator} />
              <Route path="/analytics" component={AnalyticsHub} />
              <Route path="/system-architecture" component={SystemArchitecture} />
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
    return <MatrixLogin />;
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
