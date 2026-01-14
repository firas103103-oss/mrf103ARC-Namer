
import React from 'react';
import EmailWidget from './EmailWidget';
import ProjectsWidget from './ProjectsWidget';
import MetricsWidget from './MetricsWidget';

const WorkDashboard: React.FC = () => {
  return (
    <div className="w-full h-full grid grid-cols-5 grid-rows-2 gap-4 p-4">
      <EmailWidget className="col-span-2 row-span-2" />
      <ProjectsWidget className="col-span-3 row-span-1" />
      <MetricsWidget className="col-span-3 row-span-1" />
    </div>
  );
};

export default WorkDashboard;
