/**
 * 🏆 Achievement System
 * Gamification for user engagement
 */

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  unlocked: boolean;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

const ACHIEVEMENTS: Achievement[] = [
  // First Steps
  {
    id: 'first_agent',
    title: 'Hello, World!',
    description: 'Created your first agent',
    icon: '🤖',
    rarity: 'common',
    points: 10,
    unlocked: false,
  },
  
  {
    id: 'agent_master',
    title: 'Agent Master',
    description: 'Created 10 agents',
    icon: '👑',
    rarity: 'rare',
    points: 50,
    unlocked: false,
    maxProgress: 10,
  },

  {
    id: 'agent_overlord',
    title: 'Agent Overlord',
    description: 'Created 50 agents',
    icon: '🌟',
    rarity: 'epic',
    points: 200,
    unlocked: false,
    maxProgress: 50,
  },

  // Speed Achievements
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Created 5 agents in under 5 minutes',
    icon: '⚡',
    rarity: 'rare',
    points: 75,
    unlocked: false,
  },

  {
    id: 'lightning_fast',
    title: 'Lightning Fast',
    description: 'Response time under 100ms',
    icon: '🔥',
    rarity: 'epic',
    points: 100,
    unlocked: false,
  },

  // Exploration
  {
    id: 'explorer',
    title: 'Explorer',
    description: 'Visited all sections of the app',
    icon: '🗺️',
    rarity: 'common',
    points: 25,
    unlocked: false,
    maxProgress: 5,
  },

  {
    id: 'easter_hunter',
    title: 'Easter Egg Hunter',
    description: 'Found 5 easter eggs',
    icon: '🥚',
    rarity: 'epic',
    points: 150,
    unlocked: false,
    maxProgress: 5,
  },

  // Time-based
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Used the app at 3 AM',
    icon: '🦉',
    rarity: 'rare',
    points: 50,
    unlocked: false,
  },

  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Used the app before 6 AM',
    icon: '🌅',
    rarity: 'rare',
    points: 50,
    unlocked: false,
  },

  {
    id: 'seven_days',
    title: 'Seven Day Streak',
    description: 'Used the app 7 days in a row',
    icon: '🔥',
    rarity: 'epic',
    points: 100,
    unlocked: false,
  },

  // Power User
  {
    id: 'keyboard_ninja',
    title: 'Keyboard Ninja',
    description: 'Used 20 keyboard shortcuts',
    icon: '⌨️',
    rarity: 'rare',
    points: 75,
    unlocked: false,
    maxProgress: 20,
  },

  {
    id: 'power_user',
    title: 'Power User',
    description: 'Enabled all advanced features',
    icon: '💪',
    rarity: 'epic',
    points: 150,
    unlocked: false,
  },

  // Social
  {
    id: 'sharing_is_caring',
    title: 'Sharing is Caring',
    description: 'Shared an agent configuration',
    icon: '🤝',
    rarity: 'common',
    points: 20,
    unlocked: false,
  },

  // Legendary
  {
    id: 'god_mode',
    title: '🎮 GOD MODE',
    description: 'Unlocked the Konami Code',
    icon: '👾',
    rarity: 'legendary',
    points: 500,
    unlocked: false,
  },

  {
    id: 'matrix_awakening',
    title: 'Matrix Awakening',
    description: 'Followed the white rabbit',
    icon: '🟢',
    rarity: 'legendary',
    points: 300,
    unlocked: false,
  },

  {
    id: 'completionist',
    title: 'Completionist',
    description: 'Unlocked all achievements',
    icon: '🏆',
    rarity: 'legendary',
    points: 1000,
    unlocked: false,
  },
];

class AchievementManager {
  private achievements: Achievement[] = [];
  private totalPoints = 0;
  private readonly STORAGE_KEY = 'arc_achievements';

  constructor() {
    this.achievements = [...ACHIEVEMENTS];
    this.loadProgress();
    this.setupTrackers();
  }

  private setupTrackers() {
    // Time-based trackers
    this.checkTimeBasedAchievements();
    
    // Track page visibility
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.checkTimeBasedAchievements();
      }
    });
  }

  private checkTimeBasedAchievements() {
    const hour = new Date().getHours();
    
    if (hour === 3) {
      this.unlock('night_owl');
    }
    
    if (hour >= 4 && hour < 6) {
      this.unlock('early_bird');
    }
  }

  unlock(achievementId: string, progress?: number) {
    const achievement = this.achievements.find(a => a.id === achievementId);
    if (!achievement || achievement.unlocked) return;

    // Handle progressive achievements
    if (achievement.maxProgress && progress !== undefined) {
      achievement.progress = progress;
      
      if (progress < achievement.maxProgress) {
        this.saveProgress();
        return; // Not complete yet
      }
    }

    achievement.unlocked = true;
    achievement.unlockedAt = new Date();
    this.totalPoints += achievement.points;
    
    this.saveProgress();
    this.showAchievementNotification(achievement);
    
    // Check if all achievements unlocked
    if (this.getUnlockedCount() === this.achievements.length - 1) { // -1 for completionist itself
      this.unlock('completionist');
    }
  }

  private showAchievementNotification(achievement: Achievement) {
    const rarityColors = {
      common: '#94A3B8',
      rare: '#3B82F6',
      epic: '#A855F7',
      legendary: '#F59E0B',
    };

    const toast = document.createElement('div');
    toast.className = 'achievement-notification';
    toast.innerHTML = `
      <div style="
        position: fixed;
        top: 80px;
        right: 20px;
        background: linear-gradient(135deg, rgba(0, 14, 39, 0.98), rgba(0, 14, 39, 0.95));
        border: 2px solid ${rarityColors[achievement.rarity]};
        color: white;
        padding: 20px;
        border-radius: 16px;
        box-shadow: 0 12px 48px ${rarityColors[achievement.rarity]}40;
        z-index: 10001;
        animation: achievementSlide 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        min-width: 320px;
        backdrop-filter: blur(10px);
      ">
        <div style="display: flex; align-items: center; gap: 16px;">
          <div style="font-size: 48px;">${achievement.icon}</div>
          <div style="flex: 1;">
            <div style="
              font-size: 12px; 
              text-transform: uppercase; 
              letter-spacing: 1px; 
              color: ${rarityColors[achievement.rarity]};
              font-weight: bold;
              margin-bottom: 4px;
            ">
              ${achievement.rarity} Achievement
            </div>
            <div style="font-size: 18px; font-weight: bold; margin-bottom: 4px;">
              ${achievement.title}
            </div>
            <div style="font-size: 13px; opacity: 0.8;">
              ${achievement.description}
            </div>
            <div style="
              margin-top: 8px; 
              font-size: 14px; 
              color: ${rarityColors[achievement.rarity]};
              font-weight: bold;
            ">
              +${achievement.points} points
            </div>
          </div>
        </div>
      </div>
    `;

    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
      @keyframes achievementSlide {
        0% { transform: translateX(400px); opacity: 0; }
        100% { transform: translateX(0); opacity: 1; }
      }
      @keyframes achievementExit {
        0% { transform: translateX(0); opacity: 1; }
        100% { transform: translateX(400px); opacity: 0; }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(toast);

    // Play sound (if enabled)
    this.playAchievementSound(achievement.rarity);

    // Remove after 7 seconds
    setTimeout(() => {
      toast.style.animation = 'achievementExit 0.4s ease-out';
      setTimeout(() => toast.remove(), 400);
    }, 7000);
  }

  private playAchievementSound(rarity: Achievement['rarity']) {
    // Create audio context for sound effects
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Different sounds for different rarities
      const frequencies = {
        common: [523.25, 659.25], // C, E
        rare: [659.25, 783.99], // E, G
        epic: [783.99, 987.77], // G, B
        legendary: [523.25, 659.25, 783.99, 1046.50], // C, E, G, C
      };

      const freqs = frequencies[rarity];
      let time = audioContext.currentTime;

      freqs.forEach((freq, i) => {
        oscillator.frequency.setValueAtTime(freq, time);
        gainNode.gain.setValueAtTime(0.1, time);
        gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
        time += 0.15;
      });

      oscillator.start(audioContext.currentTime);
      oscillator.stop(time);
    } catch (e) {
      // Silent fail if audio context not supported
    }
  }

  private saveProgress() {
    const data = {
      achievements: this.achievements.map(a => ({
        id: a.id,
        unlocked: a.unlocked,
        unlockedAt: a.unlockedAt,
        progress: a.progress,
      })),
      totalPoints: this.totalPoints,
    };

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  private loadProgress() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (!saved) return;

      const data = JSON.parse(saved);
      
      data.achievements.forEach((saved: any) => {
        const achievement = this.achievements.find(a => a.id === saved.id);
        if (achievement) {
          achievement.unlocked = saved.unlocked;
          achievement.unlockedAt = saved.unlockedAt ? new Date(saved.unlockedAt) : undefined;
          achievement.progress = saved.progress;
        }
      });

      this.totalPoints = data.totalPoints || 0;
    } catch (e) {
      console.warn('Failed to load achievements');
    }
  }

  // Public API
  getAll(): Achievement[] {
    return [...this.achievements];
  }

  getUnlocked(): Achievement[] {
    return this.achievements.filter(a => a.unlocked);
  }

  getUnlockedCount(): number {
    return this.achievements.filter(a => a.unlocked).length;
  }

  getTotalCount(): number {
    return this.achievements.length;
  }

  getTotalPoints(): number {
    return this.totalPoints;
  }

  getProgress(): number {
    return Math.round((this.getUnlockedCount() / this.getTotalCount()) * 100);
  }

  showStats() {
    console.log('%c🏆 ACHIEVEMENT STATS', 'font-size: 20px; color: #F59E0B; font-weight: bold;');
    console.log(`Unlocked: ${this.getUnlockedCount()}/${this.getTotalCount()}`);
    console.log(`Total Points: ${this.totalPoints}`);
    console.log(`Progress: ${this.getProgress()}%`);
    console.log('\nUnlocked Achievements:');
    
    this.getUnlocked().forEach(a => {
      console.log(`${a.icon} ${a.title} - ${a.points} pts (${a.rarity})`);
    });
  }
}

// Initialize
let achievementManager: AchievementManager | undefined;

if (typeof window !== 'undefined') {
  achievementManager = new AchievementManager();
  (window as any).ARC_ACHIEVEMENTS = achievementManager;
  
  console.log('%c🏆 Achievement system loaded!', 'font-size: 12px; color: #F59E0B;');
  console.log('%cType window.ARC_ACHIEVEMENTS.showStats() to see your progress', 'font-size: 10px; color: #94A3B8;');
}

export default achievementManager!;
export { AchievementManager };
