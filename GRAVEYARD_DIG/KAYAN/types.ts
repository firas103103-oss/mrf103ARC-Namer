// FIX: Add missing import for React to resolve namespace error.
import React from 'react';

export interface EvolutionStage {
  title: string;
  subtitle: string;
  description: string;
  items: string[];
}

export interface Capability {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

export interface Invention extends Capability {
  pitch: string;
}

export interface ArchitectureLayer {
  id: number;
  name: string;
  subtitle: string;
  components: string;
  role: string;
  technologies: string;
  feature: string;
  isLocal: boolean;
}

export interface BuildPhase {
  phase: number;
  title: string;
  tasks: string[];
}

export interface Tool {
  function: string;
  tool: string;
  role: string;
}
