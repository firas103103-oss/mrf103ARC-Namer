
import React, { useState } from 'react';
import type { UserData } from '../types';
import { DISAGREEMENT_OPTIONS } from '../constants';

interface UserInputFormProps {
  onSubmit: (data: UserData) => void;
  initialData: UserData | null;
  error: string | null;
}

const StepIndicator: React.FC<{ currentStep: number; totalSteps: number }> = ({ currentStep, totalSteps }) => {
  return (
    <div className="flex justify-center items-center space-x-2 mb-8">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const step = index + 1;
        const isCompleted = step < currentStep;
        const isActive = step === currentStep;
        return (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
              isCompleted ? 'bg-emerald-500 text-white' : isActive ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-500'
            }`}>
              {isCompleted ? '✓' : step}
            </div>
            {step < totalSteps && <div className={`h-0.5 w-8 transition-all duration-300 ${isCompleted || isActive ? 'bg-blue-500' : 'bg-slate-200'}`}></div>}
          </div>
        );
      })}
    </div>
  );
};


const UserInputForm: React.FC<UserInputFormProps> = ({ onSubmit, initialData, error }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<UserData>(
    initialData || {
      partnerOneName: '',
      partnerOneAge: 30,
      partnerTwoName: '',
      partnerTwoAge: 30,
      relationshipHistory: 'stable',
      disagreements: [],
      additionalDetails: '',
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name.includes('Age') ? parseInt(value, 10) : value }));
  };

  const handleCheckboxChange = (option: string) => {
    setFormData((prev) => {
      const newDisagreements = prev.disagreements.includes(option)
        ? prev.disagreements.filter((item) => item !== option)
        : [...prev.disagreements, option];
      return { ...prev, disagreements: newDisagreements };
    });
  };

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="p-8 md:p-12">
      <StepIndicator currentStep={step} totalSteps={4} />

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>}

      {step === 1 && (
        <div className="animate-fade-in">
          <h2 className="text-2xl font-bold mb-6 text-center">About the Couple</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-4 rounded-lg border">
              <label htmlFor="partnerOneName" className="block text-sm font-semibold text-slate-700 mb-1">Partner One's Name</label>
              <input type="text" name="partnerOneName" id="partnerOneName" value={formData.partnerOneName} onChange={handleChange} required className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              <label htmlFor="partnerOneAge" className="block text-sm font-semibold text-slate-700 mt-4 mb-1">Age</label>
              <input type="number" name="partnerOneAge" id="partnerOneAge" value={formData.partnerOneAge} onChange={handleChange} required min="18" max="120" className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border">
              <label htmlFor="partnerTwoName" className="block text-sm font-semibold text-slate-700 mb-1">Partner Two's Name</label>
              <input type="text" name="partnerTwoName" id="partnerTwoName" value={formData.partnerTwoName} onChange={handleChange} required className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
              <label htmlFor="partnerTwoAge" className="block text-sm font-semibold text-slate-700 mt-4 mb-1">Age</label>
              <input type="number" name="partnerTwoAge" id="partnerTwoAge" value={formData.partnerTwoAge} onChange={handleChange} required min="18" max="120" className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 text-center">Relationship Context</h2>
            <div className="space-y-4">
                <div>
                    <label htmlFor="relationshipHistory" className="block text-sm font-semibold text-slate-700 mb-2">What is your relationship history?</label>
                    <p className="text-xs text-slate-500 mb-2">This helps the AI set the right tone for the preamble.</p>
                    <select name="relationshipHistory" id="relationshipHistory" value={formData.relationshipHistory} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                        <option value="stable">Generally stable, working on improvements</option>
                        <option value="separated">Have been separated in the past</option>
                        <option value="divorced">Have been divorced in the past</option>
                        <option value="other">It's complicated</option>
                    </select>
                </div>
            </div>
        </div>
      )}
      
      {step === 3 && (
        <div className="animate-fade-in">
          <h2 className="text-2xl font-bold mb-6 text-center">Areas for Growth</h2>
          <p className="text-center text-slate-600 mb-6">Select the key areas where you face disagreements or wish to improve. This will be the focus of your constitution.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {DISAGREEMENT_OPTIONS.map((option) => (
              <label key={option} className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                formData.disagreements.includes(option) ? 'bg-blue-100 border-blue-500 ring-2 ring-blue-500' : 'bg-white border-slate-300 hover:bg-slate-50'
              }`}>
                <input type="checkbox" checked={formData.disagreements.includes(option)} onChange={() => handleCheckboxChange(option)} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                <span className="ml-3 text-sm font-medium text-slate-700">{option}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="animate-fade-in">
          <h2 className="text-2xl font-bold mb-6 text-center">Additional Details</h2>
          <p className="text-center text-slate-600 mb-6">Are there any specific situations, values, or details you want the AI to consider? (e.g., "We argue about how loudly we speak," or "We value weekly date nights.")</p>
          <textarea name="additionalDetails" value={formData.additionalDetails} onChange={handleChange} rows={6} placeholder="Provide any extra context here..." className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea>
        </div>
      )}

      <div className="mt-10 flex justify-between">
        {step > 1 ? (
          <button type="button" onClick={prevStep} className="px-6 py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg shadow-sm hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-all">Back</button>
        ) : <div></div>}
        {step < 4 ? (
          <button type="button" onClick={nextStep} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all">Next</button>
        ) : (
          <button type="submit" className="px-6 py-2 bg-emerald-600 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all">Generate Constitution</button>
        )}
      </div>
    </form>
  );
};

export default UserInputForm;
