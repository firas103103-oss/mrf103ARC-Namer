
import React, { useState, useEffect, useCallback } from 'react';
import type { Concept } from '../types';
import { ControlPanel } from './ControlPanel';
import { generatePerspectiveContent } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';

interface PerspectiveViewProps {
  concept: Concept;
}

const getDefaultControls = (conceptId: string): Record<string, any> => {
  switch (conceptId) {
    case 'chronos-glass':
      return { year: 1920, emotion: 'Nostalgia' };
    case 'symbiotic-sightlines':
      return { organism: 'Bee' };
    case 'axiom-shifter':
      return { gravity: 0.5, material: 'Liquid' };
    case 'collective-unconscious':
      return { visualization: 'Emotional Auras' };
    default:
      return {};
  }
};

export const PerspectiveView: React.FC<PerspectiveViewProps> = ({ concept }) => {
  const [controls, setControls] = useState<Record<string, any>>(() => getDefaultControls(concept.id));
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = useCallback(async (currentConcept: Concept, currentControls: Record<string, any>) => {
    setIsLoading(true);
    setError(null);
    try {
      const content = await generatePerspectiveContent(currentConcept, currentControls);
      setGeneratedContent(content);
    } catch (err) {
      setError('Failed to fetch perspective from Gemini.');
      setGeneratedContent('An error occurred. Please try adjusting the controls or selecting a new concept.');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    // Initial fetch when concept changes
    const initialControls = getDefaultControls(concept.id);
    setControls(initialControls);
    fetchContent(concept, initialControls);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [concept]);


  useEffect(() => {
    // Debounced fetch when controls change
    const handler = setTimeout(() => {
      if (Object.keys(controls).length > 0) {
        fetchContent(concept, controls);
      }
    }, 500); // 500ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [controls, concept, fetchContent]);


  return (
    <div className="bg-slate-800/50 border-2 border-slate-700 rounded-lg shadow-2xl flex flex-col lg:flex-row overflow-hidden min-h-[60vh]">
      <div className="lg:w-1/3 p-6 border-b-2 lg:border-b-0 lg:border-r-2 border-slate-700 bg-slate-900/30">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-4xl text-violet-400">{concept.icon}</div>
          <h2 className="text-3xl font-bold text-slate-100">{concept.title}</h2>
        </div>
        <p className="text-slate-400 mb-6">{concept.description}</p>
        <ControlPanel concept={concept} controls={controls} setControls={setControls} />
      </div>

      <div className="lg:w-2/3 p-6 sm:p-8 flex items-center justify-center relative bg-grid">
         <div className="absolute inset-0 bg-slate-800/50" style={{ backgroundImage: 'url(https://picsum.photos/seed/ar-background/1200/800)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.1 }}></div>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="relative w-full h-full min-h-[300px] bg-slate-900/70 backdrop-blur-sm rounded-md border border-slate-700 p-6 animate-fade-in overflow-y-auto">
            <h3 className="text-lg font-semibold text-cyan-400 mb-3">AR Narrative Stream</h3>
            {error ? (
              <p className="text-red-400">{error}</p>
            ) : (
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{generatedContent}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
