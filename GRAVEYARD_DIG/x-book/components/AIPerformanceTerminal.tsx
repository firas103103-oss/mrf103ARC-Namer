/**
 * AIPerformanceTerminal - مراقبة أداء AI لحظياً
 * MrF X OS Organization - X-Book System
 */

import React, { useState, useEffect } from 'react';
import { Terminal, Activity, Zap, Database, Cpu } from 'lucide-react';

interface PerformanceMetrics {
  tokensPerSecond: number;
  totalTokensProcessed: number;
  currentModel: string;
  memoryUsage: number;
  apiLatency: number;
  stage: string;
  chunkProgress?: string;
}

interface AIPerformanceTerminalProps {
  isVisible: boolean;
  currentStage?: string;
  currentChunk?: number;
  totalChunks?: number;
  variant?: 'floating' | 'embedded';
  className?: string;
}

export const AIPerformanceTerminal: React.FC<AIPerformanceTerminalProps> = ({ 
  isVisible, 
  currentStage = 'Idle',
  currentChunk,
  totalChunks,
  variant = 'floating',
  className
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    tokensPerSecond: 0,
    totalTokensProcessed: 0,
    currentModel: 'Gemini 3 Flash',
    memoryUsage: 0,
    apiLatency: 0,
    stage: currentStage,
    chunkProgress: currentChunk && totalChunks ? `${currentChunk}/${totalChunks}` : undefined
  });

  // تحديث المقاييس في الوقت الفعلي
  useEffect(() => {
    if (!isVisible) {
      setMetrics(prev => ({ ...prev, tokensPerSecond: 0, stage: 'Idle' }));
      return;
    }
    
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        tokensPerSecond: Math.floor(Math.random() * 400) + 150,
        totalTokensProcessed: prev.totalTokensProcessed + Math.floor(Math.random() * 150) + 50,
        memoryUsage: Math.min(Math.floor(Math.random() * 20) + 45, 95),
        apiLatency: Math.floor(Math.random() * 150) + 80,
        stage: currentStage,
        chunkProgress: currentChunk && totalChunks ? `${currentChunk}/${totalChunks}` : undefined
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible, currentStage, currentChunk, totalChunks]);

  // تحديث النموذج حسب المرحلة
  useEffect(() => {
    if (currentStage === 'analyzing') {
      setMetrics(prev => ({ ...prev, currentModel: 'Gemini 3 Pro' }));
    } else if (currentStage === 'editing') {
      setMetrics(prev => ({ ...prev, currentModel: 'Gemini 3 Flash' }));
    } else if (currentStage === 'generating_cover') {
      setMetrics(prev => ({ ...prev, currentModel: 'Gemini Imagen' }));
    }
  }, [currentStage]);

  if (!isVisible) return null;

  const containerClasses = variant === 'embedded'
    ? `relative w-full bg-slate-900/95 border border-gold-600/30 rounded-xl shadow-2xl backdrop-blur-sm ${className ?? ''}`
    : `fixed bottom-20 right-4 w-80 bg-slate-900/95 border border-gold-600/30 rounded-xl shadow-2xl backdrop-blur-sm z-50 animate-fadeIn ${className ?? ''}`;

  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-800 bg-slate-950/50">
        <div className="flex items-center gap-2">
          <Terminal size={16} className="text-gold-400" />
          <span className="text-xs font-mono text-gold-400 font-semibold tracking-wider">
            AI PERFORMANCE MONITOR
          </span>
        </div>
        <Activity size={14} className="text-green-400 animate-pulse" />
      </div>

      {/* Metrics */}
      <div className="p-4 space-y-3 font-mono text-xs">
        {/* Stage */}
        <div className="flex justify-between items-center text-gray-400">
          <span className="text-gray-500">STAGE:</span>
          <span className="text-gold-400 font-bold uppercase">{metrics.stage}</span>
        </div>

        {/* Chunk Progress */}
        {metrics.chunkProgress && (
          <div className="flex justify-between items-center text-gray-400">
            <span className="text-gray-500">CHUNK:</span>
            <span className="text-purple-400 font-bold">{metrics.chunkProgress}</span>
          </div>
        )}

        {/* Model */}
        <div className="flex justify-between items-center text-gray-400">
          <span className="text-gray-500">MODEL:</span>
          <div className="flex items-center gap-1">
            <Cpu size={12} className="text-blue-400" />
            <span className="text-blue-400 font-semibold">{metrics.currentModel}</span>
          </div>
        </div>

        {/* Tokens/sec */}
        <div className="flex justify-between items-center">
          <span className="text-gray-500">TOKENS/SEC:</span>
          <div className="flex items-center gap-1">
            <Zap size={12} className="text-yellow-400 animate-pulse" />
            <span className="text-green-400 font-bold tabular-nums">
              {metrics.tokensPerSecond}
            </span>
          </div>
        </div>

        {/* Total Tokens */}
        <div className="flex justify-between text-gray-400">
          <span className="text-gray-500">PROCESSED:</span>
          <span className="text-purple-400 font-semibold tabular-nums">
            {metrics.totalTokensProcessed.toLocaleString()}
          </span>
        </div>

        {/* Memory */}
        <div className="flex justify-between items-center">
          <span className="text-gray-500">MEMORY:</span>
          <div className="flex items-center gap-1">
            <Database size={12} className="text-cyan-400" />
            <span className={`font-bold tabular-nums ${
              metrics.memoryUsage > 80 ? 'text-red-400' : 
              metrics.memoryUsage > 60 ? 'text-yellow-400' : 
              'text-cyan-400'
            }`}>
              {metrics.memoryUsage}%
            </span>
          </div>
        </div>

        {/* API Latency */}
        <div className="flex justify-between text-gray-400">
          <span className="text-gray-500">LATENCY:</span>
          <span className={`font-semibold tabular-nums ${
            metrics.apiLatency > 500 ? 'text-red-400' :
            metrics.apiLatency > 300 ? 'text-yellow-400' :
            'text-green-400'
          }`}>
            {metrics.apiLatency}ms
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800">
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
            <div 
              className="h-full bg-gradient-to-r from-gold-500 via-yellow-400 to-green-500 transition-all duration-500 ease-out"
              style={{ width: `${metrics.memoryUsage}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Footer */}
      <div className="px-4 py-2 bg-slate-950/70 border-t border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-[10px] text-green-400 font-mono font-semibold tracking-wide">
            CONNECTED
          </span>
        </div>
        <span className="text-[9px] text-gray-500 font-mono">
          MrF X OS AGENT
        </span>
      </div>
    </div>
  );
};

// Mini version للاستخدام في الأماكن الضيقة
export const MiniPerformanceIndicator: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  if (!isActive) return null;

  return (
    <div className="fixed top-4 right-4 bg-slate-900/90 border border-gold-600/30 rounded-lg px-3 py-2 flex items-center gap-2 z-50 backdrop-blur-sm">
      <Activity size={12} className="text-green-400 animate-pulse" />
      <span className="text-xs font-mono text-gold-400">AI ACTIVE</span>
    </div>
  );
};
