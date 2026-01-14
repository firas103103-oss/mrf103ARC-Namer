/**
 * 🧠 ARC Self-Learning System
 * نظام التعلم الذاتي والتطور
 * 
 * القدرات:
 * - تعلم من التجارب
 * - التكيف مع الظروف الجديدة
 * - النمو والتطور المستمر
 * - التكاثر (إنشاء وكلاء جدد)
 * - التحسين الذاتي
 */

import { EventEmitter } from 'events';
import { arcHierarchy, AgentDefinition } from './hierarchy_system';

// ===============================
// 🔷 TYPES & INTERFACES
// ===============================

export interface Experience {
  id: string;
  agentId: string;
  timestamp: Date;
  context: string;
  action: string;
  result: 'success' | 'failure' | 'partial';
  feedback?: string;
  metrics: {
    executionTime: number;
    resourceUsage: number;
    accuracy: number;
  };
  learnings: string[];
}

export interface Pattern {
  id: string;
  agentId: string;
  name: string;
  description: string;
  frequency: number;
  confidence: number;
  createdAt: Date;
  lastSeen: Date;
  relatedExperiences: string[];
  triggers: string[];
  expectedOutcome: string;
}

export interface Skill {
  id: string;
  name: string;
  nameAr: string;
  category: string;
  level: number; // 0-100
  acquiredAt: Date;
  lastUsed: Date;
  usageCount: number;
  successRate: number;
}

export interface Evolution {
  id: string;
  agentId: string;
  timestamp: Date;
  type: 'capability' | 'skill' | 'pattern' | 'optimization';
  description: string;
  impact: number; // 0-100
  before: any;
  after: any;
}

export interface LearningGoal {
  id: string;
  agentId: string;
  goal: string;
  targetDate: Date;
  progress: number; // 0-100
  milestones: {
    description: string;
    completed: boolean;
    completedAt?: Date;
  }[];
  status: 'active' | 'completed' | 'abandoned';
}

export interface KnowledgeBase {
  agentId: string;
  experiences: Experience[];
  patterns: Pattern[];
  skills: Skill[];
  evolutions: Evolution[];
  goals: LearningGoal[];
  metadata: {
    totalLearnings: number;
    learningRate: number;
    adaptationScore: number;
    evolutionIndex: number;
    lastUpdate: Date;
  };
}

// ===============================
// 🧠 SELF-LEARNING SYSTEM CLASS
// ===============================

export class ARCSelfLearningSystem extends EventEmitter {
  private knowledgeBases: Map<string, KnowledgeBase> = new Map();
  private globalPatterns: Map<string, Pattern> = new Map();
  private learningEnabled: boolean = true;

  constructor() {
    super();
    this.initialize();
  }

  private initialize(): void {
    console.log('🧠 Initializing ARC Self-Learning System...');
    
    // Initialize knowledge bases for all agents
    const agents = arcHierarchy.getAllAgents();
    agents.forEach(agent => {
      this.initializeKnowledgeBase(agent.id);
    });

    console.log(`✅ Knowledge bases initialized for ${agents.length} agents`);
  }

  // ===============================
  // 📚 KNOWLEDGE BASE MANAGEMENT
  // ===============================

  private initializeKnowledgeBase(agentId: string): void {
    const kb: KnowledgeBase = {
      agentId,
      experiences: [],
      patterns: [],
      skills: this.getInitialSkills(agentId),
      evolutions: [],
      goals: [],
      metadata: {
        totalLearnings: 0,
        learningRate: 1.0,
        adaptationScore: 50,
        evolutionIndex: 0,
        lastUpdate: new Date()
      }
    };

    this.knowledgeBases.set(agentId, kb);
  }

  private getInitialSkills(agentId: string): Skill[] {
    const agent = arcHierarchy.getAgent(agentId);
    if (!agent) return [];

    return agent.capabilities.map((cap, index) => ({
      id: `skill_${agentId}_${index}`,
      name: cap,
      nameAr: this.translateSkillName(cap),
      category: this.categorizeSkill(cap),
      level: 50, // Start at intermediate level
      acquiredAt: new Date(),
      lastUsed: new Date(),
      usageCount: 0,
      successRate: 100
    }));
  }

  private translateSkillName(name: string): string {
    const translations: Record<string, string> = {
      'absolute_control': 'السيطرة المطلقة',
      'security_oversight': 'الإشراف الأمني',
      'threat_detection': 'كشف التهديدات',
      'encryption_management': 'إدارة التشفير',
      'financial_oversight': 'الإشراف المالي',
      'budget_management': 'إدارة الميزانية',
      // Add more as needed
    };
    return translations[name] || name;
  }

  private categorizeSkill(skillName: string): string {
    if (skillName.includes('security') || skillName.includes('threat')) return 'Security';
    if (skillName.includes('financial') || skillName.includes('budget')) return 'Finance';
    if (skillName.includes('legal') || skillName.includes('document')) return 'Legal';
    if (skillName.includes('health') || skillName.includes('wellness')) return 'Life';
    if (skillName.includes('research') || skillName.includes('innovation')) return 'R&D';
    if (skillName.includes('smell') || skillName.includes('sensor')) return 'xBio';
    return 'General';
  }

  // ===============================
  // 📖 EXPERIENCE RECORDING
  // ===============================

  async recordExperience(
    agentId: string,
    context: string,
    action: string,
    result: Experience['result'],
    metrics: Experience['metrics'],
    feedback?: string
  ): Promise<Experience> {
    const kb = this.knowledgeBases.get(agentId);
    if (!kb) throw new Error(`Knowledge base not found for agent ${agentId}`);

    const experience: Experience = {
      id: this.generateId('exp'),
      agentId,
      timestamp: new Date(),
      context,
      action,
      result,
      feedback,
      metrics,
      learnings: await this.extractLearnings(context, action, result, metrics)
    };

    kb.experiences.push(experience);
    kb.metadata.totalLearnings += experience.learnings.length;
    kb.metadata.lastUpdate = new Date();

    // Analyze for patterns
    await this.analyzeForPatterns(agentId, experience);

    // Update skills
    await this.updateSkillsFromExperience(agentId, experience);

    // Check for evolution opportunities
    await this.checkEvolutionOpportunities(agentId);

    this.emit('experience_recorded', experience);
    return experience;
  }

  private async extractLearnings(
    context: string,
    action: string,
    result: Experience['result'],
    metrics: Experience['metrics']
  ): Promise<string[]> {
    const learnings: string[] = [];

    // Fast execution is good
    if (metrics.executionTime < 100) {
      learnings.push('Fast execution achieved - maintain current approach');
    } else if (metrics.executionTime > 1000) {
      learnings.push('Slow execution detected - optimization needed');
    }

    // High accuracy is good
    if (metrics.accuracy > 95) {
      learnings.push('High accuracy maintained');
    } else if (metrics.accuracy < 80) {
      learnings.push('Accuracy below threshold - review approach');
    }

    // Result-based learnings
    if (result === 'success') {
      learnings.push(`Successful approach for context: ${context}`);
    } else if (result === 'failure') {
      learnings.push(`Failed approach for context: ${context} - avoid in future`);
    }

    return learnings;
  }

  // ===============================
  // 🔍 PATTERN RECOGNITION
  // ===============================

  private async analyzeForPatterns(agentId: string, experience: Experience): Promise<void> {
    const kb = this.knowledgeBases.get(agentId);
    if (!kb) return;

    // Look for similar experiences
    const similarExperiences = kb.experiences.filter(exp => 
      exp.context === experience.context &&
      exp.action === experience.action &&
      exp.id !== experience.id
    );

    if (similarExperiences.length >= 3) {
      // We have a pattern!
      const existingPattern = kb.patterns.find(p => 
        p.triggers.includes(experience.context)
      );

      if (existingPattern) {
        // Update existing pattern
        existingPattern.frequency++;
        existingPattern.lastSeen = new Date();
        existingPattern.confidence = Math.min(
          100,
          existingPattern.confidence + 5
        );
        existingPattern.relatedExperiences.push(experience.id);
      } else {
        // Create new pattern
        const pattern: Pattern = {
          id: this.generateId('pattern'),
          agentId,
          name: `Pattern: ${experience.context} → ${experience.action}`,
          description: `Recurring pattern detected for context "${experience.context}"`,
          frequency: similarExperiences.length + 1,
          confidence: 60,
          createdAt: new Date(),
          lastSeen: new Date(),
          relatedExperiences: [experience.id, ...similarExperiences.map(e => e.id)],
          triggers: [experience.context],
          expectedOutcome: experience.result
        };

        kb.patterns.push(pattern);
        this.globalPatterns.set(pattern.id, pattern);
        this.emit('pattern_discovered', pattern);
      }
    }
  }

  // ===============================
  // 🎯 SKILL DEVELOPMENT
  // ===============================

  private async updateSkillsFromExperience(agentId: string, experience: Experience): Promise<void> {
    const kb = this.knowledgeBases.get(agentId);
    if (!kb) return;

    // Update related skills
    const relatedSkills = kb.skills.filter(skill => 
      experience.action.includes(skill.name) ||
      experience.context.includes(skill.name)
    );

    for (const skill of relatedSkills) {
      skill.usageCount++;
      skill.lastUsed = new Date();

      // Update success rate
      if (experience.result === 'success') {
        skill.successRate = (skill.successRate * (skill.usageCount - 1) + 100) / skill.usageCount;
      } else if (experience.result === 'failure') {
        skill.successRate = (skill.successRate * (skill.usageCount - 1)) / skill.usageCount;
      }

      // Level up if performing well
      if (skill.usageCount % 10 === 0 && skill.successRate > 80) {
        const oldLevel = skill.level;
        skill.level = Math.min(100, skill.level + 5);
        
        if (skill.level !== oldLevel) {
          this.emit('skill_improved', { agentId, skill, oldLevel });
        }
      }
    }
  }

  async learnNewSkill(agentId: string, skillName: string, category: string): Promise<Skill> {
    const kb = this.knowledgeBases.get(agentId);
    if (!kb) throw new Error(`Knowledge base not found for agent ${agentId}`);

    const newSkill: Skill = {
      id: this.generateId('skill'),
      name: skillName,
      nameAr: this.translateSkillName(skillName),
      category,
      level: 10, // Start as beginner
      acquiredAt: new Date(),
      lastUsed: new Date(),
      usageCount: 0,
      successRate: 100
    };

    kb.skills.push(newSkill);
    
    const evolution: Evolution = {
      id: this.generateId('evo'),
      agentId,
      timestamp: new Date(),
      type: 'skill',
      description: `Learned new skill: ${skillName}`,
      impact: 10,
      before: null,
      after: newSkill
    };

    kb.evolutions.push(evolution);
    kb.metadata.evolutionIndex += 1;

    this.emit('skill_learned', { agentId, skill: newSkill });
    return newSkill;
  }

  // ===============================
  // 🌱 EVOLUTION & GROWTH
  // ===============================

  private async checkEvolutionOpportunities(agentId: string): Promise<void> {
    const kb = this.knowledgeBases.get(agentId);
    if (!kb) return;

    // Check if agent is ready to evolve
    const readyToEvolve = 
      kb.experiences.length > 50 &&
      kb.patterns.length > 5 &&
      kb.skills.some(s => s.level > 80);

    if (readyToEvolve) {
      await this.triggerEvolution(agentId);
    }
  }

  private async triggerEvolution(agentId: string): Promise<void> {
    const kb = this.knowledgeBases.get(agentId);
    if (!kb) return;

    // Increase adaptation score
    const oldScore = kb.metadata.adaptationScore;
    kb.metadata.adaptationScore = Math.min(100, oldScore + 10);

    // Increase learning rate
    const oldRate = kb.metadata.learningRate;
    kb.metadata.learningRate = Math.min(2.0, oldRate + 0.1);

    const evolution: Evolution = {
      id: this.generateId('evo'),
      agentId,
      timestamp: new Date(),
      type: 'optimization',
      description: 'Agent evolved through accumulated experience',
      impact: 25,
      before: { adaptationScore: oldScore, learningRate: oldRate },
      after: { adaptationScore: kb.metadata.adaptationScore, learningRate: kb.metadata.learningRate }
    };

    kb.evolutions.push(evolution);
    kb.metadata.evolutionIndex += 10;

    this.emit('agent_evolved', { agentId, evolution });
  }

  // ===============================
  // 🎯 GOAL MANAGEMENT
  // ===============================

  async setLearningGoal(
    agentId: string,
    goal: string,
    targetDate: Date,
    milestones: string[]
  ): Promise<LearningGoal> {
    const kb = this.knowledgeBases.get(agentId);
    if (!kb) throw new Error(`Knowledge base not found for agent ${agentId}`);

    const learningGoal: LearningGoal = {
      id: this.generateId('goal'),
      agentId,
      goal,
      targetDate,
      progress: 0,
      milestones: milestones.map(m => ({
        description: m,
        completed: false
      })),
      status: 'active'
    };

    kb.goals.push(learningGoal);
    this.emit('learning_goal_set', learningGoal);
    return learningGoal;
  }

  async updateGoalProgress(goalId: string, milestoneIndex: number): Promise<void> {
    for (const kb of this.knowledgeBases.values()) {
      const goal = kb.goals.find(g => g.id === goalId);
      if (goal) {
        goal.milestones[milestoneIndex].completed = true;
        goal.milestones[milestoneIndex].completedAt = new Date();
        
        // Update progress
        const completedCount = goal.milestones.filter(m => m.completed).length;
        goal.progress = (completedCount / goal.milestones.length) * 100;

        // Check if goal is completed
        if (goal.progress === 100) {
          goal.status = 'completed';
          this.emit('learning_goal_completed', goal);
        }

        this.emit('goal_progress_updated', goal);
        return;
      }
    }
  }

  // ===============================
  // 📊 ANALYTICS & INSIGHTS
  // ===============================

  getAgentLearningStats(agentId: string): object | null {
    const kb = this.knowledgeBases.get(agentId);
    if (!kb) return null;

    return {
      experiences: {
        total: kb.experiences.length,
        successes: kb.experiences.filter(e => e.result === 'success').length,
        failures: kb.experiences.filter(e => e.result === 'failure').length,
        successRate: kb.experiences.length > 0 
          ? (kb.experiences.filter(e => e.result === 'success').length / kb.experiences.length * 100).toFixed(2)
          : 0
      },
      patterns: {
        total: kb.patterns.length,
        highConfidence: kb.patterns.filter(p => p.confidence > 80).length,
        avgConfidence: kb.patterns.length > 0
          ? (kb.patterns.reduce((sum, p) => sum + p.confidence, 0) / kb.patterns.length).toFixed(2)
          : 0
      },
      skills: {
        total: kb.skills.length,
        expert: kb.skills.filter(s => s.level > 80).length,
        intermediate: kb.skills.filter(s => s.level > 40 && s.level <= 80).length,
        beginner: kb.skills.filter(s => s.level <= 40).length,
        avgLevel: (kb.skills.reduce((sum, s) => sum + s.level, 0) / kb.skills.length).toFixed(2),
        avgSuccessRate: (kb.skills.reduce((sum, s) => sum + s.successRate, 0) / kb.skills.length).toFixed(2)
      },
      evolutions: {
        total: kb.evolutions.length,
        capabilities: kb.evolutions.filter(e => e.type === 'capability').length,
        skills: kb.evolutions.filter(e => e.type === 'skill').length,
        patterns: kb.evolutions.filter(e => e.type === 'pattern').length,
        optimizations: kb.evolutions.filter(e => e.type === 'optimization').length
      },
      goals: {
        total: kb.goals.length,
        active: kb.goals.filter(g => g.status === 'active').length,
        completed: kb.goals.filter(g => g.status === 'completed').length,
        avgProgress: kb.goals.length > 0
          ? (kb.goals.reduce((sum, g) => sum + g.progress, 0) / kb.goals.length).toFixed(2)
          : 0
      },
      metadata: kb.metadata
    };
  }

  getAllLearningStats(): object {
    const allStats: any = {};
    
    for (const [agentId, kb] of this.knowledgeBases.entries()) {
      const agent = arcHierarchy.getAgent(agentId);
      if (agent) {
        allStats[agent.name] = this.getAgentLearningStats(agentId);
      }
    }

    return allStats;
  }

  // ===============================
  // 🛠️ UTILITY METHODS
  // ===============================

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getKnowledgeBase(agentId: string): KnowledgeBase | undefined {
    return this.knowledgeBases.get(agentId);
  }

  getGlobalPatterns(): Pattern[] {
    return Array.from(this.globalPatterns.values());
  }

  enableLearning(): void {
    this.learningEnabled = true;
    this.emit('learning_enabled');
  }

  disableLearning(): void {
    this.learningEnabled = false;
    this.emit('learning_disabled');
  }

  isLearningEnabled(): boolean {
    return this.learningEnabled;
  }
}

// Singleton instance
export const arcLearning = new ARCSelfLearningSystem();
