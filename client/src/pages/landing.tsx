import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  Shield, 
  LogIn, 
  Activity, 
  Users, 
  Brain, 
  Lock,
  Radio,
  Eye,
  Server,
  Cpu
} from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col bg-grid-pattern">
      <header className="command-bar sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-6 h-14">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Shield className="h-8 w-8 text-primary" />
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-secondary rounded-full animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-display text-foreground" data-testid="text-logo">
                ARC INTELLIGENCE
              </span>
              <span className="text-[10px] text-muted-foreground tracking-widest uppercase">
                Cyber Defense Command
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2">
              <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/30" data-testid="badge-system-online">
                <Activity className="w-3 h-3 mr-1" />
                System Online
              </Badge>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30" data-testid="badge-secure">
                <Lock className="w-3 h-3 mr-1" />
                Secure
              </Badge>
            </div>
            <Button asChild data-testid="button-header-login">
              <a href="/api/login">
                <LogIn className="h-4 w-4 mr-2" />
                Access Portal
              </a>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <section className="relative py-20 md:py-32 px-6">
          <div className="absolute inset-0 bg-circuit-pattern opacity-50" />
          <div className="relative max-w-5xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-muted/50 border border-border">
              <Radio className="w-4 h-4 text-secondary animate-pulse" />
              <span className="text-sm text-muted-foreground">Multi-Agent Intelligence Framework v2.0</span>
            </div>
            
            <h1 
              className="enterprise-title text-4xl md:text-6xl lg:text-7xl text-foreground"
              data-testid="text-hero-title"
            >
              ARC Intelligence
              <span className="block text-gradient-blue">Command Center</span>
            </h1>
            
            <p 
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
              data-testid="text-hero-subtitle"
            >
              Enterprise-grade AI orchestration platform. Deploy, monitor, and coordinate 
              specialized AI agents across your organization with real-time threat intelligence 
              and operational awareness.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button 
                size="lg" 
                asChild
                className="min-w-[200px]"
                data-testid="button-login"
              >
                <a href="/api/login">
                  <Shield className="h-5 w-5 mr-2" />
                  Enter Command Center
                </a>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="min-w-[200px]"
                data-testid="button-learn-more"
              >
                <Eye className="h-5 w-5 mr-2" />
                View Capabilities
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16 px-6 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-display text-foreground mb-3" data-testid="text-section-title">
                Operational Capabilities
              </h2>
              <p className="text-muted-foreground">
                Mission-critical features for enterprise AI coordination
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
                      Multi-Agent Fleet
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Deploy specialized AI agents for operations, communications, 
                      intelligence, and executive functions
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
