
import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-violet-500"></div>
      <p className="mt-4 text-slate-300">Generating New Perspective...</p>
    </div>
  );
};
