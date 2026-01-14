
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="text-center p-8 border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm">
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-cyan-400">
          AR Perspective Display
        </span>
      </h1>
      <p className="mt-4 text-lg text-slate-400 max-w-3xl mx-auto">
        An AI-powered simulator that brings futuristic augmented reality concepts to life. Choose a lens, manipulate reality, and see the world from profound new vantage points.
      </p>
    </header>
  );
};
