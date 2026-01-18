
import React from 'react';
import Widget from '../../Widget';
import { PlayIcon, BackwardIcon, ForwardIcon as FwdIcon, MusicalNoteIcon } from '../../icons';

const MusicPlayerWidget: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <Widget title="Now Playing" className={className} icon={<MusicalNoteIcon className="w-4 h-4"/>}>
      <div className="h-full flex flex-col items-center justify-around text-center">
        <div>
            <p className="text-lg font-bold text-sky-200">Starlight</p>
            <p className="text-sm text-slate-400">Muse</p>
        </div>
        <div className="flex items-center space-x-6 text-sky-300">
            <button className="hover:text-white transition-colors"><BackwardIcon className="w-6 h-6"/></button>
            <button className="p-3 bg-sky-400/30 rounded-full hover:bg-sky-400/50 text-white transition-colors hud-glow"><PlayIcon className="w-8 h-8"/></button>
            <button className="hover:text-white transition-colors"><FwdIcon className="w-6 h-6"/></button>
        </div>
      </div>
    </Widget>
  );
};

export default MusicPlayerWidget;
