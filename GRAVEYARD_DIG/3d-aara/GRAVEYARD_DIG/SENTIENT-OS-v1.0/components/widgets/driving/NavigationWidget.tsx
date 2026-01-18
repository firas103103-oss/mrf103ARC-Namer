
import React from 'react';
import Widget from '../../Widget';
import { MapIcon } from '../../icons';

const NavigationWidget: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <Widget title="Navigation" className={className} icon={<MapIcon className="w-4 h-4"/>}>
      <div className="h-full flex flex-col">
        <div className="flex-grow bg-slate-800/50 rounded-md relative overflow-hidden">
            <img src="https://picsum.photos/seed/map/800/600" alt="Map" className="absolute w-full h-full object-cover opacity-20"/>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sky-300">
                <svg viewBox="0 0 100 100" className="w-24 h-24 animate-pulse">
                    <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" fill="none" />
                    <circle cx="50" cy="50" r="3" fill="currentColor" />
                    <line x1="50" y1="5" x2="50" y2="15" stroke="currentColor" strokeWidth="2"/>
                    <path d="M 50 5 L 45 15" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <path d="M 50 5 L 55 15" stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
            </div>
        </div>
        <div className="flex justify-between items-center pt-4 mt-4 border-t border-sky-400/20">
          <div>
            <p className="text-lg font-bold text-white">Next Turn: Right on Main St</p>
            <p className="text-slate-400">in 200 meters</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-green-400 text-glow">12 min</p>
            <p className="text-slate-400">5.2 km remaining</p>
          </div>
        </div>
      </div>
    </Widget>
  );
};

export default NavigationWidget;
