import React, { memo } from 'react';
import { Patent } from '../types';
import { FileKey, ShieldAlert, Cpu, Activity, Lock, CheckCircle } from 'lucide-react';

interface PatentCardProps {
  patent: Patent;
  lang: 'en' | 'ar';
}

const PatentCard: React.FC<PatentCardProps> = memo(({ patent, lang }) => {
  const getIcon = () => {
    switch (patent.category) {
      case 'Offensive': return <ShieldAlert className="w-5 h-5 text-xb-red" />;
      case 'Structural': return <Cpu className="w-5 h-5 text-xb-gold" />;
      case 'Analytical': return <Activity className="w-5 h-5 text-xb-cyan" />;
      case 'Control': return <FileKey className="w-5 h-5 text-xb-green" />;
      default: return <Cpu className="w-5 h-5 text-xb-green" />;
    }
  };

  const getBorderColor = () => {
    switch (patent.category) {
      case 'Offensive': return 'border-xb-red/20 group-hover:border-xb-red/60 bg-gradient-to-br from-xb-red/5 to-transparent';
      case 'Structural': return 'border-xb-gold/20 group-hover:border-xb-gold/60 bg-gradient-to-br from-xb-gold/5 to-transparent';
      case 'Analytical': return 'border-xb-cyan/20 group-hover:border-xb-cyan/60 bg-gradient-to-br from-xb-cyan/5 to-transparent';
      case 'Control': return 'border-xb-green/20 group-hover:border-xb-green/60 bg-gradient-to-br from-xb-green/5 to-transparent';
      default: return 'border-xb-green/20';
    }
  };

  const getTextColor = () => {
    switch (patent.category) {
      case 'Offensive': return 'text-xb-red';
      case 'Structural': return 'text-xb-gold';
      case 'Analytical': return 'text-xb-cyan';
      case 'Control': return 'text-xb-green';
      default: return 'text-xb-green';
    }
  };

  return (
    <div className={`relative group p-5 border backdrop-blur-md transition-all duration-300 hover:shadow-lg hover:translate-y-[-2px] overflow-hidden ${getBorderColor()}`}>
      
      {/* Background Tech Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      {/* Corner decorations */}
      <div className={`absolute top-0 left-0 w-3 h-3 border-t border-l opacity-50 transition-colors ${getTextColor()}`}></div>
      <div className={`absolute bottom-0 right-0 w-3 h-3 border-b border-r opacity-50 transition-colors ${getTextColor()}`}></div>

      <div className="flex items-start justify-between mb-3 relative z-10">
        <span className={`font-tech text-xs tracking-[0.2em] font-bold ${getTextColor()} opacity-80 bg-black/40 px-2 py-0.5 rounded border border-white/5`}>
          {patent.code}
        </span>
        <div className={`p-1.5 rounded-full bg-black/40 border border-white/5 ${getTextColor()}`}>
          {getIcon()}
        </div>
      </div>

      <h3 className="font-display text-sm md:text-base font-bold mb-3 uppercase text-gray-100 group-hover:text-white transition-colors relative z-10">
        {patent.name}
      </h3>
      
      <p className="font-mono text-xs text-gray-400 leading-relaxed min-h-[60px] relative z-10">
        {patent.description}
      </p>

      <div className="mt-4 flex items-center justify-between relative z-10 pt-4 border-t border-white/5">
        <div className="flex items-center gap-1.5 text-[10px] font-tech text-gray-500 uppercase">
          <Lock className="w-3 h-3" />
          <span>Classified</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-tech text-xb-green uppercase">
          <CheckCircle className="w-3 h-3" />
          <span>SAIP Reg</span>
        </div>
      </div>
    </div>
  );
});

export default PatentCard;