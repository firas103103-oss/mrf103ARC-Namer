
import React, { useState } from 'react';
import type { CombinedUserData, PartnerData } from '../types';
import { DISAGREEMENT_OPTIONS, LOVE_LANGUAGES, COMMUNICATION_STYLES, CONFLICT_APPROACHES, RELATIONSHIP_HISTORY_OPTIONS } from '../constants';

interface UserInputFormProps {
  onSubmit: (data: CombinedUserData) => void;
  initialData: CombinedUserData | null;
  error: string | null;
}

const StepIndicator: React.FC<{ currentStep: number; totalSteps: number, stepLabels: string[] }> = ({ currentStep, totalSteps, stepLabels }) => {
  return (
    <div className="flex justify-center items-center mb-8">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const step = index + 1;
        const isCompleted = step < currentStep;
        const isActive = step === currentStep;
        return (
          <div key={step} className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
              isCompleted ? 'bg-emerald-500 text-white' : isActive ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-500'
            }`}>
              {isCompleted ? '✓' : step}
            </div>
            <p className={`mt-2 text-xs text-center font-semibold ${isActive ? 'text-blue-600' : 'text-slate-500'}`}>{stepLabels[index]}</p>
          </div>
        );
      })}
    </div>
  );
};

const defaultPartnerData: PartnerData = {
    name: '',
    age: 30,
    loveLanguage: LOVE_LANGUAGES[0],
    communicationStyle: COMMUNICATION_STYLES[0],
    conflictApproach: CONFLICT_APPROACHES[0],
    intimacyNeeds: '',
    personalGoals: '',
};

const UserInputForm: React.FC<UserInputFormProps> = ({ onSubmit, initialData, error }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<CombinedUserData>(
    initialData || {
      partnerOne: { ...defaultPartnerData },
      partnerTwo: { ...defaultPartnerData },
      shared: {
        relationshipHistory: 'stable',
        sharedGoals: '',
        keyDisagreements: [],
        additionalDetails: '',
      }
    }
  );

  const handlePartnerChange = (partner: 'partnerOne' | 'partnerTwo', e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [partner]: {
        ...prev[partner],
        [name]: name === 'age' ? parseInt(value, 10) : value,
      }
    }));
  };
  
  const handleSharedChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      shared: {
        ...prev.shared,
        [name]: value,
      }
    }));
  };

  const handleCheckboxChange = (option: string) => {
    setFormData((prev) => {
      const newDisagreements = prev.shared.keyDisagreements.includes(option)
        ? prev.shared.keyDisagreements.filter((item) => item !== option)
        : [...prev.shared.keyDisagreements, option];
      return { ...prev, shared: {...prev.shared, keyDisagreements: newDisagreements} };
    });
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const renderPartnerForm = (partner: 'partnerOne' | 'partnerTwo', title: string) => (
    <div className="animate-fade-in space-y-6">
       <h2 className="text-2xl font-bold mb-6 text-center">{title}</h2>
       <div>
            <label htmlFor={`${partner}-loveLanguage`} className="block text-sm font-semibold text-slate-700 mb-2">Primary Love Language</label>
            <select name="loveLanguage" id={`${partner}-loveLanguage`} value={formData[partner].loveLanguage} onChange={e => handlePartnerChange(partner, e)} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                {LOVE_LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
            </select>
       </div>
       <div>
           <label htmlFor={`${partner}-communicationStyle`} className="block text-sm font-semibold text-slate-700 mb-2">Typical Communication Style</label>
           <select name="communicationStyle" id={`${partner}-communicationStyle`} value={formData[partner].communicationStyle} onChange={e => handlePartnerChange(partner, e)} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                {COMMUNICATION_STYLES.map(style => <option key={style} value={style}>{style}</option>)}
            </select>
       </div>
       <div>
           <label htmlFor={`${partner}-conflictApproach`} className="block text-sm font-semibold text-slate-700 mb-2">Approach to Conflict</label>
           <select name="conflictApproach" id={`${partner}-conflictApproach`} value={formData[partner].conflictApproach} onChange={e => handlePartnerChange(partner, e)} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                {CONFLICT_APPROACHES.map(approach => <option key={approach} value={approach}>{approach}</option>)}
            </select>
       </div>
        <div>
            <label htmlFor={`${partner}-intimacyNeeds`} className="block text-sm font-semibold text-slate-700 mb-2">What does emotional and physical intimacy mean to you?</label>
            <textarea name="intimacyNeeds" id={`${partner}-intimacyNeeds`} value={formData[partner].intimacyNeeds} onChange={e => handlePartnerChange(partner, e)} rows={3} placeholder="e.g., 'Feeling heard and understood', 'Spontaneous affection'..." className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea>
       </div>
       <div>
            <label htmlFor={`${partner}-personalGoals`} className="block text-sm font-semibold text-slate-700 mb-2">What are your key personal goals right now?</label>
            <textarea name="personalGoals" id={`${partner}-personalGoals`} value={formData[partner].personalGoals} onChange={e => handlePartnerChange(partner, e)} rows={3} placeholder="e.g., 'Career advancement', 'Learning a new skill'..." className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea>
       </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="p-8 md:p-12">
      <StepIndicator currentStep={step} totalSteps={5} stepLabels={["The Couple", `${formData.partnerOne.name || 'P1'}'s View`, `${formData.partnerTwo.name || 'P2'}'s View`, "Shared Story", "Final Details"]} />

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>}

      {step === 1 && (
        <div className="animate-fade-in">
          <h2 className="text-2xl font-bold mb-6 text-center">About the Couple</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-4 rounded-lg border">
              <label htmlFor="partnerOne-name" className="block text-sm font-semibold text-slate-700 mb-1">Partner One's Name</label>
              <input type="text" name="name" id="partnerOne-name" value={formData.partnerOne.name} onChange={e => handlePartnerChange('partnerOne', e)} required className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              <label htmlFor="partnerOne-age" className="block text-sm font-semibold text-slate-700 mt-4 mb-1">Age</label>
              <input type="number" name="age" id="partnerOne-age" value={formData.partnerOne.age} onChange={e => handlePartnerChange('partnerOne', e)} required min="18" max="120" className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border">
              <label htmlFor="partnerTwo-name" className="block text-sm font-semibold text-slate-700 mb-1">Partner Two's Name</label>
              <input type="text" name="name" id="partnerTwo-name" value={formData.partnerTwo.name} onChange={e => handlePartnerChange('partnerTwo', e)} required className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              <label htmlFor="partnerTwo-age" className="block text-sm font-semibold text-slate-700 mt-4 mb-1">Age</label>
              <input type="number" name="age" id="partnerTwo-age" value={formData.partnerTwo.age} onChange={e => handlePartnerChange('partnerTwo', e)} required min="18" max="120" className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>
        </div>
      )}

      {step === 2 && renderPartnerForm('partnerOne', `${formData.partnerOne.name}'s Perspective`)}
      {step === 3 && renderPartnerForm('partnerTwo', `${formData.partnerTwo.name}'s Perspective`)}

      {step === 4 && (
        <div className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 text-center">Your Shared Story</h2>
             <div>
                <label htmlFor="relationshipHistory" className="block text-sm font-semibold text-slate-700 mb-2">What is your relationship history?</label>
                <select name="relationshipHistory" id="relationshipHistory" value={formData.shared.relationshipHistory} onChange={handleSharedChange} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                    {Object.entries(RELATIONSHIP_HISTORY_OPTIONS).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
                </select>
            </div>
            <div className="mt-6">
                <h3 className="text-lg font-semibold text-slate-700 mb-4 text-center">Areas for Growth</h3>
                <p className="text-center text-slate-600 mb-6">Select the key areas where you face disagreements or wish to improve.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {DISAGREEMENT_OPTIONS.map((option) => (
                    <label key={option} className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                        formData.shared.keyDisagreements.includes(option) ? 'bg-blue-100 border-blue-500 ring-2 ring-blue-500' : 'bg-white border-slate-300 hover:bg-slate-50'
                    }`}>
                        <input type="checkbox" checked={formData.shared.keyDisagreements.includes(option)} onChange={() => handleCheckboxChange(option)} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                        <span className="ml-3 text-sm font-medium text-slate-700">{option}</span>
                    </label>
                    ))}
                </div>
            </div>
        </div>
      )}

      {step === 5 && (
        <div className="animate-fade-in">
          <h2 className="text-2xl font-bold mb-6 text-center">Final Details</h2>
          <div className="mb-6">
            <label htmlFor="sharedGoals" className="block text-sm font-semibold text-slate-700 mb-2">What are your most important shared goals for the future?</label>
            <textarea name="sharedGoals" id="sharedGoals" value={formData.shared.sharedGoals} onChange={handleSharedChange} rows={3} placeholder="e.g., 'Buying a house', 'Traveling together', 'Starting a family'..." className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea>
          </div>
          <div>
            <label htmlFor="additionalDetails" className="block text-sm font-semibold text-slate-700 mb-2">Any other specific situations, values, or details to consider?</label>
            <textarea name="additionalDetails" id="additionalDetails" value={formData.shared.additionalDetails} onChange={handleSharedChange} rows={4} placeholder="e.g., 'We argue about how loudly we speak,' or 'We value weekly date nights.'" className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea>
          </div>
        </div>
      )}

      <div className="mt-10 flex justify-between">
        {step > 1 ? (
          <button type="button" onClick={prevStep} className="px-6 py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg shadow-sm hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-all">Back</button>
        ) : <div></div>}
        {step < 5 ? (
          <button type="button" onClick={nextStep} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all">Next</button>
        ) : (
          <button type="submit" className="px-6 py-2 bg-emerald-600 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all">Generate Blueprint</button>
        )}
      </div>
    </form>
  );
};

export default UserInputForm;
