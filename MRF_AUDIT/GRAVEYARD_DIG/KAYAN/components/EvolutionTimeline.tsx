
import React from 'react';
import { EvolutionStage } from '../types';
import { Zap } from './Icons';

interface EvolutionTimelineProps {
  stages: EvolutionStage[];
}

export const EvolutionTimeline: React.FC<EvolutionTimelineProps> = ({ stages }) => {
  return (
    <div className="relative border-r-2 border-teal-500/30 pr-8">
      {stages.map((stage, index) => (
        <div key={index} className="mb-12 relative">
          <div className="absolute -right-[1.4rem] top-1.5 w-10 h-10 rounded-full bg-gray-800 border-2 border-teal-400 flex items-center justify-center">
            <span className="text-teal-400 font-bold">{index + 1}</span>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700 hover:border-teal-400/50 transition-colors duration-300">
            <h3 className="text-2xl font-bold text-teal-300">{stage.title}</h3>
            <p className="font-orbitron text-gray-400 text-sm mb-4">{stage.subtitle}</p>
            <p className="text-gray-300 mb-4">{stage.description}</p>
            <ul className="space-y-2">
              {stage.items.map((item, i) => (
                <li key={i} className="flex items-center">
                  <Zap className="w-4 h-4 text-blue-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
};
