import { Link } from "wouter";
import { 
  Shield, Activity, Globe, Cpu, Database, 
  Users, Zap, Radio, Search, Terminal, Settings 
} from "lucide-react";

export default function Home() {
  const domains = [
    { name: "ARC 2.0", icon: Cpu, path: "/mrf", color: "text-primary", desc: "AI Orchestration Core" },
    { name: "Maestros", icon: Users, path: "/maestros", color: "text-secondary", desc: "Strategic Command" },
    { name: "Security", icon: Shield, path: "/security", color: "text-destructive", desc: "Cipher Defense Grid" },
    { name: "Finance", icon: Database, path: "/finance", color: "text-success", desc: "Vault Asset Manager" },
    { name: "Ops & War", icon: Globe, path: "/ops", color: "text-warning", desc: "Global Operations" },
    { name: "Bio-Sentinel", icon: Radio, path: "/bio-sentinel", color: "text-success", desc: "IoT Sensor Network" },
    { name: "Analytics", icon: Activity, path: "/analytics", color: "text-primary", desc: "Data Intelligence" },
    { name: "Dev Portal", icon: Terminal, path: "/system-architecture", color: "text-warning", desc: "System Internals" },
    { name: "Investigations", icon: Search, path: "/investigation-lounge", color: "text-accent", desc: "Deep Trace Labs" },
    { name: "Admin", icon: Settings, path: "/admin", color: "text-muted-foreground", desc: "System Control" },
    { name: "Cloning", icon: Zap, path: "/cloning", color: "text-secondary", desc: "Digital Replication" },
    { name: "Chat", icon: Terminal, path: "/chat", color: "text-white", desc: "Direct Uplink" },
  ];

  return (
    <div className="min-h-screen p-6 md:p-12 relative z-10 flex flex-col items-center">
      {/* HUD Header */}
      <header className="w-full max-w-7xl mb-12 flex justify-between items-end border-b border-white/10 pb-6">
        <div>
          <h1 className="text-5xl md:text-7xl font-bold font-sans tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50 mb-2">
            SYSTEM <span className="text-primary text-glow">OVERVIEW</span>
          </h1>
          <p className="text-primary/60 font-mono tracking-[0.3em] uppercase text-sm">
            Command Level: Alpha // Status: Green
          </p>
        </div>
        <div className="text-right hidden md:block">
          <div className="text-4xl font-mono font-bold text-white/20">MRF-103</div>
        </div>
      </header>

      {/* Grid System */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full max-w-7xl">
        {domains.map((domain) => (
          <Link key={domain.name} href={domain.path}>
            <div className="group relative h-48 cursor-pointer overflow-hidden">
              {/* Card Container */}
              <div className="absolute inset-0 glass hover:bg-white/5 transition-all duration-300 hud-border flex flex-col justify-between p-6">
                
                {/* Header */}
                <div className="flex justify-between items-start">
                  <domain.icon className={`w-8 h-8 ${domain.color} drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]`} />
                  <span className="text-[10px] font-mono text-white/30 group-hover:text-primary transition-colors">
                    ACCESS &gt;&gt;
                  </span>
                </div>

                {/* Content */}
                <div>
                  <h3 className="text-2xl font-bold font-sans text-white group-hover:text-primary transition-colors tracking-wide">
                    {domain.name}
                  </h3>
                  <p className="text-xs text-white/50 font-mono mt-1 group-hover:text-white/80 transition-colors uppercase">
                    {domain.desc}
                  </p>
                </div>

                {/* Hover Effect Line */}
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-500 ease-out" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Status Footer */}
      <footer className="mt-20 w-full max-w-7xl border-t border-white/5 pt-6 flex justify-between items-center text-xs font-mono text-white/30">
        <div className="flex gap-6">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" /> NET: SECURE
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse delay-75" /> DB: CONNECTED
          </span>
        </div>
        <div>SESSION_ID: {Math.random().toString(36).substring(7).toUpperCase()}</div>
      </footer>
    </div>
  );
}
                    AI Analysis
                  </span>
                </div>
              </div>
            </div>
            <Button asChild data-testid="button-open-bio-sentinel">
              <Link href="/bio-sentinel">
                {t("landing.viewCapabilities")}
                <ArrowRight className="h-4 w-4 ltr:ml-2 rtl:mr-2" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-display font-semibold text-foreground mb-4" data-testid="text-quick-access">
          {t("landing.operationalCapabilities")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickAccessCards.map((card, index) => (
            <Link key={index} href={card.href} data-testid={`link-quick-access-${card.href.replace('/', '')}`}>
              <Card 
                className="h-full cursor-pointer transition-all duration-200 hover-elevate bg-card/50 border-border"
                data-testid={`card-quick-access-${index}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className={`p-2 rounded-md bg-muted ${card.color}`}>
                      <card.icon className="h-5 w-5" />
                    </div>
                    {card.badge && (
                      <Badge variant="outline" className="text-[10px] bg-muted/50">
                        {card.badge}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-base mt-3">{t(card.titleKey)}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-sm">
                    {t(card.descriptionKey)}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <Card className="bg-muted/30" data-testid="card-agent-fleet">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">{t("landing.multiAgentFleet")}</CardTitle>
          </div>
          <CardDescription>{t("landing.multiAgentFleetDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {[
              { name: "Mr.F", role: "Executive", status: "active" },
              { name: "L0-Ops", role: "Operations", status: "active" },
              { name: "L0-Comms", role: "Communications", status: "active" },
              { name: "L0-Intel", role: "Intelligence", status: "active" },
              { name: "Alex Vision", role: "Photography", status: "standby" },
              { name: "Diana Grant", role: "Grants", status: "standby" },
              { name: "Marcus Law", role: "Legal", status: "standby" },
              { name: "Sarah Numbers", role: "Finance", status: "active" },
              { name: "Jordan Spark", role: "Creative", status: "active" },
              { name: "Dr. Maya Quest", role: "Research", status: "active" },
            ].map((agent, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 rounded-md bg-card/50 border border-border"
                data-testid={`agent-${agent.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <Brain className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div
                    className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-card ${
                      agent.status === "active" ? "bg-secondary" : "bg-muted-foreground"
                    }`}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground truncate">{agent.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{agent.role}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-chart-3/20 bg-gradient-to-r from-chart-3/5 to-primary/5" data-testid="card-android-download">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-4 rounded-md bg-chart-3/10 border border-chart-3/20">
                <Smartphone className="h-8 w-8 text-chart-3" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-display font-semibold text-foreground">
                    {t("landing.androidApp") || "Android App"}
                  </h2>
                  <Badge variant="outline" className="bg-chart-3/10 text-chart-3 border-chart-3/30 text-[10px]">
                    Capacitor
                  </Badge>
                </div>
                <p className="text-muted-foreground max-w-md">
                  {t("landing.androidAppDesc") || "Download the Android project to build and install the ARC Intelligence app on your mobile device."}
                </p>
              </div>
            </div>
            <Button asChild data-testid="button-download-android">
              <a href="/api/android/download" download>
                <Download className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                {t("common.download") || "Download"}
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
