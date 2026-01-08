/**
 * 💬 Agent Chat - محادثة مع الوكلاء
 * التواصل المباشر مع أي وكيل من الـ 31 وكيل
 */

import { useState } from 'react';
import { Send, Bot, User as UserIcon } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'agent';
  agentName?: string;
  content: string;
  timestamp: Date;
}

export default function AgentChat() {
  const [selectedAgent, setSelectedAgent] = useState('mrf_ceo');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'agent',
      agentName: 'MRF',
      content: 'مرحباً! أنا MRF، النسخة الرقمية الخاصة بك. كيف يمكنني مساعدتك اليوم؟',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const agents = [
    { id: 'mrf_ceo', name: 'MRF', icon: '👑', color: '#FFD700', layer: 'CEO' },
    { id: 'cipher', name: 'Cipher', icon: '🛡️', color: '#DC2626', layer: 'Maestro' },
    { id: 'vault', name: 'Vault', icon: '💰', color: '#059669', layer: 'Maestro' },
    { id: 'lexis', name: 'Lexis', icon: '⚖️', color: '#7C3AED', layer: 'Maestro' },
    { id: 'harmony', name: 'Harmony', icon: '🏠', color: '#EC4899', layer: 'Maestro' },
    { id: 'nova', name: 'Nova', icon: '🔬', color: '#0EA5E9', layer: 'Maestro' },
    { id: 'scent', name: 'Scent', icon: '🧬', color: '#14B8A6', layer: 'Maestro' },
    { id: 'aegis', name: 'Aegis', icon: '🔥', color: '#EF4444', layer: 'Specialist' },
    { id: 'phantom', name: 'Phantom', icon: '🔐', color: '#6B7280', layer: 'Specialist' },
    { id: 'darwin', name: 'Darwin', icon: '🧬', color: '#38BDF8', layer: 'Specialist' }
  ];

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages([...messages, newMessage]);

    // Simulate agent response
    setTimeout(() => {
      const agentResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        agentName: agents.find(a => a.id === selectedAgent)?.name,
        content: 'شكراً على رسالتك. سأعمل على تنفيذ طلبك الآن.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, agentResponse]);
    }, 1000);

    setInputMessage('');
  };

  const selectedAgentInfo = agents.find(a => a.id === selectedAgent);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <span className="text-5xl">💬</span>
          Agent Chat
        </h1>
        <p className="text-gray-400 text-lg">محادثة مباشرة مع الوكلاء</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Agent Selector */}
        <div className="lg:col-span-1 bg-gray-800/50 rounded-lg p-4 border border-gray-700 h-fit">
          <h3 className="font-bold mb-4">Select Agent</h3>
          <div className="space-y-2">
            {agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent.id)}
                className={`w-full p-3 rounded-lg flex items-center gap-3 transition-all ${
                  selectedAgent === agent.id
                    ? 'bg-blue-500/20 border-2 border-blue-500'
                    : 'bg-gray-700/30 hover:bg-gray-700/50 border-2 border-transparent'
                }`}
              >
                <span className="text-2xl">{agent.icon}</span>
                <div className="text-left">
                  <div className="font-semibold">{agent.name}</div>
                  <div className="text-xs text-gray-400">{agent.layer}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-3 bg-gray-800/50 rounded-lg border border-gray-700 flex flex-col h-[600px]">
          {/* Chat Header */}
          <div 
            className="p-4 border-b border-gray-700 flex items-center gap-3"
            style={{ borderLeftColor: selectedAgentInfo?.color, borderLeftWidth: '4px' }}
          >
            <span className="text-3xl">{selectedAgentInfo?.icon}</span>
            <div>
              <div className="font-bold text-lg">{selectedAgentInfo?.name}</div>
              <div className="text-sm text-gray-400">{selectedAgentInfo?.layer}</div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.sender === 'agent' && (
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-blue-400" />
                  </div>
                )}
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.sender === 'user'
                      ? 'bg-blue-500/20 text-blue-100'
                      : 'bg-gray-700/50'
                  }`}
                >
                  {message.sender === 'agent' && (
                    <div className="text-xs text-gray-400 mb-1">{message.agentName}</div>
                  )}
                  <div>{message.content}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
                {message.sender === 'user' && (
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <UserIcon className="w-5 h-5 text-purple-400" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex gap-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="اكتب رسالتك هنا..."
                className="flex-1 bg-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSendMessage}
                className="px-6 py-3 bg-blue-500 rounded-lg hover:bg-blue-600 transition-all flex items-center gap-2 font-semibold"
              >
                <Send className="w-5 h-5" />
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
