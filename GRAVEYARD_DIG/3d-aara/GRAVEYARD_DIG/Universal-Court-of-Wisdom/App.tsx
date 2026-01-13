
import React, { useState, useCallback } from 'react';
import { Stage, CaseDetails } from './types';
import WelcomeStage from './components/WelcomeStage';
import OathStage from './components/OathStage';
import CaseSubmissionStage from './components/CaseSubmissionStage';
import DeliberationStage from './components/DeliberationStage';
import JudgmentStage from './components/JudgmentStage';
import { getJudgment } from './services/geminiService';
import IconComponents from './components/IconComponents';

const App: React.FC = () => {
  const [currentStage, setCurrentStage] = useState<Stage>(Stage.WELCOME);
  const [caseDetails, setCaseDetails] = useState<CaseDetails | null>(null);
  const [judgment, setJudgment] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleBegin = () => {
    setCurrentStage(Stage.OATH);
  };

  const handleSwearOath = () => {
    setCurrentStage(Stage.SUBMISSION);
  };

  const handleSubmitCase = useCallback(async (details: CaseDetails) => {
    setCaseDetails(details);
    setCurrentStage(Stage.DELIBERATION);
    setIsLoading(true);
    setError('');
    try {
      const result = await getJudgment(details);
      setJudgment(result);
      setCurrentStage(Stage.JUDGMENT);
    } catch (err) {
      setError('The cosmos encountered an unexpected disturbance. Please try again.');
      setCurrentStage(Stage.SUBMISSION); // Go back to submission on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleNewCase = () => {
    setCurrentStage(Stage.WELCOME);
    setCaseDetails(null);
    setJudgment('');
    setError('');
  };

  const renderStage = () => {
    switch (currentStage) {
      case Stage.WELCOME:
        return <WelcomeStage onBegin={handleBegin} />;
      case Stage.OATH:
        return <OathStage onSwearOath={handleSwearOath} />;
      case Stage.SUBMISSION:
        return <CaseSubmissionStage onSubmit={handleSubmitCase} error={error} isLoading={isLoading} />;
      case Stage.DELIBERATION:
        return <DeliberationStage />;
      case Stage.JUDGMENT:
        return <JudgmentStage judgment={judgment} onNewCase={handleNewCase} />;
      default:
        return <WelcomeStage onBegin={handleBegin} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 text-white flex flex-col items-center justify-center p-4 selection:bg-purple-500 selection:text-white">
      <header className="absolute top-0 left-0 w-full p-6 flex items-center justify-center md:justify-start">
        <div className="flex items-center space-x-3">
          <IconComponents.ScaleIcon className="w-8 h-8 text-yellow-300" />
          <h1 className="text-xl font-cinzel font-bold tracking-widest text-gray-200">Universal Court of Wisdom</h1>
        </div>
      </header>
      
      <main className="w-full max-w-3xl">
        {renderStage()}
      </main>

      <footer className="absolute bottom-0 w-full p-4 text-center text-xs text-gray-500">
        The judgment rendered is a reflection of universal principles and is intended for guidance and contemplation.
      </footer>
    </div>
  );
};

export default App;
