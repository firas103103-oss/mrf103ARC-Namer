
import React, { useState, useCallback } from 'react';
import UserInputForm from './components/UserInputForm';
import LoadingScreen from './components/LoadingScreen';
import BlueprintDisplay from './components/BlueprintDisplay';
import { generateBlueprint } from './services/geminiService';
import type { CombinedUserData, RelationshipBlueprint } from './types';
import { AppState } from './types';

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.FORM);
  const [userData, setUserData] = useState<CombinedUserData | null>(null);
  const [blueprint, setBlueprint] = useState<RelationshipBlueprint | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = useCallback(async (data: CombinedUserData) => {
    setUserData(data);
    setAppState(AppState.LOADING);
    setError(null);
    try {
      const result = await generateBlueprint(data);
      setBlueprint(result);
      setAppState(AppState.RESULT);
    } catch (err) {
      console.error(err);
      setError('An error occurred while generating the blueprint. Please check your connection and API key, then try again.');
      setAppState(AppState.FORM);
    }
  }, []);

  const handleRestart = () => {
    setAppState(AppState.FORM);
    setUserData(null);
    setBlueprint(null);
    setError(null);
  };
  
  const renderContent = () => {
    switch (appState) {
      case AppState.LOADING:
        return <LoadingScreen />;
      case AppState.RESULT:
        return blueprint && <BlueprintDisplay blueprint={blueprint} userData={userData!} onRestart={handleRestart} />;
      case AppState.FORM:
      default:
        return <UserInputForm onSubmit={handleFormSubmit} initialData={userData} error={error} />;
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
       <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900">Relationship Blueprint</h1>
            <p className="text-slate-600 mt-2 text-lg">Crafting Your Plan for a Stronger Partnership with AI</p>
        </header>
        <main className="bg-white rounded-2xl shadow-2xl shadow-slate-200/50 overflow-hidden">
          {renderContent()}
        </main>
        <footer className="text-center mt-8 text-slate-500 text-sm">
            <p>Powered by Gemini API. Designed for understanding and growth.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
