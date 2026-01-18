import React from 'react';
import type { Concept } from './types';
import { ConceptId } from './types';
import { TimeIcon, EyeIcon, CubeIcon, BrainIcon } from './components/icons';

export const CONCEPTS: Concept[] = [
  {
    id: ConceptId.ChronosGlass,
    title: "The Chronos-Glass",
    description: "Peer through time's veil. Rewind or fast-forward history in a location and see it through different emotional lenses.",
    // FIX: Use React.createElement instead of JSX in a .ts file.
    icon: React.createElement(TimeIcon),
    promptContext: "You are an AR storyteller describing a scene through the Chronos-Glass.",
  },
  {
    id: ConceptId.SymbioticSightlines,
    title: "Symbiotic Sightlines",
    description: "Experience the world through other eyes. See with a bee's UV vision or sense with a bat's echolocation.",
    // FIX: Use React.createElement instead of JSX in a .ts file.
    icon: React.createElement(EyeIcon),
    promptContext: "You are an AR naturalist describing the world from the sensory perspective of another organism.",
  },
  {
    id: ConceptId.AxiomShifter,
    title: "The Axiom Shifter",
    description: "Unravel reality's fabric. Playfully manipulate physical laws like gravity or transmute materials within an AR zone.",
    // FIX: Use React.createElement instead of JSX in a .ts file.
    icon: React.createElement(CubeIcon),
    promptContext: "You are an AR physicist describing a scene where the fundamental axioms of reality have been altered.",
  },
  {
    id: ConceptId.CollectiveUnconscious,
    title: "The Dream Weave",
    description: "Visualize the intangible. Perceive emotional auras, follow streams of thought, or uncover latent narratives.",
    // FIX: Use React.createElement instead of JSX in a .ts file.
    icon: React.createElement(BrainIcon),
    promptContext: "You are an AR metaphysician describing the abstract, unseen forces and concepts manifesting in a location.",
  },
];

export const DEFAULT_CONCEPT = CONCEPTS[0];