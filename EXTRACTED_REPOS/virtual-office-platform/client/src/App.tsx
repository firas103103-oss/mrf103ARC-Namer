import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Cloning from './pages/Cloning';
import VirtualOffice from './pages/VirtualOffice';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/cloning" replace />} />
        <Route path="/cloning" element={<Cloning />} />
        <Route path="/office" element={<VirtualOffice />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
