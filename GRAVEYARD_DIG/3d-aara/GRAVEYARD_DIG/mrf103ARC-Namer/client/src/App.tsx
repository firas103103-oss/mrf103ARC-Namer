import { Switch, Route, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { OperatorLogin } from "@/components/OperatorLogin";
import { useAuth } from "@/hooks/useAuth";
import { lazy, Suspense } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { EnhancedLoadingFallback } from "@/components/EnhancedLoadingFallback";

// Lazy load heavy components
const NotFound = lazy(() => import("@/pages/not-found"));
const LandingPage = lazy(() => import("@/pages/landing"));
const VirtualOffice = lazy(() => import("@/pages/virtual-office"));
const BioSentinel = lazy(() => import("@/pages/BioSentinel"));
const TeamCommandCenter = lazy(() => import("@/pages/TeamCommandCenter"));
const AdminControlPanel = lazy(() => import("@/pages/AdminControlPanel"));
const MasterAgentCommand = lazy(() => import("@/pages/MasterAgentCommand"));
const GrowthRoadmap = lazy(() => import("@/pages/GrowthRoadmap"));
const Cloning = lazy(() => import("@/pages/Cloning"));
// Old pages
const AnalyticsHub = lazy(() => import("@/pages/AnalyticsHub"));
const SystemArchitecture = lazy(() => import("@/pages/SystemArchitecture"));
const InvestigationLounge = lazy(() => import("@/pages/InvestigationLounge"));
const OperationsSimulator = lazy(() => import("@/pages/OperationsSimulator"));
const QuantumWarRoom = lazy(() => import("@/pages/QuantumWarRoom"));
const TemporalAnomalyLab = lazy(() => import("@/pages/TemporalAnomalyLab"));
const SelfCheck = lazy(() => import("@/pages/SelfCheck"));
const Home = lazy(() => import("@/pages/Home"));

// New ARC 2.0 Pages - 31 Agent Hierarchy
const MRFDashboard = lazy(() => import("@/pages/MRFDashboard"));
const MaestrosHub = lazy(() => import("@/pages/MaestrosHub"));
const SecurityCenter = lazy(() => import("@/pages/SecurityCenter"));
const FinanceHub = lazy(() => import("@/pages/FinanceHub"));
const LegalArchive = lazy(() => import("@/pages/LegalArchive"));
const LifeManager = lazy(() => import("@/pages/LifeManager"));
const RnDLab = lazy(() => import("@/pages/RnDLab"));
const XBioSentinel = lazy(() => import("@/pages/XBioSentinel"));
const ReportsCenter = lazy(() => import("@/pages/ReportsCenter"));
const Settings = lazy(() => import("@/pages/Settings"));
const Integrations = lazy(() => import("@/pages/Integrations"));
const AgentChat = lazy(() => import("@/pages/AgentChat"));

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <EnhancedLoadingFallback timeout={15000} />;
  }

  // إذا لم يسجل الدخول، أظهر صفحة الهبوط أو تسجيل الدخول فقط
  if (!user) {
    return (
      <Suspense fallback={<EnhancedLoadingFallback timeout={10000} />}>
        <Switch>
          <Route path="/auth" component={OperatorLogin} />
          <Route path="/" component={LandingPage} />
          <Route path="/cloning" component={Cloning} />
          {/* أي رابط آخر يوجه لصفحة الهبوط للحماية */}
          <Route component={LandingPage} />
        </Switch>
      </Suspense>
    );
  }

  // إذا سجل الدخول، افتح له كل الصفحات
  return (
    <Suspense fallback={<EnhancedLoadingFallback timeout={10000} />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/auth" component={OperatorLogin} />
        
        {/* ARC 2.0 - New 31-Agent Hierarchy Pages */}
        <Route path="/mrf" component={MRFDashboard} />
        <Route path="/maestros" component={MaestrosHub} />
        <Route path="/security" component={SecurityCenter} />
        <Route path="/finance" component={FinanceHub} />
        <Route path="/legal" component={LegalArchive} />
        <Route path="/life" component={LifeManager} />
        <Route path="/rnd" component={RnDLab} />
        <Route path="/xbio" component={XBioSentinel} />
        <Route path="/reports" component={ReportsCenter} />
        <Route path="/settings" component={Settings} />
        <Route path="/integrations" component={Integrations} />
        <Route path="/chat" component={AgentChat} />

        {/* Old Pages - Legacy */}
        <Route path="/dashboard" component={VirtualOffice} />
        <Route path="/bio-sentinel" component={BioSentinel} />
        <Route path="/team-command" component={TeamCommandCenter} />
        <Route path="/admin" component={AdminControlPanel} />
        <Route path="/master-agent" component={MasterAgentCommand} />
        <Route path="/growth-roadmap" component={GrowthRoadmap} />
        <Route path="/cloning" component={Cloning} />
        <Route path="/analytics" component={AnalyticsHub} />
        <Route path="/system-architecture" component={SystemArchitecture} />
        <Route path="/investigation-lounge" component={InvestigationLounge} />
        <Route path="/operations-simulator" component={OperationsSimulator} />
        <Route path="/quantum-warroom" component={QuantumWarRoom} />
        <Route path="/temporal-anomaly-lab" component={TemporalAnomalyLab} />
        <Route path="/self-check" component={SelfCheck} />
        {/* Keep virtual-office as alias for dashboard */}
        <Route path="/virtual-office" component={VirtualOffice} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <div className="stellar-scanlines" />
        <div className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-primary selection:text-black">
          <Router />
          <Toaster />
        </div>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;
                                                                                                                                                                              
