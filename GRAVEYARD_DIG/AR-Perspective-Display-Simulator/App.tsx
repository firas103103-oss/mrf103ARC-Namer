
import React, { useState } from 'react';
import { Header } from './components/Header';
import { ConceptCard } from './components/ConceptCard';
import { PerspectiveView } from './components/PerspectiveView';
import { CONCEPTS, DEFAULT_CONCEPT } from './constants';
import type { Concept } from './types';

const App: React.FC = () => {
  const [selectedConcept, setSelectedConcept] = useState<Concept>(DEFAULT_CONCEPT);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <section className="mb-12 animate-fade-in">
          <h2 className="text-2xl md:text-3xl font-bold text-violet-400 mb-4 tracking-wide">Select a Perspective Concept</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CONCEPTS.map((concept) => (
              <ConceptCard
                key={concept.id}
                concept={concept}
                isSelected={selectedConcept.id === concept.id}
                onSelect={() => setSelectedConcept(concept)}
              />
            ))}
          </div>
        </section>

        <section className="animate-fade-in" style={{ animationDelay: '200ms' }}>
          <PerspectiveView key={selectedConcept.id} concept={selectedConcept} />
        </section>
      </main>
      <footer className="text-center p-4 text-slate-500 text-sm">
        <p>AR Perspective Display Simulator. Powered by React, Tailwind, and Gemini.</p>
      </footer>
    </div>
  );
};

export default App;
