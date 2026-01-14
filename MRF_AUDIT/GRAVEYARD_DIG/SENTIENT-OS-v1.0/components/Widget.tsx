
import React from 'react';

interface WidgetProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

const Widget: React.FC<WidgetProps> = ({ title, children, className = '', icon }) => {
  return (
    <div
      className={`bg-slate-900/40 border border-sky-400/20 p-4 flex flex-col backdrop-blur-sm animate-fade-in ${className}`}
      style={{ animation: 'fadeIn 0.5s ease-in-out' }}
    >
      <h3 className="text-sm font-bold text-sky-300 mb-3 flex items-center space-x-2 border-b border-sky-400/20 pb-2">
        {icon}
        <span className="text-glow">{title.toUpperCase()}</span>
      </h3>
      <div className="flex-grow overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default Widget;
