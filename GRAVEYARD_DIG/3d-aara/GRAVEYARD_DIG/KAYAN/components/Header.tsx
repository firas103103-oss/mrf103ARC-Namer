
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="py-20 text-center">
      <h1 className="font-orbitron text-5xl md:text-7xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-blue-400 to-teal-200 animate-gradient-x">
        KAYAN
      </h1>
      <p className="mt-4 text-xl md:text-2xl text-gray-400 tracking-wider">
        The Master Blueprint / المخطط الرئيسي
      </p>
    </header>
  );
};
