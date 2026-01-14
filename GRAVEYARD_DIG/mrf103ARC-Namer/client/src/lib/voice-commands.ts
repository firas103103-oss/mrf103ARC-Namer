/**
 * 🎤 Voice Commands System
 * Control agents with your voice!
 */

interface VoiceCommand {
  phrase: string[];
  action: () => void;
  description: string;
  category: 'navigation' | 'agent' | 'system' | 'easter-egg';
}

class VoiceCommandManager {
  private recognition: any;
  private isListening = false;
  private commands: VoiceCommand[] = [];
  private readonly WAKE_WORD = 'hey arc';

  constructor() {
    this.initializeRecognition();
    this.setupCommands();
  }

  private initializeRecognition() {
    // Check for Web Speech API support
    const SpeechRecognition = (window as any).SpeechRecognition || 
                             (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('🎤 Voice commands not supported in this browser');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('')
        .toLowerCase();

      this.processCommand(transcript);
    };

    this.recognition.onerror = (event: any) => {
      console.error('Voice recognition error:', event.error);
    };

    this.recognition.onend = () => {
      if (this.isListening) {
        this.recognition.start(); // Restart if still enabled
      }
    };
  }

  private setupCommands() {
    // Navigation Commands
    this.commands.push(
      {
        phrase: ['go home', 'take me home', 'home page'],
        action: () => window.location.href = '/',
        description: 'Navigate to home page',
        category: 'navigation',
      },
      {
        phrase: ['show agents', 'list agents', 'view agents'],
        action: () => this.navigateTo('/agents'),
        description: 'Show all agents',
        category: 'navigation',
      },
      {
        phrase: ['settings', 'open settings', 'show settings'],
        action: () => this.navigateTo('/settings'),
        description: 'Open settings',
        category: 'navigation',
      }
    );

    // Agent Commands
    this.commands.push(
      {
        phrase: ['create agent', 'new agent', 'add agent'],
        action: () => this.triggerAgentCreation(),
        description: 'Create a new agent',
        category: 'agent',
      },
      {
        phrase: ['delete agent', 'remove agent'],
        action: () => this.confirmDelete(),
        description: 'Delete selected agent',
        category: 'agent',
      },
      {
        phrase: ['start all', 'activate all', 'wake up agents'],
        action: () => this.startAllAgents(),
        description: 'Start all agents',
        category: 'agent',
      },
      {
        phrase: ['stop all', 'deactivate all', 'sleep mode'],
        action: () => this.stopAllAgents(),
        description: 'Stop all agents',
        category: 'agent',
      }
    );

    // System Commands
    this.commands.push(
      {
        phrase: ['refresh', 'reload', 'update'],
        action: () => window.location.reload(),
        description: 'Refresh the page',
        category: 'system',
      },
      {
        phrase: ['dark mode', 'enable dark mode', 'lights off'],
        action: () => this.toggleDarkMode(true),
        description: 'Enable dark mode',
        category: 'system',
      },
      {
        phrase: ['light mode', 'disable dark mode', 'lights on'],
        action: () => this.toggleDarkMode(false),
        description: 'Enable light mode',
        category: 'system',
      },
      {
        phrase: ['full screen', 'enter full screen', 'maximize'],
        action: () => document.documentElement.requestFullscreen(),
        description: 'Enter fullscreen mode',
        category: 'system',
      }
    );

    // Easter Egg Commands
    this.commands.push(
      {
        phrase: ['open the pod bay doors', 'hal open the pod bay doors'],
        action: () => this.halResponse(),
        description: '2001: A Space Odyssey reference',
        category: 'easter-egg',
      },
      {
        phrase: ['beam me up', 'beam me up scotty'],
        action: () => this.beamMeUp(),
        description: 'Star Trek reference',
        category: 'easter-egg',
      },
      {
        phrase: ['execute order 66', 'order 66'],
        action: () => this.order66(),
        description: 'Star Wars reference',
        category: 'easter-egg',
      },
      {
        phrase: ['hello computer', 'computer hello'],
        action: () => this.helloComputer(),
        description: 'Classic computer greeting',
        category: 'easter-egg',
      },
      {
        phrase: ['sudo make me a sandwich'],
        action: () => this.sudoSandwich(),
        description: 'XKCD reference',
        category: 'easter-egg',
      }
    );
  }

  private processCommand(transcript: string) {
    console.log('🎤 Heard:', transcript);

    // Check for wake word
    if (!transcript.includes(this.WAKE_WORD)) {
      return;
    }

    // Remove wake word
    const command = transcript.replace(this.WAKE_WORD, '').trim();

    // Find matching command
    for (const cmd of this.commands) {
      if (cmd.phrase.some(phrase => command.includes(phrase))) {
        console.log('✅ Executing:', cmd.description);
        this.showVoiceResponse(`Executing: ${cmd.description}`);
        cmd.action();
        
        // Play confirmation sound
        this.playBeep();
        return;
      }
    }

    // No match
    this.showVoiceResponse('Command not recognized. Say "help" for available commands.');
  }

  // Command Actions
  private navigateTo(path: string) {
    window.location.href = path;
  }

  private triggerAgentCreation() {
    // Trigger agent creation UI
    const event = new CustomEvent('voice:create-agent');
    window.dispatchEvent(event);
  }

  private confirmDelete() {
    if (confirm('Are you sure you want to delete the selected agent?')) {
      const event = new CustomEvent('voice:delete-agent');
      window.dispatchEvent(event);
    }
  }

  private startAllAgents() {
    const event = new CustomEvent('voice:start-all');
    window.dispatchEvent(event);
    this.showVoiceResponse('🚀 Activating all agents...');
  }

  private stopAllAgents() {
    const event = new CustomEvent('voice:stop-all');
    window.dispatchEvent(event);
    this.showVoiceResponse('💤 Putting agents to sleep...');
  }

  private toggleDarkMode(enable: boolean) {
    document.body.classList.toggle('dark', enable);
    localStorage.setItem('theme', enable ? 'dark' : 'light');
    this.showVoiceResponse(enable ? '🌙 Dark mode enabled' : '☀️ Light mode enabled');
  }

  // Easter Egg Actions
  private halResponse() {
    this.showVoiceResponse(
      "I'm sorry Dave, I'm afraid I can't do that.",
      'error'
    );
    this.speak("I'm sorry Dave, I'm afraid I can't do that.");
  }

  private beamMeUp() {
    this.showVoiceResponse('🖖 Energizing... Stand by!');
    
    // Visual effect
    document.body.style.animation = 'beamUp 2s ease-out';
    setTimeout(() => {
      document.body.style.animation = '';
      this.showVoiceResponse('✨ Transport complete!');
    }, 2000);
  }

  private order66() {
    this.showVoiceResponse('⚠️ Execute Order 66: Delete all agents?', 'warning');
    this.speak('It will be done, my lord.');
    
    // Dramatic effect
    document.body.style.filter = 'hue-rotate(180deg)';
    setTimeout(() => {
      document.body.style.filter = '';
    }, 3000);
  }

  private helloComputer() {
    this.showVoiceResponse('👋 Hello! How may I assist you today?');
    this.speak('Hello! Voice commands are active. Say Hey Arc followed by your command.');
  }

  private sudoSandwich() {
    this.showVoiceResponse('🥪 Okay. *makes sandwich*');
    
    // Achievement
    if ((window as any).ARC_ACHIEVEMENTS) {
      (window as any).ARC_ACHIEVEMENTS.unlock('sudo_sandwich');
    }
  }

  // Visual Feedback
  private showVoiceResponse(message: string, type: 'success' | 'error' | 'warning' = 'success') {
    const colors = {
      success: '#00D4FF',
      error: '#EF4444',
      warning: '#F59E0B',
    };

    const toast = document.createElement('div');
    toast.innerHTML = `
      <div style="
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 14, 39, 0.95);
        color: ${colors[type]};
        padding: 16px 24px;
        border-radius: 12px;
        border: 2px solid ${colors[type]};
        box-shadow: 0 8px 32px ${colors[type]}40;
        z-index: 10000;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 12px;
        animation: voicePulse 0.3s ease-out;
        backdrop-filter: blur(10px);
      ">
        <div style="
          width: 8px;
          height: 8px;
          background: ${colors[type]};
          border-radius: 50%;
          animation: pulse 1s infinite;
        "></div>
        ${message}
      </div>
    `;

    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }

  private playBeep() {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      gainNode.gain.value = 0.1;

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
      // Silent fail
    }
  }

  private speak(text: string) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }

  // Public API
  start() {
    if (!this.recognition) {
      alert('Voice commands not supported in this browser');
      return;
    }

    this.isListening = true;
    this.recognition.start();
    
    this.showVoiceResponse('🎤 Listening... Say "Hey ARC" followed by a command');
    console.log('%c🎤 Voice commands activated!', 'font-size: 16px; color: #00D4FF; font-weight: bold;');
    console.log('%cSay: "Hey ARC [command]"', 'font-size: 12px; color: #7C3AED;');
  }

  stop() {
    this.isListening = false;
    if (this.recognition) {
      this.recognition.stop();
    }
    this.showVoiceResponse('🔇 Voice commands disabled');
  }

  toggle() {
    if (this.isListening) {
      this.stop();
    } else {
      this.start();
    }
  }

  showHelp() {
    console.log('%c🎤 VOICE COMMANDS', 'font-size: 20px; color: #00D4FF; font-weight: bold;');
    console.log('%cWake word: "Hey ARC"', 'font-size: 14px; color: #F59E0B;');
    console.log('\n📍 Navigation:');
    this.commands.filter(c => c.category === 'navigation').forEach(c => {
      console.log(`  - ${c.phrase[0]}: ${c.description}`);
    });
    console.log('\n🤖 Agent Control:');
    this.commands.filter(c => c.category === 'agent').forEach(c => {
      console.log(`  - ${c.phrase[0]}: ${c.description}`);
    });
    console.log('\n⚙️ System:');
    this.commands.filter(c => c.category === 'system').forEach(c => {
      console.log(`  - ${c.phrase[0]}: ${c.description}`);
    });
    console.log('\n🥚 Easter Eggs:');
    this.commands.filter(c => c.category === 'easter-egg').forEach(c => {
      console.log(`  - ${c.phrase[0]}: ${c.description}`);
    });
  }
}

// Initialize
let voiceManager: VoiceCommandManager | undefined;

if (typeof window !== 'undefined') {
  voiceManager = new VoiceCommandManager();
  (window as any).ARC_VOICE = voiceManager;
  
  // Add keyboard shortcut (Ctrl/Cmd + Shift + V)
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'V') {
      e.preventDefault();
      voiceManager!.toggle();
    }
  });

  console.log('%c🎤 Voice commands ready!', 'font-size: 12px; color: #00D4FF;');
  console.log('%cPress Ctrl+Shift+V to activate', 'font-size: 10px; color: #94A3B8;');
  console.log('%cType window.ARC_VOICE.showHelp() for commands', 'font-size: 10px; color: #94A3B8;');
}

export default voiceManager!;
export { VoiceCommandManager };
