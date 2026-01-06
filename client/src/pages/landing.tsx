import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useState } from "react";
import { 
  Shield, 
  LogIn, 
  Activity, 
  Brain, 
  Lock,
  Fingerprint,
  KeyRound,
  Terminal,
  Zap,
  Globe,
  Sparkles
} from "lucide-react";

export default function Landing() {
  const { t } = useTranslation();
  const [showAuth, setShowAuth] = useState(false);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Matrix Background - Very Light */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="matrix-rain h-full w-full"></div>
      </div>

      {/* Gradient Overlays */}
      <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-purple-500/5 via-transparent to-transparent blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-radial from-blue-500/3 via-transparent to-transparent blur-3xl"></div>

      {/* Lock Animation Overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
        <Lock className="w-[800px] h-[800px] text-cyan-400 animate-pulse" strokeWidth={0.5} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Minimal Header */}
        <header className="absolute top-0 left-0 right-0 z-50 py-4 px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity">
              <div className="relative">
                <Shield className="h-6 w-6 text-cyan-400" strokeWidth={1.5} />
                <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
              </div>
            </div>
            <LanguageToggle />
          </div>
        </header>

        {/* Center Content */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-md space-y-8">
            {!showAuth ? (
              /* Initial State - Locked Portal */
              <div className="text-center space-y-8 animate-fade-in">
                {/* Lock Icon */}
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full animate-pulse"></div>
                    <div className="relative p-8 rounded-full border border-cyan-500/20 bg-black/50 backdrop-blur-sm">
                      <Lock className="w-16 h-16 text-cyan-400" strokeWidth={1.5} />
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-3">
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                    <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                      SECURE ACCESS
                    </span>
                  </h1>
                  <p className="text-sm text-zinc-500 font-mono">
                    CLASSIFIED SYSTEM • AUTHORIZED PERSONNEL ONLY
                  </p>
                </div>

                {/* Access Button */}
                <Button
                  onClick={() => setShowAuth(true)}
                  className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0 shadow-lg shadow-cyan-500/20 transition-all duration-300"
                  data-testid="button-unlock"
                >
                  <KeyRound className="w-5 h-5 mr-2" />
                  UNLOCK PORTAL
                </Button>
              </div>
            ) : (
              /* Auth Form - After Unlock */
              <div className="space-y-6 animate-slide-up">
                {/* Header */}
                <div className="text-center space-y-2">
                  <div className="flex justify-center mb-4">
                    <Fingerprint className="w-12 h-12 text-cyan-400 animate-pulse" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Authentication Required</h2>
                  <p className="text-sm text-zinc-500">Enter your credentials to proceed</p>
                </div>

                {/* Form */}
                <Card className="p-6 bg-zinc-900/50 border-zinc-800 backdrop-blur-sm space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-400 uppercase tracking-wider">Access ID</label>
                    <Input
                      type="email"
                      placeholder="agent@mrf.secure"
                      className="bg-black/50 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-cyan-500/50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-400 uppercase tracking-wider">Security Key</label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="bg-black/50 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-cyan-500/50"
                    />
                  </div>

                  <Button
                    asChild
                    className="w-full h-11 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0"
                    data-testid="button-login"
                  >
                    <a href="/api/login">
                      <LogIn className="w-4 h-4 mr-2" />
                      AUTHENTICATE
                    </a>
                  </Button>

                  <div className="flex items-center justify-between text-xs">
                    <button className="text-cyan-400 hover:text-cyan-300 transition-colors">
                      Forgot credentials?
                    </button>
                    <button className="text-zinc-500 hover:text-zinc-400 transition-colors">
                      Request access
                    </button>
                  </div>
                </Card>

                {/* Security Badge */}
                <div className="flex items-center justify-center gap-2 text-xs text-zinc-600">
                  <Shield className="w-3 h-3" />
                  <span>256-bit encryption • Zero-knowledge architecture</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="absolute bottom-0 left-0 right-0 py-6 px-6">
          <div className="flex flex-col items-center gap-3">
            {/* Logo */}
            <div className="flex flex-col items-center gap-1">
              <div className="text-2xl font-bold tracking-tighter">
                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  MRF
                </span>
              </div>
              <div className="h-px w-16 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
              <p className="text-[10px] text-zinc-600 tracking-widest uppercase">
                Multi-Agent Research Framework
              </p>
            </div>

            {/* Status Indicators */}
            <div className="flex items-center gap-4 text-[10px]">
              <div className="flex items-center gap-1.5 text-zinc-600">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div>
                <span>SYSTEM ACTIVE</span>
              </div>
              <div className="w-px h-3 bg-zinc-800"></div>
              <div className="flex items-center gap-1.5 text-zinc-600">
                <Globe className="w-3 h-3" />
                <span>SECURE CONNECTION</span>
              </div>
              <div className="w-px h-3 bg-zinc-800"></div>
              <div className="flex items-center gap-1.5 text-zinc-600">
                <Terminal className="w-3 h-3" />
                <span>v2.0.0</span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,255,255,0.01)_50%)] bg-[length:100%_4px] animate-scanline"></div>

      <style jsx>{`
        @keyframes matrix-fall {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scanline {
          0% { background-position: 0 0; }
          100% { background-position: 0 100%; }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.4s ease-out;
        }
        .animate-scanline {
          animation: scanline 8s linear infinite;
        }
        .matrix-rain {
          background-image: 
            linear-gradient(transparent 0%, rgba(0, 255, 255, 0.1) 50%, transparent 100%),
            repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(0, 255, 255, 0.03) 2px, transparent 3px);
          animation: matrix-fall 20s linear infinite;
        }
      `}</style>
    </div>
  );
}

      <main className="flex-1 flex flex-col">
        <section className="relative py-20 md:py-32 px-6">
          <div className="absolute inset-0 bg-circuit-pattern opacity-50" />
          <div className="relative max-w-5xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-muted/50 border border-border">
              <Radio className="w-4 h-4 text-secondary animate-pulse" />
              <span className="text-sm text-muted-foreground">{t('landing.multiAgentFramework')}</span>
            </div>
            
            <h1 
              className="enterprise-title text-4xl md:text-6xl lg:text-7xl text-foreground"
              data-testid="text-hero-title"
            >
              {t('landing.title')}
              <span className="block text-gradient-blue">{t('landing.subtitle')}</span>
            </h1>
            
            <p 
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
              data-testid="text-hero-subtitle"
            >
              {t('landing.description')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button 
                size="lg" 
                asChild
                className="min-w-[200px]"
                data-testid="button-login"
              >
                <a href="/api/login">
                  <Shield className="h-5 w-5 ltr:mr-2 rtl:ml-2" />
                  {t('landing.enterCommandCenter')}
                </a>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="min-w-[200px]"
                asChild
              >
                <a href="/cloning">
                  <Cpu className="h-5 w-5 ltr:mr-2 rtl:ml-2" />
                  نظام الاستنساخ
                </a>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="min-w-[200px]"
                data-testid="button-learn-more"
              >
                <Eye className="h-5 w-5 ltr:mr-2 rtl:ml-2" />
                {t('landing.viewCapabilities')}
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16 px-6 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-display text-foreground mb-3" data-testid="text-section-title">
                {t('landing.operationalCapabilities')}
              </h2>
              <p className="text-muted-foreground">
                {t('landing.missionCriticalFeatures')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="p-6 bg-card/50 border-border">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-md bg-primary/10 border border-primary/20">
                    <Brain className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1" data-testid="text-feature-agents">
                      {t('landing.multiAgentFleet')}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t('landing.multiAgentFleetDesc')}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-card/50 border-border">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-md bg-secondary/10 border border-secondary/20">
                    <Activity className="h-6 w-6 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1" data-testid="text-feature-monitoring">
                      Real-Time Monitoring
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Live dashboards with terminal heartbeat, event timelines, 
                      and system health metrics
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-card/50 border-border">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-md bg-chart-4/10 border border-chart-4/20">
                    <Radio className="h-6 w-6 text-chart-4" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1" data-testid="text-feature-voice">
                      Voice Integration
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      ElevenLabs-powered voice synthesis for natural agent 
                      communication and briefings
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-card/50 border-border">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                    <Eye className="h-6 w-6 text-destructive" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1" data-testid="text-feature-investigation">
                      Investigation Tools
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Agent investigation lounge with activity tracking, 
                      profile analysis, and HR analytics
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-card/50 border-border">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-md bg-primary/10 border border-primary/20">
                    <Server className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1" data-testid="text-feature-automation">
                      n8n Automation
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Seamless webhook integration with n8n for workflow 
                      automation and external system coordination
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-card/50 border-border">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-md bg-secondary/10 border border-secondary/20">
                    <Cpu className="h-6 w-6 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1" data-testid="text-feature-quantum">
                      Strategy Simulation
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Quantum WarRoom for scenario planning with Monte Carlo 
                      forecasts and decision trees
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-display text-foreground mb-3" data-testid="text-agents-title">
                Agent Fleet Overview
              </h2>
              <p className="text-muted-foreground">
                Six specialized AI agents ready for deployment
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: "Mr.F", role: "Executive Orchestrator", status: "active" },
                { name: "L0-Ops", role: "Operations Lead", status: "active" },
                { name: "L0-Comms", role: "Communications", status: "active" },
                { name: "L0-Intel", role: "Intelligence Analyst", status: "active" },
                { name: "Dr. Maya Quest", role: "Research Director", status: "standby" },
                { name: "Jordan Spark", role: "Creative Lead", status: "standby" },
              ].map((agent) => (
                <div 
                  key={agent.name}
                  className="flex items-center gap-3 p-4 rounded-md bg-card/50 border border-border"
                  data-testid={`agent-card-${agent.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <div className="relative">
                    <Users className="h-8 w-8 text-muted-foreground" />
                    <div className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${
                      agent.status === 'active' ? 'bg-secondary' : 'bg-muted-foreground'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground truncate">{agent.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{agent.role}</div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-[10px] ${
                      agent.status === 'active' 
                        ? 'bg-secondary/10 text-secondary border-secondary/30' 
                        : 'bg-muted text-muted-foreground border-border'
                    }`}
                  >
                    {agent.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-6 px-6 bg-muted/20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span data-testid="text-footer">ARC Intelligence Framework v2.0</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Cyber Defense Command</span>
            <span>|</span>
            <span>Enterprise AI Orchestration</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
