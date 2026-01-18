
import React, { useState, useEffect } from 'react';
import Widget from '../../Widget';
import { HeartIcon, FireIcon, ShoeIcon } from '../../icons';

const VitalsWidget: React.FC<{ className?: string }> = ({ className }) => {
  const [heartRate, setHeartRate] = useState(72);
  const [steps, setSteps] = useState(4328);
  const [calories, setCalories] = useState(1240);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeartRate(prev => {
        const change = Math.floor(Math.random() * 5) - 2;
        return Math.min(Math.max(prev + change, 60), 90);
      });
      setSteps(prev => prev + Math.floor(Math.random() * 10));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Widget title="Biometric Vitals" className={className} icon={<HeartIcon className="w-4 h-4" />}>
      <div className="h-full flex flex-col justify-around text-lg">
        <div className="flex items-center justify-between">
          <span className="text-slate-300">Heart Rate</span>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-2xl text-red-400 text-glow">{heartRate}</span>
            <span className="text-sm text-slate-400">BPM</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-300">Steps</span>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-2xl text-sky-300 text-glow">{steps.toLocaleString()}</span>
            <ShoeIcon className="w-5 h-5 text-sky-300" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-300">Calories</span>
           <div className="flex items-center space-x-2">
            <span className="font-bold text-2xl text-orange-400 text-glow">{calories.toLocaleString()}</span>
            <FireIcon className="w-5 h-5 text-orange-400" />
          </div>
        </div>
      </div>
    </Widget>
  );
};

export default VitalsWidget;
