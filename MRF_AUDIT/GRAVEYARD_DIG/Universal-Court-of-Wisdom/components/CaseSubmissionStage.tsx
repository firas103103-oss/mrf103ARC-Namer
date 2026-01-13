
import React, { useState } from 'react';
import { CaseDetails } from '../types';
import IconComponents from './IconComponents';

interface CaseSubmissionStageProps {
  onSubmit: (details: CaseDetails) => void;
  error: string;
  isLoading: boolean;
}

const CaseSubmissionStage: React.FC<CaseSubmissionStageProps> = ({ onSubmit, error, isLoading }) => {
  const [title, setTitle] = useState('');
  const [partiesInvolved, setPartiesInvolved] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && description) {
      onSubmit({ title, partiesInvolved, description });
    }
  };

  return (
    <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl p-8 animate-fade-in">
      <div className="text-center mb-8">
        <IconComponents.ScaleIcon className="w-10 h-10 text-yellow-300 mx-auto mb-4" />
        <h2 className="text-3xl font-cinzel font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-400">Present Your Case</h2>
        <p className="text-gray-300 mt-2">Detail the matter upon which you seek guidance. Be thorough and truthful.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">Title of the Case</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., The Matter of the Broken Promise"
            required
            className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          />
        </div>
        <div>
          <label htmlFor="parties" className="block text-sm font-medium text-gray-300 mb-1">Parties Involved (optional)</label>
          <input
            id="parties"
            type="text"
            value={partiesInvolved}
            onChange={(e) => setPartiesInvolved(e.target.value)}
            placeholder="e.g., Myself and a former friend"
            className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Description of the Matter</label>
          <textarea
            id="description"
            rows={8}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the situation in detail. What happened? What are the core points of conflict or confusion? What questions do you have for the council?"
            required
            className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          />
        </div>

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        
        <div className="text-center pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="px-10 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 font-bold rounded-lg shadow-lg hover:shadow-yellow-400/40 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-wait focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-amber-400"
          >
            {isLoading ? 'Submitting to the Cosmos...' : 'Submit for Judgment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CaseSubmissionStage;
