
import React from 'react';
import { Mode } from '../types';
import { SunIcon, SteeringWheelIcon, BriefcaseIcon } from './icons';

interface ModeSelectorProps {
  currentMode: Mode;
  setMode: (mode: Mode) => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ currentMode, setMode }) => {
  const modes = [
    { id: Mode.DAILY, label: 'Daily', icon: <SunIcon className="w-5 h-5" /> },
    { id: Mode.DRIVING, label: 'Driving', icon: <SteeringWheelIcon className="w-5 h-5" /> },
    { id: Mode.WORK, label: 'Work', icon: <BriefcaseIcon className="w-5 h-5" /> },
  ];

  return (
    <footer className="w-full p-2 border-t-2 border-sky-400/20 flex justify-center items-center space-x-4">
      {modes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => setMode(mode.id)}
          className={`px-4 py-2 flex items-center space-x-2 rounded-md transition-all duration-300 text-sm font-medium border-2 ${
            currentMode === mode.id
              ? 'bg-sky-400/30 border-sky-300 text-sky-200 hud-glow'
              : 'bg-transparent border-transparent hover:bg-sky-400/10 hover:border-sky-400/30'
          }`}
        >
          {mode.icon}
          <span>{mode.label}</span>
        </button>
      ))}
    </footer>
  );
};

export default ModeSelector;
