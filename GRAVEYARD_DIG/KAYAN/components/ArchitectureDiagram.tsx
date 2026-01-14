
import React from 'react';
import { ArchitectureLayer } from '../types';
import { Cpu, BrainCircuit, GitBranch, Terminal, Share2 } from './Icons';

interface ArchitectureDiagramProps {
  layers: ArchitectureLayer[];
}

const icons = [Share2, Cpu, GitBranch, BrainCircuit, Terminal];

export const ArchitectureDiagram: React.FC<ArchitectureDiagramProps> = ({ layers }) => {
  return (
    <div className="space-y-4">
      {layers.map((layer, index) => {
        const IconComponent = icons[index % icons.length];
        return (
          <div key={layer.id} className="bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-lg p-6 flex flex-col md:flex-row items-start md:items-center gap-6 relative overflow-hidden">
            <div className={`absolute top-0 right-0 h-full w-2 ${layer.isLocal ? 'bg-teal-500' : 'bg-blue-500'}`}></div>
            <div className="flex-shrink-0 flex flex-col items-center w-full md:w-32 text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 border-2 ${layer.isLocal ? 'bg-teal-900/50 border-teal-400' : 'bg-blue-900/50 border-blue-400'}`}>
                <IconComponent className={`w-8 h-8 ${layer.isLocal ? 'text-teal-300' : 'text-blue-300'}`} />
              </div>
              <h3 className="text-lg font-bold text-gray-100">{layer.name}</h3>
              <p className="text-sm text-gray-400 font-orbitron">{layer.subtitle}</p>
              <span className={`mt-2 text-xs font-bold px-2 py-1 rounded-full ${layer.isLocal ? 'bg-teal-500/20 text-teal-300' : 'bg-blue-500/20 text-blue-300'}`}>
                {layer.isLocal ? 'Local' : 'Cloud'}
              </span>
            </div>
            <div className="w-full md:flex-grow grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <h4 className="font-bold text-gray-300">المكونات:</h4>
                <p className="text-gray-400">{layer.components}</p>
              </div>
              <div>
                <h4 className="font-bold text-gray-300">الدور:</h4>
                <p className="text-gray-400">{layer.role}</p>
              </div>
              <div>
                <h4 className="font-bold text-gray-300">التقنيات:</h4>
                <p className="text-gray-400 text-sm">{layer.technologies}</p>
              </div>
              <div>
                <h4 className="font-bold text-gray-300">الميزة:</h4>
                <p className="text-gray-400">{layer.feature}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
