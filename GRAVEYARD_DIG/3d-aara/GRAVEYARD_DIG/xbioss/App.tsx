
import React, { useState, useEffect } from 'react';
import { PATENTS, TEAM, TECH_SPECS } from './constants';
import TerminalLoader from './components/TerminalLoader';
import PatentCard from './components/PatentCard';
import LiveMonitor from './components/LiveMonitor';
import AIGuidance from './components/AIGuidance';
import { 
  Shield, 
  MapPin, 
  Cpu, 
  Zap,
  Info,
  ShieldCheck,
  Hexagon,
  ArrowRight,
  ChevronRight,
  Terminal,
  AlertTriangle
} from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<'boot' | 'guidance' | 'active'>('boot');
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'inventions' | 'hierarchy'>('overview');
  const [logs, setLogs] = useState<string[]>([]);
  const isRTL = lang === 'ar';

  useEffect(() => {
    if (appState !== 'active') return;
    const messages = [
      "Secure Channel Linked", 
      "Riyadh Node: 100% Operational", 
      "Encryption: AES-256 Quantum-Ready", 
      "ZLK-00 Kernel Synchronized", 
      "Veto Protocol: Verified"
    ];
    const interval = setInterval(() => {
      const msg = messages[Math.floor(Math.random() * messages.length)];
      setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 5));
    }, 4000);
    return () => clearInterval(interval);
  }, [appState]);

  if (appState === 'boot') return <TerminalLoader onComplete={() => setAppState('guidance')} lang={lang} />;
  if (appState === 'guidance') return <AIGuidance onComplete={() => setAppState('active')} lang={lang} setLang={setLang} />;

  const t = {
    en: {
      tabs: { overview: 'BRIEFING // OVERVIEW', specs: 'CORE // SPECS', inventions: 'SOVEREIGN // INVENTIONS', hierarchy: 'PERSONA // HIERARCHY' },
      hero: { title: 'X-BIO SENTINEL', subtitle: 'CLASS-7 AUTONOMOUS DEFENSE BRIEFING', location: 'RIYADH HQ // SECTOR 1' },
      overview: { 
        header: "TACTICAL ASSESSMENT",
        mission: "X-Bio Sentinel represents the pinnacle of Saudi-born defense technology. Our mission is the creation of a 'Sovereign Cognitive Node'—an entity that doesn't just monitor, but understands and reacts to physical and metaphysical anomalies with absolute autonomy.",
        localTitle: "100% LOCALIZED INTELLIGENCE",
        localDesc: "Every line of code, every circuit path, and every logic gate was architected in Riyadh, KSA. We own the full stack of our defense future."
      }
    },
    ar: {
      tabs: { overview: 'الإيجاز // نظرة عامة', specs: 'الجوهر // المواصفات', inventions: 'السيادة // الابتكارات', hierarchy: 'الهوية // التسلسل' },
      hero: { title: 'إكس-بيو سنتينل', subtitle: 'إيجاز دفاعي مستقل من الفئة-7', location: 'مقر الرياض // قطاع 1' },
      overview: { 
        header: "التقييم التكتيكي",
        mission: "يمثل إكس-بيو سنتينل قمة تكنولوجيا الدفاع السعودية. مهمتنا هي إنشاء 'عقدة إدراكية سيادية'—كيان لا يكتفي بالمراقبة، بل يفهم ويتفاعل مع الشذوذ المادي والماورائي باستقلالية تامة.",
        localTitle: "ذكاء محلي 100%",
        localDesc: "كل سطر برمجي، وكل مسار دائرة، وكل بوابة منطقية تم تصميمها في الرياض، المملكة العربية السعودية. نحن نمتلك كامل الهيكل لمستقبلنا الدفاعي."
      }
    }
  }[lang];

  return (
    <div className={`min-h-screen bg-xb-black text-gray-200 flex flex-col font-tech ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="fixed inset-0 crt-overlay opacity-15 pointer-events-none z-50"></div>
      
      {/* HUD HEADER */}
      <header className="border-b border-xb-green/20 bg-xb-dark/90 backdrop-blur-xl p-5 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-5">
          <div className="relative">
             <Shield className="w-12 h-12 text-xb-green animate-pulse" />
             <div className="absolute -top-1 -right-1 w-3 h-3 bg-xb-red rounded-full animate-ping"></div>
          </div>
          <div>
            <h1 className="text-3xl font-display font-black tracking-tighter text-white leading-none">{t.hero.title}</h1>
            <div className="flex items-center gap-2 mt-1">
               <span className="w-2 h-2 bg-xb-green rounded-full"></span>
               <p className="text-[10px] text-xb-green font-mono uppercase tracking-[0.2em]">{t.hero.subtitle}</p>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-8">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 text-xb-cyan">
               <MapPin className="w-4 h-4" />
               <span className="text-xs font-display">{t.hero.location}</span>
            </div>
            <span className="text-[9px] text-gray-600 font-mono">LAT: 24.7136 | LNG: 46.6753</span>
          </div>
          <button 
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} 
            className="px-4 py-2 border border-xb-green/30 hover:border-xb-green hover:bg-xb-green/5 text-xb-green text-xs font-mono transition-all rounded-sm"
          >
            {lang === 'en' ? 'PROTOCOL: ARABIC' : 'بروتوكول: الإنجليزية'}
          </button>
        </div>
      </header>

      {/* TACTICAL NAVIGATION */}
      <nav className="bg-xb-dark border-b border-white/5 flex overflow-x-auto no-scrollbar">
        {Object.entries(t.tabs).map(([key, label]) => (
          <button 
            key={key} 
            onClick={() => setActiveTab(key as any)}
            className={`px-8 py-5 text-xs font-display tracking-widest whitespace-nowrap transition-all relative group flex items-center gap-3 ${activeTab === key ? 'text-xb-green' : 'text-gray-500 hover:text-gray-300'}`}
          >
            {activeTab === key && <div className="absolute inset-x-0 bottom-0 h-0.5 bg-xb-green shadow-[0_0_10px_#00ff41]"></div>}
            <div className={`w-1.5 h-1.5 rounded-full ${activeTab === key ? 'bg-xb-green animate-pulse' : 'bg-gray-700'}`}></div>
            {label}
          </button>
        ))}
      </nav>

      {/* MAIN BRIEFING INTERFACE */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full relative">
        
        {/* BACKGROUND DECORATIONS */}
        <div className="absolute top-20 left-10 opacity-5 pointer-events-none">
           <Terminal className="w-96 h-96 text-xb-green" />
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 animate-fadeIn">
            <div className="space-y-10 relative">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-xb-green/10 border border-xb-green/20 rounded-full text-xb-green text-xs font-display tracking-widest">
                 <ShieldCheck className="w-4 h-4" /> {t.overview.header}
              </div>
              
              <h2 className="text-5xl font-display font-bold leading-tight text-white">{isRTL ? 'إيجاز المهمة السيادية' : 'Sovereign Mission Briefing'}</h2>
              
              <div className="relative">
                 <div className="absolute -left-6 top-0 bottom-0 w-1 bg-xb-green/30"></div>
                 <p className="text-xl text-gray-400 font-mono leading-relaxed pl-4">{t.overview.mission}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                <div className="p-6 bg-xb-dark border border-xb-green/20 rounded-sm hover:bg-xb-green/5 transition-colors group">
                  <div className="flex items-center gap-3 mb-4">
                     <Hexagon className="w-5 h-5 text-xb-green group-hover:rotate-90 transition-transform" />
                     <h3 className="font-display text-xb-green text-sm uppercase tracking-wider">{t.overview.localTitle}</h3>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed font-mono">{t.overview.localDesc}</p>
                </div>

                <div className="p-6 bg-xb-dark border border-xb-cyan/20 rounded-sm flex flex-col justify-between">
                   <div className="flex justify-between items-start">
                      <span className="text-xb-cyan text-[10px] font-mono tracking-widest">REGISTRATION ID</span>
                      <AlertTriangle className="w-4 h-4 text-xb-cyan animate-pulse" />
                   </div>
                   <div className="mt-4">
                      <div className="text-2xl font-display text-white">SAIP-19-NODE</div>
                      <div className="text-[10px] text-gray-500 font-mono mt-1">SAUDI AUTHORITY FOR INTELLECTUAL PROPERTY</div>
                   </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
               <div className="relative bg-xb-dark/60 border border-white/10 p-3 rounded-lg overflow-hidden group shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10 pointer-events-none"></div>
                  <LiveMonitor lang={lang} />
                  <div className="absolute top-6 left-6 z-20 bg-black/60 px-3 py-1 border border-xb-cyan/30 rounded text-[10px] text-xb-cyan font-mono animate-pulse uppercase">
                    Channel 07 // Real-time Telemetry
                  </div>
               </div>
               
               <div className="bg-xb-dark/40 border border-white/5 p-6 rounded-lg">
                  <div className="flex items-center gap-2 mb-4 text-xs font-display text-gray-500">
                     <Info className="w-4 h-4" /> 
                     {isRTL ? 'سجل العمليات الأخيرة' : 'LATEST SYSTEM LOGS'}
                  </div>
                  <div className="space-y-3 font-mono text-[10px] md:text-xs">
                    {logs.length > 0 ? logs.map((log, i) => (
                      <div key={i} className="flex gap-4 items-center animate-slideIn">
                        <span className="text-xb-green/40 min-w-[70px]">{log.split(']')[0] + ']'}</span>
                        <span className="text-gray-400">{log.split(']')[1]}</span>
                      </div>
                    )) : <div className="text-gray-600 italic">Connecting to node...</div>}
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'specs' && (
          <div className="space-y-12 animate-fadeIn">
            <div className="max-w-3xl border-l-4 border-xb-cyan pl-6 py-2">
              <h2 className="text-4xl font-display font-bold text-white mb-2">{isRTL ? 'بنية العتاد المعزول' : 'Isolated Hardware Architecture'}</h2>
              <p className="text-gray-500 font-mono italic text-sm">X-Bio Sentinel hardware is built on proprietary Saudi kernels to ensure 0.0ms latency and 0% external interference.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {TECH_SPECS[lang].map((spec, i) => (
                 <div key={i} className="group p-8 bg-xb-dark/80 border border-white/5 hover:border-xb-cyan/40 transition-all hover:-translate-y-2 relative overflow-hidden flex flex-col h-full">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                       <Cpu className="w-20 h-20 text-xb-cyan" />
                    </div>
                    <div className="flex items-center gap-4 mb-8">
                       <div className="p-4 bg-xb-cyan/10 rounded-lg text-xb-cyan group-hover:bg-xb-cyan group-hover:text-black transition-all">
                          <Zap className="w-6 h-6" />
                       </div>
                       <div>
                          <span className="text-[10px] tracking-widest text-xb-cyan uppercase block font-display mb-1">{spec.label}</span>
                          <div className="text-xl font-display font-bold text-white">{spec.value}</div>
                       </div>
                    </div>
                    <p className="text-gray-500 text-sm font-mono leading-relaxed mb-8 flex-1">{spec.detail}</p>
                    <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                       <div className="flex items-center gap-2 text-[10px] text-xb-green uppercase font-display">
                          <ShieldCheck className="w-3 h-3" /> Integrity: Nominal
                       </div>
                       <ChevronRight className="w-4 h-4 text-xb-cyan/50 group-hover:translate-x-2 transition-transform" />
                    </div>
                 </div>
               ))}
            </div>
          </div>
        )}

        {activeTab === 'inventions' && (
          <div className="space-y-10 animate-fadeIn">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-xb-green/20 pb-8">
              <div>
                <h2 className="text-5xl font-display font-bold text-white uppercase tracking-tighter">{isRTL ? 'الابتكارات السيادية الـ 19' : '19 Sovereign Inventions'}</h2>
                <p className="text-gray-500 font-mono mt-3 max-w-2xl">{isRTL ? 'براءات الاختراع الحصرية التي تشكل العقل الدفاعي لـ X-Bio Sentinel.' : 'Exclusive patent-pending technologies architected in Riyadh, forming the cognitive defense shield of X-Bio Sentinel.'}</p>
              </div>
              <div className="flex items-center gap-4">
                 <div className="px-4 py-2 bg-xb-red/10 border border-xb-red/20 text-xb-red text-[10px] font-display animate-pulse">CLASSIFIED // LEVEL 7 ACCESS</div>
                 <div className="px-4 py-2 bg-xb-green text-black font-display text-xs font-bold skew-x-[-15deg]">SAIP SECURE</div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
               {PATENTS[lang].map((p) => <PatentCard key={p.code} patent={p} lang={lang} />)}
            </div>
          </div>
        )}

        {activeTab === 'hierarchy' && (
          <div className="space-y-16 animate-fadeIn">
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <h2 className="text-4xl font-display font-bold text-white">{isRTL ? 'هيكل القيادة الإدراكية' : 'Cognitive Command Structure'}</h2>
              <div className="w-20 h-1 bg-xb-gold mx-auto"></div>
              <p className="text-gray-500 font-mono text-sm leading-relaxed">The fusion of human vision and AI execution. A centralized hierarchy governing the global Sentinel network.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
               {TEAM[lang].map((member) => (
                 <div key={member.id} className="bg-xb-dark/80 border border-xb-gold/10 p-8 flex flex-col items-center text-center relative group hover:border-xb-gold/50 transition-all rounded-sm overflow-hidden">
                    <div className="absolute inset-0 bg-xb-gold/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="w-24 h-24 rounded-full bg-xb-gold/10 flex items-center justify-center border-2 border-xb-gold/40 mb-6 group-hover:scale-110 transition-transform relative">
                       <span className="text-xb-gold font-display font-bold text-3xl">{member.id.charAt(0)}</span>
                       <div className="absolute -bottom-2 -right-2 bg-black border border-xb-gold px-2 py-0.5 text-[8px] text-xb-gold rounded-full">LVL {member.clearance.match(/\d+/)?.[0] || 'S'}</div>
                    </div>
                    <h3 className="text-white font-display text-lg font-bold mb-1">{member.name}</h3>
                    <p className="text-xb-gold text-[10px] tracking-[0.2em] font-mono uppercase mb-6 opacity-70">{member.role}</p>
                    <p className="text-[11px] font-mono text-gray-500 leading-relaxed min-h-[60px]">{member.description}</p>
                    <div className="mt-8 pt-6 border-t border-white/5 w-full">
                       <span className="text-[9px] text-xb-gold/60 font-mono uppercase tracking-widest italic">{member.clearance}</span>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        )}

      </main>

      {/* TACTICAL FOOTER */}
      <footer className="border-t border-white/5 bg-xb-dark/95 p-8 mt-auto relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 p-4">
           <Shield className="w-24 h-24 text-xb-green" />
        </div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-gray-600 font-mono text-[10px] uppercase tracking-[0.3em]">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 bg-xb-green rounded-full animate-pulse"></div>
                 <span className="text-xb-green">PROTOCOL ACTIVE</span>
              </div>
              <span>© 2024 X-BIO SENTINEL HQ // RIYADH</span>
           </div>
           <div className="flex items-center gap-10">
              <a href="#" className="hover:text-white transition-colors flex items-center gap-2">
                 <Terminal className="w-3 h-3" /> SYSTEM_SHELL
              </a>
              <a href="#" className="hover:text-white transition-colors flex items-center gap-2">
                 <ShieldCheck className="w-3 h-3" /> VERIFIED_ORIGIN
              </a>
              <a href="#" className="hover:text-xb-cyan transition-colors flex items-center gap-2 border-l border-white/10 pl-10">
                 SECURE_CONTACT <ArrowRight className="w-3 h-3" />
              </a>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
