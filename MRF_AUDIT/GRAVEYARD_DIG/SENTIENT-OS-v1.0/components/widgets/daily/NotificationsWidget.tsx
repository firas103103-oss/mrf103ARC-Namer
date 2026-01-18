
import React from 'react';
import Widget from '../../Widget';
import { Notification } from '../../../types';
import { BellIcon } from '../../icons';

const mockNotifications: Notification[] = [
  { id: 1, app: 'Calendar', title: 'Project Titan Sync', message: 'Starts in 15 minutes', time: '10:45 AM' },
  { id: 2, app: 'Email', title: 'Re: Q3 Proposal', message: 'John Doe has replied', time: '10:30 AM' },
  { id: 3, app: 'System', title: 'Backup Complete', message: 'Your files are securely backed up.', time: '10:05 AM' },
  { id: 4, app: 'Weather', title: 'Rain Alert', message: 'Light rain expected around noon.', time: '9:50 AM' },
];

const NotificationsWidget: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <Widget title="Notifications" className={className} icon={<BellIcon className="w-4 h-4"/>}>
      <ul className="space-y-3">
        {mockNotifications.map(notif => (
          <li key={notif.id} className="p-2 bg-slate-800/50 rounded-md border-l-4 border-sky-400">
            <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
              <span>{notif.app}</span>
              <span>{notif.time}</span>
            </div>
            <p className="font-semibold text-sm text-slate-200">{notif.title}</p>
            <p className="text-xs text-slate-300">{notif.message}</p>
          </li>
        ))}
      </ul>
    </Widget>
  );
};

export default NotificationsWidget;
