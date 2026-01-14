
import React from 'react';
import Widget from '../../Widget';
import { PhoneIcon, PhoneXMarkIcon, UserCircleIcon } from '../../icons';

const CallsWidget: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <Widget title="Incoming Call" className={className} icon={<PhoneIcon className="w-4 h-4"/>}>
        <div className="h-full flex flex-col items-center justify-center text-center">
            <UserCircleIcon className="w-16 h-16 text-slate-500 mb-2"/>
            <p className="text-lg font-bold text-sky-200">Jane Doe</p>
            <p className="text-sm text-slate-400">Mobile</p>
            <div className="flex items-center space-x-6 mt-4">
                <button className="p-3 bg-red-500/30 rounded-full hover:bg-red-500/50 text-red-300 transition-colors">
                    <PhoneXMarkIcon className="w-7 h-7"/>
                </button>
                <button className="p-3 bg-green-500/30 rounded-full hover:bg-green-500/50 text-green-300 transition-colors">
                    <PhoneIcon className="w-7 h-7"/>
                </button>
            </div>
        </div>
    </Widget>
  );
};

export default CallsWidget;
