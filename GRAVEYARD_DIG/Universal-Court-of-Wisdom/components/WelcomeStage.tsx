
import React from 'react';
import { COUNCIL_MEMBERS } from '../constants';
import CouncilMember from './CouncilMember';
import IconComponents from './IconComponents';

interface WelcomeStageProps {
  onBegin: () => void;
}

const WelcomeStage: React.FC<WelcomeStageProps> = ({ onBegin }) => {
  return (
    <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl p-8 text-center animate-fade-in">
      <div className="flex justify-center items-center mb-6 space-x-4">
        <IconComponents.StarIcon className="w-8 h-8 text-yellow-300 animate-pulse" />
        <h2 className="text-3xl font-cinzel font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-400">Greetings, Seeker of Truth</h2>
        <IconComponents.StarIcon className="w-8 h-8 text-yellow-300 animate-pulse" />
      </div>

      <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
        You have arrived at the threshold of clarity. Before you stands the Universal Court of Wisdom, a confluence of timeless intellects. We exist beyond the veils of doubt to offer pure, unvarnished truth.
      </p>

      <div className="mb-10">
        <h3 className="font-cinzel text-xl text-gray-200 mb-6">The Council Presiding</h3>
        <div className="flex justify-center items-center space-x-8 md:space-x-16">
          {COUNCIL_MEMBERS.map(member => <CouncilMember key={member.name} member={member} />)}
        </div>
      </div>
      
      <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
        Present your case, your query, your conflict. We shall listen. We shall deliberate. And we shall render a judgment that resonates with the harmony of the cosmos.
      </p>

      <button
        onClick={onBegin}
        className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 font-bold rounded-lg shadow-lg hover:shadow-yellow-400/40 transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-amber-400"
      >
        Step Forward and Begin
      </button>
    </div>
  );
};

export default WelcomeStage;
