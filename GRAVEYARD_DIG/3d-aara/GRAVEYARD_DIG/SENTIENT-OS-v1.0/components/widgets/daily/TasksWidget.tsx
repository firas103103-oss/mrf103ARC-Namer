
import React, { useState } from 'react';
import Widget from '../../Widget';
import { Task } from '../../../types';
import { CheckCircleIcon, ListBulletIcon } from '../../icons';

const initialTasks: Task[] = [
  { id: 1, text: 'Finalize Q3 project proposal', completed: false, priority: 'High' },
  { id: 2, text: 'Schedule team sync meeting', completed: true, priority: 'Medium' },
  { id: 3, text: 'Reply to client emails', completed: false, priority: 'Medium' },
  { id: 4, text: 'Book flight for conference', completed: false, priority: 'Low' },
  { id: 5, text: 'Submit expense report', completed: false, priority: 'High' },
];

const priorityColor = {
    High: 'text-red-400',
    Medium: 'text-yellow-400',
    Low: 'text-sky-400'
}

const TasksWidget: React.FC<{ className?: string }> = ({ className }) => {
  const [tasks, setTasks] = useState(initialTasks);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(task => (task.id === id ? { ...task, completed: !task.completed } : task)));
  };

  return (
    <Widget title="Today's Tasks" className={className} icon={<ListBulletIcon className="w-4 h-4"/>}>
      <ul className="space-y-3">
        {tasks.map(task => (
          <li
            key={task.id}
            onClick={() => toggleTask(task.id)}
            className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-all duration-200 ${task.completed ? 'bg-green-500/10' : 'bg-slate-800/50 hover:bg-slate-700/50'}`}
          >
            <div className="flex items-center space-x-3">
               <div className={`w-2 h-2 rounded-full ${priorityColor[task.priority]}`}></div>
               <span className={`text-sm ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                {task.text}
              </span>
            </div>
             {task.completed && <CheckCircleIcon className="w-5 h-5 text-green-400" />}
          </li>
        ))}
      </ul>
    </Widget>
  );
};

export default TasksWidget;
