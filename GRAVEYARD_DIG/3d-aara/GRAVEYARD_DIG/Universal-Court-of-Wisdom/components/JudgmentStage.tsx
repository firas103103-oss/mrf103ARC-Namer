
import React from 'react';
import IconComponents from './IconComponents';

// A simple markdown-to-html converter for this specific use case
const parseMarkdown = (text: string) => {
    return text
        .replace(/###\s*(.*)/g, '<h3 class="text-xl font-cinzel text-yellow-200 mt-6 mb-2">$1</h3>')
        .replace(/\*\*\s*(.*)\*\*/g, '<strong class="font-bold text-yellow-300">$1</strong>')
        .replace(/\n/g, '<br />');
};

interface JudgmentStageProps {
  judgment: string;
  onNewCase: () => void;
}

const JudgmentStage: React.FC<JudgmentStageProps> = ({ judgment, onNewCase }) => {
  const formattedJudgment = parseMarkdown(judgment);

  return (
    <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl p-8 animate-fade-in w-full">
      <div className="text-center mb-6">
        <IconComponents.StarIcon className="w-10 h-10 text-yellow-300 mx-auto mb-4" />
        <h2 className="text-3xl font-cinzel font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-400">The Judgment Is Rendered</h2>
      </div>

      <div 
        className="prose prose-invert prose-p:text-gray-300 prose-strong:text-yellow-300 max-w-none mx-auto bg-black/20 border border-purple-400/20 rounded-lg p-6 my-6 text-gray-200 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: formattedJudgment }}
      >
      </div>
      
      <p className="text-center text-gray-400 my-8">
        Reflect upon this wisdom. Let it guide your path forward.
      </p>

      <div className="text-center">
        <button
          onClick={onNewCase}
          className="px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold rounded-lg shadow-lg hover:shadow-purple-500/40 transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500"
        >
          Present a New Case
        </button>
      </div>
    </div>
  );
};

export default JudgmentStage;
