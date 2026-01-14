
import React from 'react';
import { Capability, Invention } from '../types';

interface PitchHighlightsProps {
  capabilities: Capability[];
  inventions: Invention[];
}

const CapabilityCard: React.FC<{ item: Capability }> = ({ item }) => (
  <div className="bg-gray-800/40 p-6 rounded-lg border border-gray-700 h-full flex flex-col">
    <div className="flex items-center mb-4">
      <item.icon className="w-8 h-8 text-teal-400 mr-4" />
      <h4 className="text-xl font-bold text-gray-100">{item.title}</h4>
    </div>
    <p className="text-gray-300">{item.description}</p>
  </div>
);

const InventionCard: React.FC<{ item: Invention }> = ({ item }) => (
  <div className="bg-gradient-to-br from-gray-800/60 to-blue-900/20 p-6 rounded-lg border border-blue-400/30 shadow-lg shadow-blue-500/10 flex flex-col h-full transition-transform transform hover:scale-105 duration-300">
    <div className="flex items-center mb-4">
      <item.icon className="w-8 h-8 text-blue-300 mr-4" />
      <h4 className="text-xl font-bold text-blue-200">{item.title}</h4>
    </div>
    <p className="text-gray-300 flex-grow mb-4">{item.description}</p>
    <div className="mt-auto border-t-2 border-blue-400/30 pt-3">
      <p className="text-sm text-blue-200 italic">
        <span className="font-bold not-italic">The Pitch: </span>"{item.pitch}"
      </p>
    </div>
  </div>
);

export const PitchHighlights: React.FC<PitchHighlightsProps> = ({ capabilities, inventions }) => {
  return (
    <div className="space-y-16">
      <div>
        <h3 className="text-2xl font-bold text-gray-200 mb-6">🌟 المزايا والقدرات الأساسية</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((item, index) => (
            <CapabilityCard key={index} item={item} />
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-2xl font-bold text-gray-200 mb-6">🚀 الاختراعات ونقاط الجذب الاستثماري</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {inventions.map((item, index) => (
            <InventionCard key={index} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
};
