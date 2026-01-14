
import React, { useState, useEffect } from 'react';
import Widget from '../../Widget';
import { BoltIcon, ThermometerIcon, ForwardIcon } from '../../icons';

const VehicleStatusWidget: React.FC<{ className?: string }> = ({ className }) => {
  const [speed, setSpeed] = useState(65);
  const [range, setRange] = useState(210);

  useEffect(() => {
    const interval = setInterval(() => {
      setSpeed(prev => {
        const change = Math.floor(Math.random() * 7) - 3;
        return Math.min(Math.max(prev + change, 40), 90);
      });
      setRange(prev => Math.max(prev - 1, 0));
    }, 2500);
    return () => clearInterval(interval);
  }, []);


  return (
    <Widget title="Vehicle Status" className={className} icon={<ForwardIcon className="w-4 h-4"/>}>
      <div className="h-full flex flex-col justify-around text-center">
        <div>
          <span className="text-4xl font-bold text-glow text-sky-300">{speed}</span>
          <span className="text-lg ml-2 text-slate-400">km/h</span>
        </div>
        <div className="flex justify-around items-center text-sm">
            <div className="flex items-center space-x-2">
                <BoltIcon className="w-5 h-5 text-green-400" />
                <span>{range} km</span>
            </div>
            <div className="flex items-center space-x-2">
                <ThermometerIcon className="w-5 h-5 text-orange-400" />
                <span>21°C</span>
            </div>
        </div>
      </div>
    </Widget>
  );
};

export default VehicleStatusWidget;
