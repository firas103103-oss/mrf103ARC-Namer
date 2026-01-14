/**
 * 📊 Secret Stats Dashboard
 * Hidden performance & fun metrics
 */

interface SystemStats {
  // Performance
  uptime: number;
  totalRequests: number;
  averageResponseTime: number;
  errorRate: number;
  
  // User Activity
  sessionsToday: number;
  totalAgents: number;
  activeAgents: number;
  totalMessages: number;
  
  // Fun Stats
  secretsFound: number;
  achievementsUnlocked: number;
  konamiCodeUses: number;
  lateNightSessions: number;
  
  // Advanced
  cacheHitRate: number;
  memoryUsage: number;
  batteryLevel?: number;
}

class StatsManager {
  private stats: SystemStats;
  private startTime: number;
  private requestLog: number[] = [];
  
  constructor() {
    this.startTime = Date.now();
    this.stats = this.loadStats();
    this.setupTracking();
  }

  private loadStats(): SystemStats {
    const saved = localStorage.getItem('arc_stats');
    if (saved) {
      return JSON.parse(saved);
    }

    return {
      uptime: 0,
      totalRequests: 0,
      averageResponseTime: 0,
      errorRate: 0,
      sessionsToday: 0,
      totalAgents: 0,
      activeAgents: 0,
      totalMessages: 0,
      secretsFound: 0,
      achievementsUnlocked: 0,
      konamiCodeUses: 0,
      lateNightSessions: 0,
      cacheHitRate: 0,
      memoryUsage: 0,
    };
  }

  private setupTracking() {
    // Track uptime
    setInterval(() => {
      this.stats.uptime = Date.now() - this.startTime;
      this.saveStats();
    }, 60000); // Every minute

    // Track session
    this.incrementSessionCount();

    // Track late night sessions
    if (new Date().getHours() >= 0 && new Date().getHours() < 5) {
      this.stats.lateNightSessions++;
    }

    // Track memory (if available)
    if ((performance as any).memory) {
      setInterval(() => {
        const memory = (performance as any).memory;
        this.stats.memoryUsage = Math.round(
          (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
        );
      }, 5000);
    }

    // Track battery (if available)
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        this.stats.batteryLevel = Math.round(battery.level * 100);
        battery.addEventListener('levelchange', () => {
          this.stats.batteryLevel = Math.round(battery.level * 100);
        });
      });
    }
  }

  private incrementSessionCount() {
    const today = new Date().toDateString();
    const lastSession = localStorage.getItem('arc_last_session');
    
    if (lastSession !== today) {
      this.stats.sessionsToday = 1;
      localStorage.setItem('arc_last_session', today);
    } else {
      this.stats.sessionsToday++;
    }
    
    this.saveStats();
  }

  private saveStats() {
    localStorage.setItem('arc_stats', JSON.stringify(this.stats));
  }

  // Public tracking methods
  trackRequest(responseTime: number, success: boolean = true) {
    this.stats.totalRequests++;
    this.requestLog.push(responseTime);
    
    // Keep only last 100 requests
    if (this.requestLog.length > 100) {
      this.requestLog.shift();
    }

    // Calculate average
    this.stats.averageResponseTime = Math.round(
      this.requestLog.reduce((a, b) => a + b, 0) / this.requestLog.length
    );

    if (!success) {
      this.stats.errorRate = 
        ((this.stats.errorRate * (this.stats.totalRequests - 1)) + 1) / 
        this.stats.totalRequests;
    }

    this.saveStats();
  }

  trackSecret() {
    this.stats.secretsFound++;
    this.saveStats();
  }

  trackKonami() {
    this.stats.konamiCodeUses++;
    this.saveStats();
  }

  updateAgentCount(total: number, active: number) {
    this.stats.totalAgents = total;
    this.stats.activeAgents = active;
    this.saveStats();
  }

  trackMessage() {
    this.stats.totalMessages++;
    this.saveStats();
  }

  // Dashboard display
  showDashboard() {
    const overlay = this.createDashboardOverlay();
    document.body.appendChild(overlay);

    // Close on Escape
    const closeHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        overlay.remove();
        document.removeEventListener('keydown', closeHandler);
      }
    };
    document.addEventListener('keydown', closeHandler);

    // Close on click outside
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
        document.removeEventListener('keydown', closeHandler);
      }
    });
  }

  private createDashboardOverlay(): HTMLElement {
    const overlay = document.createElement('div');
    overlay.className = 'stats-dashboard-overlay';
    
    const uptime = this.formatUptime(this.stats.uptime);
    const successRate = ((1 - this.stats.errorRate) * 100).toFixed(1);

    overlay.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
        z-index: 10002;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease-out;
      ">
        <div style="
          background: linear-gradient(135deg, rgba(0, 14, 39, 0.95), rgba(0, 7, 20, 0.95));
          border: 2px solid #00D4FF;
          border-radius: 24px;
          padding: 32px;
          max-width: 800px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 212, 255, 0.3);
        ">
          <!-- Header -->
          <div style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 32px;
          ">
            <h2 style="
              font-size: 32px;
              font-weight: bold;
              background: linear-gradient(135deg, #00D4FF, #7C3AED);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              margin: 0;
            ">
              📊 System Dashboard
            </h2>
            <div style="
              font-size: 12px;
              color: #94A3B8;
              text-align: right;
            ">
              <div>Uptime: ${uptime}</div>
              <div>Power Level: Over 9000! 💪</div>
            </div>
          </div>

          <!-- Stats Grid -->
          <div style="
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin-bottom: 24px;
          ">
            ${this.createStatCard('⚡', 'Total Requests', this.stats.totalRequests.toLocaleString(), '#00D4FF')}
            ${this.createStatCard('⏱️', 'Avg Response', `${this.stats.averageResponseTime}ms`, '#7C3AED')}
            ${this.createStatCard('✅', 'Success Rate', `${successRate}%`, '#10B981')}
            ${this.createStatCard('🤖', 'Total Agents', this.stats.totalAgents.toString(), '#F59E0B')}
            ${this.createStatCard('💬', 'Messages Sent', this.stats.totalMessages.toLocaleString(), '#06B6D4')}
            ${this.createStatCard('🎯', 'Active Now', this.stats.activeAgents.toString(), '#EC4899')}
          </div>

          <!-- Fun Stats -->
          <div style="
            background: rgba(0, 212, 255, 0.05);
            border: 1px solid rgba(0, 212, 255, 0.2);
            border-radius: 16px;
            padding: 20px;
            margin-bottom: 24px;
          ">
            <h3 style="
              font-size: 18px;
              color: #00D4FF;
              margin: 0 0 16px 0;
              font-weight: bold;
            ">
              🎮 Fun Stats
            </h3>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
              ${this.createMiniStat('🥚', 'Secrets Found', this.stats.secretsFound.toString())}
              ${this.createMiniStat('🏆', 'Achievements', this.stats.achievementsUnlocked.toString())}
              ${this.createMiniStat('👾', 'Konami Uses', this.stats.konamiCodeUses.toString())}
              ${this.createMiniStat('🦉', 'Late Nights', this.stats.lateNightSessions.toString())}
            </div>
          </div>

          <!-- Performance -->
          <div style="
            background: rgba(124, 58, 237, 0.05);
            border: 1px solid rgba(124, 58, 237, 0.2);
            border-radius: 16px;
            padding: 20px;
            margin-bottom: 24px;
          ">
            <h3 style="
              font-size: 18px;
              color: #7C3AED;
              margin: 0 0 16px 0;
              font-weight: bold;
            ">
              ⚙️ Performance
            </h3>
            <div style="display: flex; flex-direction: column; gap: 12px;">
              ${this.createProgressBar('Cache Hit Rate', this.stats.cacheHitRate, '#10B981')}
              ${this.createProgressBar('Memory Usage', this.stats.memoryUsage, '#F59E0B')}
              ${this.stats.batteryLevel ? this.createProgressBar('Battery Level', this.stats.batteryLevel, '#06B6D4') : ''}
            </div>
          </div>

          <!-- ASCII Art -->
          <div style="
            font-family: 'Courier New', monospace;
            font-size: 10px;
            color: #00D4FF;
            text-align: center;
            margin-top: 24px;
            opacity: 0.5;
            white-space: pre;
          ">${this.getASCIIArt()}</div>

          <!-- Footer -->
          <div style="
            text-align: center;
            margin-top: 24px;
            font-size: 12px;
            color: #94A3B8;
          ">
            Press <kbd style="
              background: rgba(255, 255, 255, 0.1);
              padding: 2px 6px;
              border-radius: 4px;
              font-family: monospace;
            ">ESC</kbd> to close
          </div>
        </div>
      </div>
    `;

    return overlay;
  }

  private createStatCard(icon: string, label: string, value: string, color: string): string {
    return `
      <div style="
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 16px;
        transition: all 0.3s ease;
      ">
        <div style="font-size: 32px; margin-bottom: 8px;">${icon}</div>
        <div style="
          font-size: 12px;
          color: #94A3B8;
          margin-bottom: 4px;
        ">${label}</div>
        <div style="
          font-size: 24px;
          font-weight: bold;
          color: ${color};
        ">${value}</div>
      </div>
    `;
  }

  private createMiniStat(icon: string, label: string, value: string): string {
    return `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 20px;">${icon}</span>
        <div>
          <div style="font-size: 11px; color: #94A3B8;">${label}</div>
          <div style="font-size: 16px; font-weight: bold; color: #00D4FF;">${value}</div>
        </div>
      </div>
    `;
  }

  private createProgressBar(label: string, value: number, color: string): string {
    return `
      <div>
        <div style="
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #94A3B8;
          margin-bottom: 6px;
        ">
          <span>${label}</span>
          <span style="color: ${color}; font-weight: bold;">${value}%</span>
        </div>
        <div style="
          background: rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          height: 8px;
          overflow: hidden;
        ">
          <div style="
            background: ${color};
            height: 100%;
            width: ${value}%;
            border-radius: 8px;
            transition: width 0.3s ease;
          "></div>
        </div>
      </div>
    `;
  }

  private formatUptime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  private getASCIIArt(): string {
    return `
    █████╗ ██████╗  ██████╗
   ██╔══██╗██╔══██╗██╔════╝
   ███████║██████╔╝██║     
   ██╔══██║██╔══██╗██║     
   ██║  ██║██║  ██║╚██████╗
   ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝
    Operator Dashboard v2.0
    `;
  }

  // Public API
  getStats(): SystemStats {
    return { ...this.stats };
  }

  reset() {
    if (confirm('Reset all statistics?')) {
      this.stats = this.loadStats();
      this.requestLog = [];
      this.saveStats();
      console.log('✅ Statistics reset');
    }
  }
}

// Initialize
let statsManager: StatsManager | undefined;

if (typeof window !== 'undefined') {
  statsManager = new StatsManager();
  (window as any).ARC_STATS = statsManager;
  
  // Keyboard shortcut (Ctrl/Cmd + Shift + S)
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
      e.preventDefault();
      statsManager!.showDashboard();
    }
  });

  console.log('%c📊 Stats dashboard ready!', 'font-size: 12px; color: #7C3AED;');
  console.log('%cPress Ctrl+Shift+S to view', 'font-size: 10px; color: #94A3B8;');
}

export default statsManager!;
export { StatsManager };
