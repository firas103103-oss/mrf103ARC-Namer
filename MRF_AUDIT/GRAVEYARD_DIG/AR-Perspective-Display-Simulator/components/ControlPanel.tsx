
import React from 'react';
import type { Concept } from '../types';

interface ControlPanelProps {
  concept: Concept;
  controls: Record<string, any>;
  setControls: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}

const SliderControl: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ label, value, min, max, step, unit, onChange }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
    <div className="flex items-center gap-4">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
      />
      <span className="text-violet-400 font-mono text-sm w-20 text-right">{value.toFixed(2)}{unit}</span>
    </div>
  </div>
);

const SelectControl: React.FC<{
    label: string;
    value: string;
    options: string[];
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}> = ({ label, value, options, onChange }) => (
    <div className="mb-4">
        <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
        <select
            value={value}
            onChange={onChange}
            className="w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-md p-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
        >
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);


export const ControlPanel: React.FC<ControlPanelProps> = ({ concept, controls, setControls }) => {
  const handleControlChange = (key: string, value: any) => {
    setControls(prev => ({ ...prev, [key]: value }));
  };

  const renderControls = () => {
    switch (concept.id) {
      case 'chronos-glass':
        return (
          <>
            <SliderControl
              label="Temporal Scrubbing (Year)"
              value={controls.year}
              min={1800}
              max={2024}
              step={1}
              unit=""
              onChange={(e) => handleControlChange('year', parseInt(e.target.value))}
            />
            <SelectControl
                label="Emotional Resonance Filter"
                value={controls.emotion}
                options={['Joy', 'Sorrow', 'Nostalgia', 'Tension', 'Peace']}
                onChange={(e) => handleControlChange('emotion', e.target.value)}
            />
          </>
        );
      case 'symbiotic-sightlines':
        return (
           <SelectControl
                label="Organism Perspective"
                value={controls.organism}
                options={['Bee', 'Bat', 'Eagle', 'Snake']}
                onChange={(e) => handleControlChange('organism', e.target.value)}
            />
        );
      case 'axiom-shifter':
        return (
          <>
            <SliderControl
              label="Gravity Axiom"
              value={controls.gravity}
              min={-1}
              max={3}
              step={0.1}
              unit="g"
              onChange={(e) => handleControlChange('gravity', parseFloat(e.target.value))}
            />
            <SelectControl
                label="Material Transmutation"
                value={controls.material}
                options={['Gas', 'Liquid', 'Crystal', 'Energy']}
                onChange={(e) => handleControlChange('material', e.target.value)}
            />
          </>
        );
      case 'collective-unconscious':
        return (
            <SelectControl
                label="Intangible Visualization"
                value={controls.visualization}
                options={['Emotional Auras', 'Idea Streams', 'Latent Narratives']}
                onChange={(e) => handleControlChange('visualization', e.target.value)}
            />
        );
      default:
        return <p>No controls available for this concept.</p>;
    }
  };

  return <div className="animate-fade-in">{renderControls()}</div>;
};
