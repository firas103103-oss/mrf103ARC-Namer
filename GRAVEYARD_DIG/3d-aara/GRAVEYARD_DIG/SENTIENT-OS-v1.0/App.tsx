
import React, { useState, useMemo } from 'react';
import { Mode } from './types';
import HudLayout from './components/HudLayout';
import StatusBar from './components/StatusBar';
import ModeSelector from './components/ModeSelector';
import DailyDashboard from './components/widgets/daily/DailyDashboard';
import DrivingDashboard from './components/widgets/driving/DrivingDashboard';
import WorkDashboard from './components/widgets/work/WorkDashboard';

const App: React.FC = () => {
  const [mode, setMode] = useState<Mode>(Mode.DAILY);

  const DashboardComponent = useMemo(() => {
    switch (mode) {
      case Mode.DRIVING:
        return <DrivingDashboard />;
      case Mode.WORK:
        return <WorkDashboard />;
      case Mode.DAILY:
      default:
        return <DailyDashboard />;
    }
  }, [mode]);

  return (
    <main className="w-screen h-screen bg-transparent text-cyan-200 p-4 sm:p-6 lg:p-8 overflow-hidden">
      <HudLayout>
        <StatusBar />
        <div className="flex-grow p-4 overflow-hidden">
          {DashboardComponent}
        </div>
        <ModeSelector currentMode={mode} setMode={setMode} />
      </HudLayout>
    </main>
  );
};

export default App;
