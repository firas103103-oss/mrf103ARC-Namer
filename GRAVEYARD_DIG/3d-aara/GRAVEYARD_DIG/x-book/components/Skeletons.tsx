/**
 * Skeleton Components - Loading States احترافية
 * MrF X OS Organization - X-Book System
 */

import React from 'react';

/**
 * MessageSkeleton - Skeleton لرسالة الشات
 */
export const MessageSkeleton: React.FC<{ isUser?: boolean }> = ({ isUser = false }) => (
  <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-pulse`}>
    {/* Avatar */}
    <div className="w-8 h-8 bg-slate-700 rounded-full flex-shrink-0" />
    
    {/* Message Content */}
    <div className={`flex-1 max-w-[70%] ${isUser ? 'items-end' : 'items-start'}`}>
      <div className="space-y-2">
        <div className="h-4 bg-slate-700 rounded w-3/4" />
        <div className="h-4 bg-slate-700 rounded w-1/2" />
      </div>
    </div>
  </div>
);

/**
 * OptionsSkeleton - Skeleton لأزرار الخيارات
 */
export const OptionsSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="flex flex-wrap gap-2 animate-pulse">
    {Array.from({ length: count }).map((_, i) => (
      <div 
        key={i} 
        className="h-10 bg-slate-700 rounded-xl"
        style={{ width: `${80 + Math.random() * 60}px` }}
      />
    ))}
  </div>
);

/**
 * ProcessingSkeleton - Skeleton لمرحلة المعالجة
 */
export const ProcessingSkeleton: React.FC = () => (
  <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-6 animate-pulse">
    {/* Progress Bar */}
    <div className="mb-4">
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div className="h-full bg-slate-600 rounded-full w-1/3" />
      </div>
    </div>
    
    {/* Status Text */}
    <div className="space-y-2">
      <div className="h-4 bg-slate-700 rounded w-1/2 mx-auto" />
      <div className="h-3 bg-slate-700 rounded w-1/3 mx-auto" />
    </div>
    
    {/* Stats Grid */}
    <div className="grid grid-cols-3 gap-4 mt-6">
      {[1, 2, 3].map(i => (
        <div key={i} className="text-center">
          <div className="h-8 bg-slate-700 rounded w-16 mx-auto mb-2" />
          <div className="h-3 bg-slate-700 rounded w-12 mx-auto" />
        </div>
      ))}
    </div>
  </div>
);

/**
 * CardSkeleton - Skeleton لبطاقة عامة
 */
export const CardSkeleton: React.FC<{ lines?: number }> = ({ lines = 3 }) => (
  <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 animate-pulse">
    {/* Header */}
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 bg-slate-700 rounded-full" />
      <div className="flex-1">
        <div className="h-4 bg-slate-700 rounded w-1/2 mb-2" />
        <div className="h-3 bg-slate-700 rounded w-1/3" />
      </div>
    </div>
    
    {/* Content Lines */}
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div 
          key={i} 
          className="h-3 bg-slate-700 rounded"
          style={{ width: `${60 + Math.random() * 40}%` }}
        />
      ))}
    </div>
  </div>
);

/**
 * FullPageSkeleton - Skeleton للصفحة الكاملة
 */
export const FullPageSkeleton: React.FC = () => (
  <div className="min-h-screen bg-slate-950 flex flex-col">
    {/* Header */}
    <div className="h-16 bg-slate-900 border-b border-slate-800 animate-pulse">
      <div className="max-w-4xl mx-auto px-4 h-full flex items-center justify-between">
        <div className="h-6 bg-slate-700 rounded w-32" />
        <div className="h-8 w-8 bg-slate-700 rounded-full" />
      </div>
    </div>
    
    {/* Content */}
    <div className="flex-1 p-4 max-w-4xl mx-auto w-full">
      <div className="space-y-4">
        <MessageSkeleton />
        <MessageSkeleton isUser />
        <MessageSkeleton />
        <OptionsSkeleton />
      </div>
    </div>
    
    {/* Input Area */}
    <div className="h-20 bg-slate-900 border-t border-slate-800 animate-pulse">
      <div className="max-w-4xl mx-auto px-4 h-full flex items-center gap-4">
        <div className="flex-1 h-12 bg-slate-700 rounded-xl" />
        <div className="w-12 h-12 bg-slate-700 rounded-xl" />
      </div>
    </div>
  </div>
);

/**
 * InlineSkeleton - Skeleton للنص inline
 */
export const InlineSkeleton: React.FC<{ width?: string }> = ({ width = '100px' }) => (
  <span 
    className="inline-block h-4 bg-slate-700 rounded animate-pulse align-middle"
    style={{ width }}
  />
);
