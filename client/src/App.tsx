import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import VirtualOffice from "@/pages/VirtualOffice";
import BioSentinel from "@/pages/BioSentinel";
import TeamCommandCenter from "@/pages/TeamCommandCenter";
import { OperatorLogin } from "@/components/OperatorLogin";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

function Router() {
  const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
              <div className="flex items-center justify-center min-h-screen bg-black text-green-500">
                      <Loader2 className="h-8 w-8 animate-spin" />
                              <span className="ml-2 font-mono">LOADING SYSTEM...</span>
                                    </div>
                                        );
                                          }

                                            // إذا لم يسجل الدخول، أظهر صفحة الهبوط أو تسجيل الدخول فقط
                                              if (!user) {
                                                  return (
                                                        <Switch>
                                                                <Route path="/auth" component={OperatorLogin} />
                                                                        <Route path="/" component={LandingPage} />
                                                                                {/* أي رابط آخر يوجه لصفحة الهبوط للحماية */}
                                                                                        <Route component={LandingPage} />
                                                                                              </Switch>
                                                                                                  );
                                                                                                    }

                                                                                                      // إذا سجل الدخول، افتح له كل الصفحات
                                                                                                        return (
                                                                                                            <Switch>
                                                                                                                  <Route path="/" component={LandingPage} />
                                                                                                                        <Route path="/auth" component={OperatorLogin} />
                                                                                                                              <Route path="/virtual-office" component={VirtualOffice} />
                                                                                                                                    <Route path="/bio-sentinel" component={BioSentinel} />
                                                                                                                                          <Route path="/command-center" component={TeamCommandCenter} />
                                                                                                                                                <Route component={NotFound} />
                                                                                                                                                    </Switch>
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
                                                                                                                                                                              
