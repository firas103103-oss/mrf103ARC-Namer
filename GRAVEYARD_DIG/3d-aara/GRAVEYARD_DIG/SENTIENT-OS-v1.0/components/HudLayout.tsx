
import React from 'react';

interface HudLayoutProps {
  children: React.ReactNode;
}

const Corner: React.FC<{ position: string }> = ({ position }) => {
    const baseClasses = "absolute w-8 h-8 border-sky-300";
    let positionClasses = "";
    if (position.includes('top')) positionClasses += ' top-2';
    if (position.includes('bottom')) positionClasses += ' bottom-2';
    if (position.includes('left')) positionClasses += ' left-2';
    if (position.includes('right')) positionClasses += ' right-2';
  
    if (position === 'top-left') positionClasses += ' border-t-2 border-l-2';
    if (position === 'top-right') positionClasses += ' border-t-2 border-r-2';
    if (position === 'bottom-left') positionClasses += ' border-b-2 border-l-2';
    if (position === 'bottom-right') positionClasses += ' border-b-2 border-r-2';
  
    return <div className={`${baseClasses} ${positionClasses}`}></div>;
  };

const HudLayout: React.FC<HudLayoutProps> = ({ children }) => {
  return (
    <div className="relative w-full h-full border-2 border-sky-400/30 bg-black/40 backdrop-blur-sm flex flex-col hud-glow">
        <Corner position="top-left" />
        <Corner position="top-right" />
        <Corner position="bottom-left" />
        <Corner position="bottom-right" />
        {children}
    </div>
  );
};

export default HudLayout;
