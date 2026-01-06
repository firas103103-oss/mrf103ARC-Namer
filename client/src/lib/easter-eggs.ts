/**
 * 🎮 Easter Eggs & Hidden Features System
 * Fun surprises for power users
 */

type EasterEggType = 'message' | 'theme' | 'feature' | 'achievement';

interface EasterEgg {
  id: string;
  trigger: string | string[];
  type: EasterEggType;
  title: string;
  description: string;
  action?: () => void;
  unlocked?: boolean;
}

// Store unlocked eggs in localStorage
const STORAGE_KEY = 'arc_easter_eggs';

class EasterEggManager {
  private eggs: Map<string, EasterEgg> = new Map();
  private konamiSequence: string[] = [];
  private konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 
                         'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 
                         'b', 'a'];

  constructor() {
    this.initializeEggs();
    this.loadProgress();
    this.setupListeners();
  }

  private initializeEggs() {
    // 1. Konami Code
    this.eggs.set('konami', {
      id: 'konami',
      trigger: 'konami',
      type: 'feature',
      title: '🎮 God Mode Activated',
      description: 'Unlocked developer superpowers!',
      action: () => this.activateGodMode(),
    });

    // 2. Matrix Mode
    this.eggs.set('matrix', {
      id: 'matrix',
      trigger: ['neo', 'matrix', 'follow the white rabbit'],
      type: 'theme',
      title: '🟢 The Matrix',
      description: 'Welcome to the real world',
      action: () => this.activateMatrixMode(),
    });

    // 3. Time Messages
    this.eggs.set('pi_time', {
      id: 'pi_time',
      trigger: 'time',
      type: 'message',
      title: '🥧 Pi O\'Clock',
      description: 'Special message at 3:14',
    });

    // 4. Developer Console
    this.eggs.set('dev_console', {
      id: 'dev_console',
      trigger: '/dev mode activate',
      type: 'feature',
      title: '💻 Developer Console',
      description: 'Secret debugging tools unlocked',
      action: () => this.showDevConsole(),
    });

    // 5. Agent Personality
    this.eggs.set('personality', {
      id: 'personality',
      trigger: '/personality',
      type: 'feature',
      title: '🎭 Personality Mode',
      description: 'Agents with attitude!',
      action: () => this.showPersonalityPicker(),
    });
  }

  private setupListeners() {
    // Konami code listener
    window.addEventListener('keydown', (e) => {
      this.konamiSequence.push(e.key);
      if (this.konamiSequence.length > this.konamiCode.length) {
        this.konamiSequence.shift();
      }
      
      if (JSON.stringify(this.konamiSequence) === JSON.stringify(this.konamiCode)) {
        this.unlock('konami');
      }
    });

    // Time-based eggs
    this.checkTimeBasedEggs();
    setInterval(() => this.checkTimeBasedEggs(), 60000); // Check every minute
  }

  private checkTimeBasedEggs() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    // Pi Time (3:14 AM/PM)
    if (hours === 3 && minutes === 14) {
      this.showMessage('🥧 It\'s Pi o\'clock! Math agents are extra sharp right now.');
    } else if (hours === 3 && minutes === 14) {
      this.showMessage('🥧 Pi time strikes again! The universe is mathematically aligned.');
    }

    // Late night coding (2-5 AM)
    if (hours >= 2 && hours < 5) {
      const messages = [
        '🦉 Night Owl detected! Your dedication is noted.',
        '🌙 Burning the midnight oil? Agents salute you!',
        '☕ Late night coding session? You\'re a legend.',
      ];
      if (Math.random() < 0.1) { // 10% chance
        this.showMessage(messages[Math.floor(Math.random() * messages.length)]);
      }
    }

    // Friday vibes
    if (now.getDay() === 5 && hours >= 16) {
      this.showMessage('🎊 TGIF: Thank God It\'s Functioning!');
    }
  }

  unlock(eggId: string) {
    const egg = this.eggs.get(eggId);
    if (!egg || egg.unlocked) return;

    egg.unlocked = true;
    this.saveProgress();

    // Show notification
    this.showNotification(egg);

    // Execute action
    if (egg.action) {
      egg.action();
    }
  }

  private activateGodMode() {
    console.log('%c🎮 GOD MODE ACTIVATED', 'font-size: 24px; color: #00D4FF; font-weight: bold;');
    console.log('%cYou now have access to:', 'font-size: 14px; color: #7C3AED;');
    console.log('%c- window.ARC.agents (see all agents)', 'color: #00D4FF;');
    console.log('%c- window.ARC.teleport(agentId) (jump to agent)', 'color: #00D4FF;');
    console.log('%c- window.ARC.timeTravel(timestamp) (view past state)', 'color: #00D4FF;');
    console.log('%c- window.ARC.quantum() (experimental features)', 'color: #00D4FF;');

    // Add global ARC object
    (window as any).ARC = {
      agents: () => console.log('Fetching all agents...'),
      teleport: (id: string) => console.log(`Teleporting to agent ${id}...`),
      timeTravel: (time: string) => console.log(`Time traveling to ${time}...`),
      quantum: () => console.log('Entering quantum realm...'),
      version: '2.0.0-godmode',
    };

    // Add special class to body
    document.body.classList.add('god-mode');
  }

  private activateMatrixMode() {
    console.log('%c🟢 THE MATRIX', 'font-size: 20px; color: #00ff00; font-family: monospace;');
    
    document.body.classList.add('matrix-mode');
    
    // Create matrix rain effect
    this.createMatrixRain();

    // Show dramatic message
    this.showMessage('Follow the white rabbit... 🐰', 5000);
  }

  private createMatrixRain() {
    const canvas = document.createElement('canvas');
    canvas.id = 'matrix-rain';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    canvas.style.opacity = '0.3';
    
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d')!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()';
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops: number[] = [];

    for (let i = 0; i < columns; i++) {
      drops[i] = 1;
    }

    function draw() {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#0F0';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }

    const interval = setInterval(draw, 33);

    // Stop after 30 seconds
    setTimeout(() => {
      clearInterval(interval);
      canvas.remove();
      document.body.classList.remove('matrix-mode');
    }, 30000);
  }

  private showDevConsole() {
    console.log('%c💻 DEVELOPER CONSOLE ACTIVATED', 'font-size: 18px; color: #F59E0B; font-weight: bold;');
    console.log('%cAvailable Commands:', 'font-size: 14px; color: #7C3AED;');
    console.log('%c  /stats - Show system statistics', 'color: #00D4FF;');
    console.log('%c  /agents - List all agents', 'color: #00D4FF;');
    console.log('%c  /clear-cache - Clear all caches', 'color: #00D4FF;');
    console.log('%c  /performance - Show performance metrics', 'color: #00D4FF;');
    console.log('%c  /api-log - Toggle API logging', 'color: #00D4FF;');
    console.log('%c  /ghost-mode - Enable invisible session', 'color: #00D4FF;');

    // Enable developer mode flag
    localStorage.setItem('arc_dev_mode', 'true');
  }

  private showPersonalityPicker() {
    const personalities = [
      { id: 'formal', name: 'Formal', emoji: '🎩', description: 'Professional and precise' },
      { id: 'casual', name: 'Casual', emoji: '😎', description: 'Relaxed and friendly' },
      { id: 'pirate', name: 'Pirate', emoji: '🏴‍☠️', description: 'Ahoy matey!' },
      { id: 'robot', name: 'Robot', emoji: '🤖', description: 'BEEP BOOP' },
      { id: 'zen', name: 'Zen', emoji: '🧘', description: 'Calm and mindful' },
      { id: 'excited', name: 'Excited', emoji: '🎉', description: 'Super enthusiastic!' },
    ];

    console.log('%c🎭 PERSONALITY MODES', 'font-size: 18px; color: #A855F7; font-weight: bold;');
    personalities.forEach(p => {
      console.log(`%c${p.emoji} ${p.name}: ${p.description}`, 'color: #00D4FF;');
    });
    console.log('%cUse: window.ARC.setPersonality("pirate")', 'color: #F59E0B;');

    (window as any).ARC = (window as any).ARC || {};
    (window as any).ARC.setPersonality = (id: string) => {
      localStorage.setItem('arc_agent_personality', id);
      console.log(`✅ Personality set to: ${id}`);
    };
  }

  private showNotification(egg: EasterEgg) {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = 'easter-egg-notification';
    toast.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #00D4FF, #7C3AED);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 212, 255, 0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        max-width: 300px;
      ">
        <div style="font-size: 24px; margin-bottom: 8px;">${egg.title}</div>
        <div style="font-size: 14px; opacity: 0.9;">${egg.description}</div>
      </div>
    `;

    document.body.appendChild(toast);

    // Remove after 5 seconds
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }

  private showMessage(message: string, duration: number = 3000) {
    console.log(`%c${message}`, 'font-size: 16px; color: #00D4FF; font-weight: bold;');
    
    // Also show in UI if available
    const toast = document.createElement('div');
    toast.innerHTML = `
      <div style="
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 14, 39, 0.95);
        color: #00D4FF;
        padding: 12px 24px;
        border-radius: 8px;
        border: 2px solid #00D4FF;
        box-shadow: 0 4px 16px rgba(0, 212, 255, 0.2);
        z-index: 10000;
        font-size: 14px;
        animation: fadeIn 0.3s ease-out;
      ">
        ${message}
      </div>
    `;

    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), duration);
  }

  private saveProgress() {
    const unlocked = Array.from(this.eggs.entries())
      .filter(([_, egg]) => egg.unlocked)
      .map(([id]) => id);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(unlocked));
  }

  private loadProgress() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const unlocked: string[] = JSON.parse(saved);
        unlocked.forEach(id => {
          const egg = this.eggs.get(id);
          if (egg) egg.unlocked = true;
        });
      }
    } catch (e) {
      console.warn('Failed to load easter eggs progress');
    }
  }

  // Public API
  checkTrigger(input: string) {
    this.eggs.forEach((egg, id) => {
      if (egg.unlocked) return;

      const triggers = Array.isArray(egg.trigger) ? egg.trigger : [egg.trigger];
      
      if (triggers.some(t => input.toLowerCase().includes(t.toLowerCase()))) {
        this.unlock(id);
      }
    });
  }

  getUnlockedCount(): number {
    return Array.from(this.eggs.values()).filter(e => e.unlocked).length;
  }

  getTotalCount(): number {
    return this.eggs.size;
  }
}

// Initialize on load
let easterEggManager: EasterEggManager | undefined;

if (typeof window !== 'undefined') {
  easterEggManager = new EasterEggManager();
  
  // Expose to window for easy access
  (window as any).ARC_EGGS = easterEggManager;
  
  console.log('%c🎮 ARC Operator 2.0', 'font-size: 20px; color: #00D4FF; font-weight: bold;');
  console.log('%c🎁 Easter eggs system loaded! Try the Konami code...', 'font-size: 12px; color: #7C3AED;');
  console.log('%c💡 Hint: Type special commands to discover secrets', 'font-size: 12px; color: #F59E0B;');
}

export default easterEggManager!;
export { EasterEggManager };
