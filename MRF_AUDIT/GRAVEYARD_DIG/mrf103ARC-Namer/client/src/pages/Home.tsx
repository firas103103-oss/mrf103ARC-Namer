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
