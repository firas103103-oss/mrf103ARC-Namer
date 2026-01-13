
import React from 'react';
import Widget from '../../Widget';
import { Project } from '../../../types';
import { BeakerIcon } from '../../icons';

const mockProjects: Project[] = [
    { id: 1, name: 'Project Titan', progress: 75, status: 'On Track' },
    { id: 2, name: 'Orion Initiative', progress: 40, status: 'At Risk' },
    { id: 3, name: 'Nebula Platform', progress: 95, status: 'On Track' },
    { id: 4, name: 'Odyssey Rollout', progress: 20, status: 'Delayed' },
];

const statusColor = {
    'On Track': 'bg-green-500',
    'At Risk': 'bg-yellow-500',
    'Delayed': 'bg-red-500',
};

const ProjectsWidget: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <Widget title="Project Tracker" className={className} icon={<BeakerIcon className="w-4 h-4"/>}>
      <div className="space-y-4">
        {mockProjects.map(project => (
          <div key={project.id}>
            <div className="flex justify-between items-center mb-1 text-sm">
              <span className="font-medium text-slate-200">{project.name}</span>
              <span className={`${statusColor[project.status].replace('bg-','text-')} font-bold`}>{project.progress}%</span>
            </div>
            <div className="w-full bg-slate-700/50 h-2">
              <div
                className={`${statusColor[project.status]} h-2 transition-all duration-500`}
                style={{ width: `${project.progress}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </Widget>
  );
};

export default ProjectsWidget;
