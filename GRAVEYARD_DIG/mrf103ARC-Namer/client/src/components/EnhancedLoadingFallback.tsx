import { useEffect, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EnhancedLoadingFallbackProps {
  timeout?: number;
  onTimeout?: () => void;
}

export function EnhancedLoadingFallback({ 
  timeout = 10000,
  onTimeout 
}: EnhancedLoadingFallbackProps) {
  const [isTimedOut, setIsTimedOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTimedOut(true);
      onTimeout?.();
    }, timeout);

    return () => clearTimeout(timer);
  }, [timeout, onTimeout]);

  if (isTimedOut) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-gray-400 px-6">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="flex justify-center">
            <div className="relative">
              <AlertCircle className="h-12 w-12 text-yellow-500" />
              <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-yellow-500 font-mono">
              LOADING TIMEOUT
            </h2>
            <p className="text-sm font-mono text-gray-500">
              The page is taking longer than expected to load
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => window.location.reload()}
              className="bg-cyan-500 hover:bg-cyan-600 text-black font-mono"
            >
              Reload Page
            </Button>
            <Button
              onClick={() => window.location.href = '/'}
              variant="outline"
              className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 font-mono"
            >
              Return Home
            </Button>
          </div>

          <p className="text-xs text-gray-600 font-mono">
            If this persists, check your network connection
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-green-500">
      <div className="relative">
        <Loader2 className="h-8 w-8 animate-spin" />
        <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full" />
      </div>
      <span className="ml-2 mt-4 font-mono animate-pulse">LOADING...</span>
      <div className="mt-6 flex gap-1">
        <div className="w-2 h-2 bg-green-500/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-green-500/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-green-500/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}
