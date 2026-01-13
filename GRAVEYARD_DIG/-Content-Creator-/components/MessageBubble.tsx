
import React from 'react';
import { Message, Sender } from '../types';
import { AiIcon, UserIcon, ExpertIcon } from './icons';

interface MessageBubbleProps {
  message: Message;
}

const getBubbleStyles = (sender: Sender): string => {
  switch (sender) {
    case 'user':
      return 'bg-blue-600 self-end rounded-br-none';
    case 'ai':
      return 'bg-[#2a2a3c] self-start rounded-bl-none';
    case 'expert-tip':
      return 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-200 self-start rounded-bl-none';
    default:
      return '';
  }
};

const getIcon = (sender: Sender) => {
    switch (sender) {
        case 'user':
            return <UserIcon />;
        case 'ai':
            return <AiIcon />;
        case 'expert-tip':
            return <ExpertIcon />;
        default:
            return null;
    }
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  const flexDirection = isUser ? 'flex-row-reverse' : 'flex-row';
  
  return (
    <div className={`flex items-start gap-3 max-w-2xl ${isUser ? 'self-end' : 'self-start'} ${flexDirection}`}>
      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gray-700 mt-1">
        {getIcon(message.sender)}
      </div>
      <div
        className={`px-4 py-3 rounded-2xl text-white ${getBubbleStyles(message.sender)}`}
        style={{ whiteSpace: 'pre-wrap' }}
      >
        {message.text}
      </div>
    </div>
  );
};
