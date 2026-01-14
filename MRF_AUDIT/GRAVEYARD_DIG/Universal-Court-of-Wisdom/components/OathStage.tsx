
import React, { useState } from 'react';
import IconComponents from './IconComponents';

interface OathStageProps {
  onSwearOath: () => void;
}

const OathStage: React.FC<OathStageProps> = ({ onSwearOath }) => {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl p-8 text-center animate-fade-in">
      <div className="flex justify-center items-center mb-6">
        <IconComponents.QuillIcon className="w-10 h-10 text-yellow-300" />
      </div>
      <h2 className="text-3xl font-cinzel font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-400 mb-4">The Oath of Clarity</h2>
      <p className="text-gray-300 mb-8 max-w-xl mx-auto">
        Truth is the foundation of wisdom. Before you proceed, you must swear this binding oath to ensure the integrity of your submission and our judgment.
      </p>

      <div className="bg-black/20 border border-purple-400/20 rounded-lg p-6 text-left text-gray-200 italic mb-8">
        "I vow to present my case with honesty, free from deceit and deliberate omission. I will speak my truth as I perceive it, and I will accept the judgment rendered with an open mind and a willing heart, for I seek not victory, but understanding."
      </div>
      
      <div className="flex items-center justify-center space-x-3 mb-8">
        <input 
            type="checkbox"
            id="agree-oath"
            checked={agreed}
            onChange={() => setAgreed(!agreed)}
            className="w-5 h-5 bg-gray-700 border-gray-600 rounded text-purple-500 focus:ring-purple-600 cursor-pointer"
        />
        <label htmlFor="agree-oath" className="text-gray-300 cursor-pointer">I understand and swear this oath.</label>
      </div>

      <button
        onClick={onSwearOath}
        disabled={!agreed}
        className="px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold rounded-lg shadow-lg hover:shadow-purple-500/40 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500"
      >
        I Swear the Oath
      </button>
    </div>
  );
};

export default OathStage;
