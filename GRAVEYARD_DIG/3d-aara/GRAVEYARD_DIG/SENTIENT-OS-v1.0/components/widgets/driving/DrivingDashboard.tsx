
import React from 'react';
import NavigationWidget from './NavigationWidget';
import VehicleStatusWidget from './VehicleStatusWidget';
import MusicPlayerWidget from './MusicPlayerWidget';
import CallsWidget from './CallsWidget';

const DrivingDashboard: React.FC = () => {
  return (
    <div className="w-full h-full grid grid-cols-4 grid-rows-3 gap-4 p-4">
      <NavigationWidget className="col-span-3 row-span-3" />
      <VehicleStatusWidget className="col-span-1 row-span-1" />
      <MusicPlayerWidget className="col-span-1 row-span-1" />
      <CallsWidget className="col-span-1 row-span-1" />
    </div>
  );
};

export default DrivingDashboard;
