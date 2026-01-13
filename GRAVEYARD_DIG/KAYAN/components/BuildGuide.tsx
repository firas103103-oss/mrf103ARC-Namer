
import React from 'react';
import { BuildPhase } from '../types';
import { Construction } from './Icons';

interface BuildGuideProps {
  phases: BuildPhase[];
}

export const BuildGuide: React.FC<BuildGuideProps> = ({ phases }) => {
  return (
    <div className="relative border-r-2 border-blue-500/30 pr-10">
      {phases.map((phase, index) => (
        <div key={index} className="mb-10 relative">
          <div className="absolute -right-[2.6rem] top-1 w-16 h-16 rounded-full bg-gray-900 border-2 border-blue-400 flex flex-col items-center justify-center">
            <span className="text-xs text-blue-300">المرحلة</span>
            <span className="text-blue-300 text-2xl font-bold font-orbitron">{phase.phase}</span>
          </div>
          <div className="pl-8">
            <h3 className="text-2xl font-bold text-blue-200 mb-4">{phase.title}</h3>
            <ul className="space-y-3 list-none">
              {phase.tasks.map((task, i) => (
                <li key={i} className="flex items-start">
                  <Construction className="w-5 h-5 text-gray-400 mr-4 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">{task}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
};
