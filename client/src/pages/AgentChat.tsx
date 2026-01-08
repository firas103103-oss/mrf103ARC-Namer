/**
 * 💬 Agent Chat - محادثة مع الوكلاء
 * التواصل المباشر مع أي وكيل من الـ 31 وكيل
 */

import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User as UserIcon, Sparkles, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'agent';
  agentName?: string;
  content: string;
  timestamp: Date;
  confidence?: number;
  actions?: string[];
  usingAI?: boolean;
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
  const [isLoading, setIsLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState<'ai' | 'simulated'>('simulated');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const agents = [
    { id: 'mrf_ceo', name: 'MRF', icon: '👑', color: '#FFD700', layer: 'CEO' },
    { id: 'maestro_security', name: 'Cipher', icon: '🛡️', color: '#DC2626', layer: 'Maestro' },
    { id: 'maestro_finance', name: 'Vault', icon: '💰', color: '#059669', layer: 'Maestro' },
    { id: 'maestro_legal', name: 'Lexis', icon: '⚖️', color: '#7C3AED', layer: 'Maestro' },
    { id: 'maestro_life', name: 'Harmony', icon: '🏠', color: '#EC4899', layer: 'Maestro' },
    { id: 'maestro_rnd', name: 'Nova', icon: '🔬', color: '#0EA5E9', layer: 'Maestro' },
    { id: 'maestro_xbio', name: 'Scent', icon: '🧬', color: '#14B8A6', layer: 'Maestro' },
    { id: 'aegis', name: 'Aegis', icon: '🔥', color: '#EF4444', layer: 'Specialist' },
    { id: 'phantom', name: 'Phantom', icon: '🔐', color: '#6B7280', layer: 'Specialist' },
    { id: 'darwin', name: 'Darwin', icon: '🧬', color: '#38BDF8', layer: 'Specialist' }
  ];

  // Check AI status on mount
  useEffect(() => {
    fetch('/api/arc/chat/status')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAiStatus(data.data.mode);
        }
      })
      .catch(err => console.error('Failed to check AI status:', err));
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages([...messages, newMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Call real API
      const response = await fetch('/api/arc/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedAgent,
          message: inputMessage,
          userId: 'user_' + Date.now() // In production, use real user ID
        })
      });

      const data = await response.json();

      if (data.success) {
        const agentResponse: Message = {
          id: data.data.id,
          sender: 'agent',
          agentName: data.data.agentName,
          content: data.data.message,
          timestamp: new Date(data.data.timestamp),
          confidence: data.data.confidence,
          actions: data.data.actions,
          usingAI: data.data.usingAI
        };
        setMessages(prev => [...prev, agentResponse]);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      // Fallback response
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        agentName: agents.find(a => a.id === selectedAgent)?.name,
        content: 'عذراً، حدث خطأ أثناء معالجة رسالتك. يرجى المحاولة مرة أخرى.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
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
            className="p-4 border-b border-gray-700 flex items-center justify-between"
            style={{ borderLeftColor: selectedAgentInfo?.color, borderLeftWidth: '4px' }}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{selectedAgentInfo?.icon}</span>
              <div>
                <div className="font-bold text-lg">{selectedAgentInfo?.name}</div>
                <div className="text-sm text-gray-400">{selectedAgentInfo?.layer}</div>
              </div>
            </div>
            {/* AI Status Badge */}
            <div className={`px-3 py-1 rounded-full text-xs flex items-center gap-2 ${
              aiStatus === 'ai' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
            }`}>
              {aiStatus === 'ai' ? (
                <>
                  <Sparkles className="w-3 h-3" />
                  <span>AI Powered</span>
                </>
              ) : (
                <>
                  <Bot className="w-3 h-3" />
                  <span>Simulated</span>
                </>
              )}
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
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-blue-400" />
                  </div>
                )}
                <div
                  className={`max-w-[70%] rounded-lg p-4 ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700/50 border border-gray-600'
                  }`}
                >
                  {message.sender === 'agent' && (
                    <div className="font-bold text-sm mb-1 text-blue-400 flex items-center gap-2">
                      {message.agentName}
                      {message.usingAI && (
                        <Sparkles className="w-3 h-3 text-green-400" />
                      )}
                    </div>
                  )}
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  
                  {/* Actions if present */}
                  {message.actions && message.actions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-600">
                      <div className="text-xs text-gray-400 mb-2">Suggested Actions:</div>
                      {message.actions.map((action, idx) => (
                        <div key={idx} className="text-xs text-gray-300 mb-1">
                          • {action}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Confidence if present */}
                  {message.confidence !== undefined && (
                    <div className="mt-2 text-xs text-gray-400">
                      Confidence: {message.confidence}%
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-400 mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
                {message.sender === 'user' && (
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <UserIcon className="w-5 h-5 text-green-400" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                </div>
                <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex gap-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                placeholder="اكتب رسالتك هنا..."
                className="flex-1 bg-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading}
                className="px-6 py-3 bg-blue-500 rounded-lg hover:bg-blue-600 transition-all flex items-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
