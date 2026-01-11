import React from 'react';
import Cloning from './pages/Cloning';
import { Toaster } from './components/ui/toast';

function App() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Cloning />
      <Toaster />
    </div>
  );
}

export default App;
