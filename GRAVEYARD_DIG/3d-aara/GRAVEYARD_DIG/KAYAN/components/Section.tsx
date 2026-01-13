
import React from 'react';

interface SectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Section: React.FC<SectionProps> = ({ title, icon, children }) => {
  return (
    <section className="mb-20">
      <div className="flex items-center mb-8">
        {icon}
        <h2 className="text-3xl md:text-4xl font-bold text-gray-100 mr-4 font-cairo">{title}</h2>
        <div className="flex-grow h-px bg-gradient-to-l from-teal-400/50 to-transparent"></div>
      </div>
      <div className="pr-4 md:pr-12">
        {children}
      </div>
    </section>
  );
};
