
import React from 'react';
import { Header } from './components/Header';
import { Section } from './components/Section';
import { EvolutionTimeline } from './components/EvolutionTimeline';
import { PitchHighlights } from './components/PitchHighlights';
import { ArchitectureDiagram } from './components/ArchitectureDiagram';
import { BuildGuide } from './components/BuildGuide';
import { ToolsMatrix } from './components/ToolsMatrix';
import { generalDefinition, evolutionData, coreCapabilities, pitchInventions, architectureLayers, buildGuidePhases, toolsMatrixData } from './constants';
import { BrainCircuit, Rocket, Zap } from './components/Icons';

const App: React.FC = () => {
  return (
    <div className="bg-gray-900 text-gray-200 min-h-screen antialiased">
      <div className="relative overflow-hidden">
        <div className="absolute top-0 right-0 -z-10 w-[57rem] h-[57rem] bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -z-10 w-[40rem] h-[40rem] bg-teal-500/10 rounded-full blur-3xl" />
        
        <Header />

        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Section title="1. التعريف العام: كيان (Kayan)" icon={<BrainCircuit className="w-8 h-8 text-teal-400" />}>
            <p className="text-lg md:text-xl leading-relaxed text-gray-300 backdrop-blur-sm bg-gray-800/20 p-6 rounded-lg border border-gray-700">
              {generalDefinition}
            </p>
          </Section>

          <Section title="2. رحلة التطور: من العصائر إلى الكيان">
            <EvolutionTimeline stages={evolutionData} />
          </Section>

          <Section title="3. المزايا، القدرات، ونقاط الجذب الاستثماري" icon={<Rocket className="w-8 h-8 text-teal-400" />}>
            <PitchHighlights capabilities={coreCapabilities} inventions={pitchInventions} />
          </Section>

          <Section title="4. التقرير الفني: الهيكلة التقنية للنظام" icon={<Zap className="w-8 h-8 text-teal-400" />}>
            <ArchitectureDiagram layers={architectureLayers} />
          </Section>

          <Section title="5. تقرير عملي: خطوات الإنشاء المتسلسلة">
            <BuildGuide phases={buildGuidePhases} />
          </Section>

          <Section title="6. تقرير أدوات الذكاء الاصطناعي">
            <ToolsMatrix data={toolsMatrixData} />
          </Section>

        </main>

        <footer className="text-center py-8 text-gray-500 border-t border-gray-800">
          <p>&copy; 2024 Kayan Project Blueprint. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
