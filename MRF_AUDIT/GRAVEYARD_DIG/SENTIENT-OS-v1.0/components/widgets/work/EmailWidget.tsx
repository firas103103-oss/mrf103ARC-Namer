
import React from 'react';
import Widget from '../../Widget';
import { Email } from '../../../types';
import { EnvelopeIcon } from '../../icons';

const mockEmails: Email[] = [
  { id: 1, from: 'Alice Johnson', subject: 'Project Phoenix Update', snippet: 'Just wanted to share the latest progress...', read: false },
  { id: 2, from: 'Bob Williams', subject: 'Q4 Budget Meeting', snippet: 'Hi team, please find the agenda attached...', read: false },
  { id: 3, from: 'HR Department', subject: 'Holiday Schedule Announcement', snippet: 'Please be advised of the upcoming office closures...', read: true },
  { id: 4, from: 'IT Support', subject: 'Scheduled Maintenance', snippet: 'Our systems will be down for scheduled maintenance...', read: true },
  { id: 5, from: 'Charlie Brown', subject: 'Re: Design Mockups', snippet: 'These look great! Just a few minor suggestions...', read: false },
];

const EmailWidget: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <Widget title="Inbox" className={className} icon={<EnvelopeIcon className="w-4 h-4"/>}>
      <ul className="space-y-2">
        {mockEmails.map(email => (
          <li
            key={email.id}
            className={`p-2 rounded-md transition-all duration-200 cursor-pointer ${
              !email.read ? 'bg-sky-900/50 border-l-4 border-sky-400' : 'bg-slate-800/50'
            }`}
          >
            <p className={`font-semibold text-sm ${!email.read ? 'text-sky-200' : 'text-slate-300'}`}>{email.from}</p>
            <p className="text-xs text-slate-300 truncate">{email.subject}</p>
          </li>
        ))}
      </ul>
    </Widget>
  );
};

export default EmailWidget;
