
import React from 'react';
import type { Concept } from '../types';

interface ConceptCardProps {
  concept: Concept;
  isSelected: boolean;
  onSelect: () => void;
}

export const ConceptCard: React.FC<ConceptCardProps> = ({ concept, isSelected, onSelect }) => {
  const baseClasses = "rounded-lg p-5 border-2 transition-all duration-300 cursor-pointer group flex flex-col items-start h-full";
  const selectedClasses = "bg-violet-900/40 border-violet-500 shadow-lg shadow-violet-500/20";
  const unselectedClasses = "bg-slate-800/50 border-slate-700 hover:border-violet-500 hover:bg-slate-800";

  return (
    <div
      className={`${baseClasses} ${isSelected ? selectedClasses : unselectedClasses}`}
      onClick={onSelect}
    >
      <div className={`mb-3 text-3xl ${isSelected ? 'text-violet-400' : 'text-slate-400 group-hover:text-violet-400'}`}>
        {concept.icon}
      </div>
      <h3 className="text-xl font-bold mb-2 text-slate-100">{concept.title}</h3>
      <p className="text-slate-400 text-sm flex-grow">{concept.description}</p>
    </div>
  );
};
