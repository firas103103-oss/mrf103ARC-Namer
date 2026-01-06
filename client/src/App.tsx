import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { OperatorLogin } from "@/components/OperatorLogin";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { lazy, Suspense } from "react";

// Lazy load heavy components
const NotFound = lazy(() => import("@/pages/not-found"));
const LandingPage = lazy(() => import("@/pages/landing"));
const VirtualOffice = lazy(() => import("@/pages/VirtualOffice"));
const BioSentinel = lazy(() => import("@/pages/BioSentinel"));
const TeamCommandCenter = lazy(() => import("@/pages/TeamCommandCenter"));
const AdminControlPanel = lazy(() => import("@/pages/AdminControlPanel"));
const MasterAgentCommand = lazy(() => import("@/pages/MasterAgentCommand"));
const GrowthRoadmap = lazy(() => import("@/pages/GrowthRoadmap"));
const Cloning = lazy(() => import("@/pages/Cloning"));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-black text-green-500">
    <Loader2 className="h-8 w-8 animate-spin" />
    <span className="ml-2 font-mono">LOADING...</span>
  </div>
);

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingFallback />;
  }

  // إذا لم يسجل الدخول، أظهر صفحة الهبوط أو تسجيل الدخول فقط
  if (!user) {
    return (
      <Suspense fallback={<LoadingFallback />}>
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
    <Suspense fallback={<LoadingFallback />}>
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/auth" component={OperatorLogin} />
        <Route path="/virtual-office" component={VirtualOffice} />
        <Route path="/bio-sentinel" component={BioSentinel} />
        <Route path="/command-center" component={TeamCommandCenter} />
        <Route path="/admin" component={AdminControlPanel} />
        <Route path="/master-agent" component={MasterAgentCommand} />
        <Route path="/growth-roadmap" component={GrowthRoadmap} />
        <Route path="/cloning" component={Cloning} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

                                                                                                                                                      function App() {
                                                                                                                                                        return (
                                                                                                                                                            <QueryClientProvider client={queryClient}>
                                                                                                                                                                  <Router />
                                                                                                                                                                        <Toaster />
                                                                                                                                                                            </QueryClientProvider>
                                                                                                                                                                              );
                                                                                                                                                                              }

                                                                                                                                                                              export default App;
                                                                                                                                                                              
