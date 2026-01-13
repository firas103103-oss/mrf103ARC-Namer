
import React from 'react';

interface VirtualCharacterProps {
  volume: number;
}

const VirtualCharacter: React.FC<VirtualCharacterProps> = ({ volume }) => {
  const scale = 1 + Math.min(volume * 1.5, 1); // Clamp the effect
  const blur = 10 + volume * 40;
  const opacity = 0.5 + Math.min(volume * 0.5, 0.4);

  return (
    <div 
      className="relative w-48 h-48 transition-transform duration-100 ease-out"
      style={{ transform: `scale(${scale})` }}
    >
      {/* Outer Glow */}
      <div
        className="absolute inset-0 rounded-full bg-purple-500 transition-all duration-200 ease-in-out"
        style={{ filter: `blur(${blur}px)`, opacity: opacity }}
      ></div>
      {/* Core Orb */}
      <div className="absolute inset-4 rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 shadow-2xl shadow-purple-500/50"></div>
       {/* Inner Sparkle */}
       <div 
        className="absolute inset-8 rounded-full bg-white/50 transition-opacity duration-100 ease-out"
        style={{ opacity: volume * 2, filter: 'blur(5px)' }}
       ></div>
    </div>
  );
};

export default VirtualCharacter;
