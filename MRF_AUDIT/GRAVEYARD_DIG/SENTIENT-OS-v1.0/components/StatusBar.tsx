
import React, { useState, useEffect } from 'react';
import { WifiIcon, ShieldCheckIcon, DevicePhoneMobileIcon, ClockIcon } from './icons';

const StatusBar: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <header className="w-full p-3 border-b-2 border-sky-400/20 flex justify-between items-center text-xs sm:text-sm">
      <div className="text-sky-300 font-bold text-glow">SENTIENT OS v1.0</div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1 text-green-400">
            <DevicePhoneMobileIcon className="w-4 h-4" />
            <span>FOLD 6</span>
        </div>
        <div className="flex items-center space-x-1 text-green-400">
            <ClockIcon className="w-4 h-4 animate-pulse" />
            <span>GALAXY WATCH</span>
        </div>
        <div className="flex items-center space-x-1 text-green-400">
          <ShieldCheckIcon className="w-4 h-4" />
          <span>SECURE</span>
        </div>
        <div className="flex items-center space-x-2 text-sky-300">
          <span>{formattedTime}</span>
          <WifiIcon className="w-4 h-4" />
        </div>
      </div>
    </header>
  );
};

export default StatusBar;
