/**
 * MRF103 ARC Ecosystem - Main App Component
 */

import React from 'react';
// import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

// =============================================================================
// Layout Component
// =============================================================================

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#010208] text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#010208]/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-[#0080FF] via-[#8B4FFF] to-[#FF006E] bg-clip-text text-transparent">
            MRF<span className="text-[#FF006E]">103</span> ARC
          </Link>
          <nav className="flex gap-6">
            <Link to="/" className="text-white/70 hover:text-[#0080FF] transition-colors">Dashboard</Link>
            <Link to="/agents" className="text-white/70 hover:text-[#0080FF] transition-colors">Agents</Link>
            <Link to="/projects" className="text-white/70 hover:text-[#0080FF] transition-colors">Projects</Link>
          </nav>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="pt-20">
        {children}
      </main>
    </div>
  );
}

// =============================================================================
// Dashboard Page
// =============================================================================

function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-white to-[#0080FF] bg-clip-text text-transparent">
        Command Center
      </h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Active Agents', value: '28', icon: '🤖', color: '#0080FF' },
          { label: 'Tasks Today', value: '156', icon: '⚡', color: '#8B4FFF' },
          { label: 'System Health', value: '100%', icon: '💚', color: '#00FFAA' },
          { label: 'API Calls', value: '2.4K', icon: '📡', color: '#FFB800' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-[#0080FF]/30 transition-all"
          >
            <div className="text-3xl mb-2">{stat.icon}</div>
            <div className="text-3xl font-bold" style={{ color: stat.color }}>
              {stat.value}
            </div>
            <div className="text-white/50 text-sm mt-1">{stat.label}</div>
          </div>
        ))}
      </div>
      
      {/* Agent Hierarchy */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h2 className="text-2xl font-bold mb-6">Agent Hierarchy</h2>
        <div className="space-y-4">
          {/* Tier 0 */}
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono bg-[#FF006E]/20 text-[#FF006E] px-2 py-1 rounded">T0</span>
            <span className="text-lg font-semibold">Mr.F</span>
            <span className="text-white/50">— CEO / Strategic Commander</span>
            <span className="ml-auto px-3 py-1 rounded-full text-xs bg-[#00FFAA]/20 text-[#00FFAA]">Online</span>
          </div>
          
          {/* Tier 1 */}
          {['Dr. Genius (CIO)', 'Quantum (CTO)', 'Oracle (CDO)', 'Sentinel (CSO)', 'Architect (CAO)', 'Catalyst (CGO)'].map((agent) => (
            <div key={agent} className="flex items-center gap-4 pl-8">
              <span className="text-xs font-mono bg-[#8B4FFF]/20 text-[#8B4FFF] px-2 py-1 rounded">T1</span>
              <span className="text-lg">{agent}</span>
              <span className="ml-auto px-3 py-1 rounded-full text-xs bg-[#00FFAA]/20 text-[#00FFAA]">Active</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Agents Page
// =============================================================================

function AgentsPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-4xl font-bold mb-8">Agent Management</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { name: 'Mr.F', role: 'CEO', tier: 0, status: 'active' },
          { name: 'Dr. Genius', role: 'CIO', tier: 1, status: 'active' },
          { name: 'Quantum', role: 'CTO', tier: 1, status: 'active' },
          { name: 'Oracle', role: 'CDO', tier: 1, status: 'active' },
          { name: 'Sentinel', role: 'CSO', tier: 1, status: 'idle' },
          { name: 'Architect', role: 'CAO', tier: 1, status: 'active' },
        ].map((agent) => (
          <div
            key={agent.name}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-[#0080FF]/50 transition-all cursor-pointer"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="text-4xl">🤖</div>
              <span className={`px-3 py-1 rounded-full text-xs ${
                agent.status === 'active' 
                  ? 'bg-[#00FFAA]/20 text-[#00FFAA]' 
                  : 'bg-white/10 text-white/50'
              }`}>
                {agent.status}
              </span>
            </div>
            <h3 className="text-xl font-bold mb-1">{agent.name}</h3>
            <p className="text-white/50 mb-4">{agent.role} — Tier {agent.tier}</p>
            <button className="w-full py-2 bg-[#0080FF]/20 text-[#0080FF] rounded-lg hover:bg-[#0080FF]/30 transition-colors">
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// Projects Page
// =============================================================================

function ProjectsPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-4xl font-bold mb-8">Projects</h1>
      <div className="space-y-4">
        {[
          { name: 'ARC Platform', progress: 95, status: 'Production' },
          { name: 'XBook Engine', progress: 60, status: 'Development' },
          { name: 'BioSentinel', progress: 80, status: 'Testing' },
        ].map((project) => (
          <div
            key={project.name}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{project.name}</h3>
              <span className="px-3 py-1 rounded-full text-xs bg-[#8B4FFF]/20 text-[#8B4FFF]">
                {project.status}
              </span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#0080FF] to-[#8B4FFF] rounded-full transition-all"
                style={{ width: `${project.progress}%` }}
              />
            </div>
            <div className="text-right text-sm text-white/50 mt-2">{project.progress}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// Main App
// =============================================================================

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/agents" element={<AgentsPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
