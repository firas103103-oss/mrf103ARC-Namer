import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BioSentinel from './pages/BioSentinel';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="app min-h-screen bg-background">
        <BioSentinel />
      </div>
    </QueryClientProvider>
  );
}

export default App;
