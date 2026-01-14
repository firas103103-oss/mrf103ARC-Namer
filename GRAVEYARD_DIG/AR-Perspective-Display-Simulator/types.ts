
export enum ConceptId {
  ChronosGlass = 'chronos-glass',
  SymbioticSightlines = 'symbiotic-sightlines',
  AxiomShifter = 'axiom-shifter',
  CollectiveUnconscious = 'collective-unconscious',
}

export interface Concept {
  id: ConceptId;
  title: string;
  description: string;
  icon: JSX.Element;
  promptContext: string;
}
