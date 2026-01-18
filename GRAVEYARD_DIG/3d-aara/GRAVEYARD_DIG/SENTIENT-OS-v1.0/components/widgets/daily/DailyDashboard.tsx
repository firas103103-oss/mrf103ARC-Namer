
import React from 'react';
import VitalsWidget from './VitalsWidget';
import TasksWidget from './TasksWidget';
import NotificationsWidget from './NotificationsWidget';
// FIX: Removed incorrect import for `MapPinIcon` which is not an exported member of `../../icons`. Also removed unused `Widget` import.
// Both were not used in this component.


const DailyDashboard: React.FC = () => {
  return (
    <div className="w-full h-full grid grid-cols-3 grid-rows-2 gap-4 p-4">
      <VitalsWidget className="col-span-1 row-span-1" />
      <TasksWidget className="col-span-2 row-span-2" />
      <NotificationsWidget className="col-span-1 row-span-1" />
    </div>
  );
};

export default DailyDashboard;