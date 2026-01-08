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
// New pages - previously unused
const AnalyticsHub = lazy(() => import("@/pages/AnalyticsHub"));
const SystemArchitecture = lazy(() => import("@/pages/SystemArchitecture"));
const InvestigationLounge = lazy(() => import("@/pages/InvestigationLounge"));
const OperationsSimulator = lazy(() => import("@/pages/OperationsSimulator"));
const QuantumWarRoom = lazy(() => import("@/pages/QuantumWarRoom"));
const TemporalAnomalyLab = lazy(() => import("@/pages/TemporalAnomalyLab"));
const SelfCheck = lazy(() => import("@/pages/SelfCheck"));
const Home = lazy(() => import("@/pages/Home"));

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
        <Route path="/">
          <Redirect to="/virtual-office" />
        </Route>
        <Route path="/auth" component={OperatorLogin} />
        <Route path="/virtual-office" component={VirtualOffice} />
        <Route path="/bio-sentinel" component={BioSentinel} />
        <Route path="/command-center" component={TeamCommandCenter} />
        <Route path="/admin" component={AdminControlPanel} />
        <Route path="/master-agent" component={MasterAgentCommand} />
        <Route path="/growth-roadmap" component={GrowthRoadmap} />
        <Route path="/cloning" component={Cloning} />
        {/* New routes */}
        <Route path="/profile" component={Home} />
        <Route path="/analytics" component={AnalyticsHub} />
        <Route path="/architecture" component={SystemArchitecture} />
        <Route path="/investigation" component={InvestigationLounge} />
        <Route path="/simulator" component={OperationsSimulator} />
        <Route path="/war-room" component={QuantumWarRoom} />
        <Route path="/anomaly-lab" component={TemporalAnomalyLab} />
        <Route path="/self-check" component={SelfCheck} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router />
        <Toaster />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
                                                                                                                                                                              
