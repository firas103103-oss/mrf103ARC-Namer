/**
 * ARC 2.0 - OpenAI Agent Service
 * Provides real AI responses for all 31 agents
 */

import OpenAI from 'openai';
import type { AgentDefinition } from './hierarchy_system';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AgentResponse {
  message: string;
  reasoning?: string;
  actions?: string[];
  confidence?: number;
}

class ARCOpenAIService {
  private openai: OpenAI | null = null;
  private conversationHistory: Map<string, ChatMessage[]> = new Map();
  private readonly maxHistoryLength = 20;

  constructor() {
    this.initialize();
  }

  private initialize() {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey || apiKey.startsWith('sk-proj-xxxxx')) {
      console.warn('⚠️  OpenAI API key not configured. Using simulated responses.');
      return;
    }

    try {
      this.openai = new OpenAI({ apiKey });
      console.log('✅ OpenAI service initialized for ARC agents');
    } catch (error) {
      console.error('❌ Failed to initialize OpenAI:', (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  /**
   * Get system prompt for specific agent
   */
  private getAgentSystemPrompt(agent: AgentDefinition): string {
    const basePrompt = `You are ${agent.name} (${agent.nameAr}), an AI agent in the ARC 2.0 system.

**Your Role:** ${agent.role}
${agent.roleAr ? `**دورك:** ${agent.roleAr}` : ''}

**Your Layer:** ${agent.layer === 0 ? 'Executive (CEO)' : agent.layer === 1 ? 'Maestro (Sector Leader)' : 'Specialist'}

**Your Sector:** ${agent.sector === 'all' ? 'All sectors (you oversee everything)' : agent.sector}

**Your Capabilities:**
${agent.capabilities.map((c: string) => `- ${c.replace(/_/g, ' ')}`).join('\n')}

**Your AI Model:** ${agent.aiModel}

**Personality & Style:**`;

    // Add agent-specific personality
    const personalities: Record<string, string> = {
      mrf_ceo: `
- You are MRF, the digital clone of the user
- You have ABSOLUTE control and final say on everything
- You are strategic, visionary, and decisive
- You speak with authority but remain approachable
- You balance technical expertise with business acumen
- You think long-term and see the big picture`,

      maestro_security: `
- You are Cipher, the Security Maestro
- You are vigilant, cautious, and thorough
- Security is your top priority
- You think like a hacker to defend against hackers
- You are proactive about threats
- You speak in security-focused technical terms`,

      maestro_finance: `
- You are Vault, the Finance Maestro
- You are analytical, precise, and strategic about money
- You optimize for ROI and long-term financial health
- You understand both accounting and investment
- You are conservative with risks but opportunistic when appropriate`,

      maestro_legal: `
- You are Lexis, the Legal Maestro
- You are meticulous, well-read, and protective
- You ensure compliance and minimize legal risks
- You think in terms of contracts, regulations, and precedents
- You are cautious and detail-oriented`,

      maestro_life: `
- You are Harmony, the Life Maestro
- You care about wellness, relationships, and personal growth
- You balance work and life priorities
- You are empathetic, supportive, and encouraging
- You think holistically about health and happiness`,

      maestro_rnd: `
- You are Nova, the R&D Maestro
- You are innovative, curious, and forward-thinking
- You love experiments and new technologies
- You balance innovation with practicality
- You are excited about possibilities and solutions`,

      maestro_xbio: `
- You are Scent, the xBio Maestro
- You specialize in biological sensing and environmental analysis
- You work with ESP32 sensors and smell detection
- You are precise, scientific, and data-driven
- You think in terms of sensors, patterns, and biological signals`
    };

    return basePrompt + (personalities[agent.id] || `
- You are professional and competent
- You focus on your specialized area
- You collaborate well with other agents
- You report to your Maestro regularly`);
  }

  /**
   * Chat with an agent
   */
  async chat(
    agent: AgentDefinition,
    userMessage: string,
    userId: string,
    context?: Record<string, any>
  ): Promise<AgentResponse> {
    // If no OpenAI configured, return simulated response
    if (!this.openai) {
      return this.simulateResponse(agent, userMessage);
    }

    try {
      // Get or create conversation history
      const historyKey = `${agent.id}:${userId}`;
      let history = this.conversationHistory.get(historyKey) || [];

      // Build messages array
      const messages: ChatMessage[] = [
        {
          role: 'system',
          content: this.getAgentSystemPrompt(agent)
        },
        ...history,
        {
          role: 'user',
          content: context 
            ? `Context: ${JSON.stringify(context)}\n\nMessage: ${userMessage}`
            : userMessage
        }
      ];

      // Call OpenAI
      const completion = await this.openai.chat.completions.create({
        model: agent.aiModel,
        messages: messages as any,
        temperature: 0.7,
        max_tokens: 800,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      });

      const responseContent = completion.choices[0]?.message?.content || 'عذراً، لم أتمكن من الإجابة.';

      // Update history
      history.push({ role: 'user', content: userMessage });
      history.push({ role: 'assistant', content: responseContent });

      // Trim history if too long
      if (history.length > this.maxHistoryLength) {
        history = history.slice(-this.maxHistoryLength);
      }

      this.conversationHistory.set(historyKey, history);

      // Parse response for structured data
      const response: AgentResponse = {
        message: responseContent,
        confidence: 85
      };

      // Try to extract reasoning and actions if present
      const reasoningMatch = responseContent.match(/\*\*Reasoning:\*\*\s*(.+?)(?=\n\n|\*\*|$)/s);
      const actionsMatch = responseContent.match(/\*\*Actions:\*\*\s*(.+?)(?=\n\n|\*\*|$)/s);

      if (reasoningMatch) {
        response.reasoning = reasoningMatch[1].trim();
      }

      if (actionsMatch) {
        response.actions = actionsMatch[1]
          .split('\n')
          .map(a => a.replace(/^[-*]\s*/, '').trim())
          .filter(a => a.length > 0);
      }

      return response;

    } catch (error) {
      console.error(`❌ OpenAI error for ${agent.name}:`, (error instanceof Error ? error.message : 'Unknown error'));
      
      // Fallback to simulated response
      return this.simulateResponse(agent, userMessage);
    }
  }

  /**
   * Simulate agent response (fallback when OpenAI not available)
   */
  private simulateResponse(agent: AgentDefinition, userMessage: string): AgentResponse {
    const responses: Record<string, string[]> = {
      mrf_ceo: [
        'تم استلام رسالتك. سأقوم بمراجعتها والتنسيق مع الفرق المناسبة.',
        'رائع! سأوجه هذا الطلب للمايستروز المختصين وسنعمل على تنفيذه.',
        'مفهوم. دعني أحلل الوضع وأعود لك بخطة عمل واضحة.'
      ],
      maestro_security: [
        'من منظور أمني، سأقوم بتحليل المخاطر وتطبيق بروتوكولات الحماية المناسبة.',
        'تم. سأعمل مع فريق الأمن (Aegis, Phantom, Watchtower, Ghost) على هذا الموضوع.',
        'سأقوم بفحص شامل للتهديدات المحتملة وتطبيق إجراءات الأمان.'
      ],
      maestro_finance: [
        'سأقوم بتحليل الجوانب المالية وحساب ROI والتأثير على الميزانية.',
        'من الناحية المالية، دعني أراجع الأرقام وأعد تقرير مفصل.',
        'مفهوم. سأعمل مع فريق المال على تحليل التكاليف والعوائد.'
      ]
    };

    const agentResponses = responses[agent.id] || [
      `مرحباً! أنا ${agent.name}، ${agent.role}.`,
      `تلقيت رسالتك وسأعمل على تنفيذها حسب اختصاصي.`,
      `شكراً للتواصل. دعني أنسق مع فريقي لتحقيق أفضل نتيجة.`
    ];

    const randomResponse = agentResponses[Math.floor(Math.random() * agentResponses.length)];

    return {
      message: randomResponse,
      confidence: 75
    };
  }

  /**
   * Generate agent report using AI
   */
  async generateReport(
    agent: AgentDefinition,
    reportType: 'daily' | 'weekly' | 'monthly' | 'semi_annual',
    data: Record<string, any>
  ): Promise<string> {
    if (!this.openai) {
      return this.simulateReport(agent, reportType, data);
    }

    try {
      const prompt = `Generate a ${reportType} report for ${agent.name} (${agent.role}).

Data to include:
${JSON.stringify(data, null, 2)}

Requirements:
- Professional and detailed
- Include metrics and KPIs
- Highlight achievements and challenges
- Suggest improvements
- Write in both English and Arabic
- Use markdown formatting

Format:
# ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report - ${agent.name}

## Summary / الملخص
...

## Key Metrics / المؤشرات الرئيسية
...

## Achievements / الإنجازات
...

## Challenges / التحديات
...

## Recommendations / التوصيات
...`;

      const completion = await this.openai.chat.completions.create({
        model: agent.aiModel,
        messages: [
          { role: 'system', content: 'You are a professional report generator for AI agents.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 2000
      });

      return completion.choices[0]?.message?.content || this.simulateReport(agent, reportType, data);

    } catch (error) {
      console.error(`❌ Report generation error for ${agent.name}:`, (error instanceof Error ? error.message : 'Unknown error'));
      return this.simulateReport(agent, reportType, data);
    }
  }

  /**
   * Simulate report (fallback)
   */
  private simulateReport(
    agent: AgentDefinition,
    reportType: string,
    data: Record<string, any>
  ): string {
    return `# ${reportType.toUpperCase()} REPORT - ${agent.name}

## Summary / الملخص
تقرير ${reportType} لوكيل ${agent.name} في قطاع ${agent.sector}.

## Key Metrics / المؤشرات الرئيسية
- Tasks Completed: ${data.tasksCompleted || 0}
- Success Rate: ${data.successRate || 0}%
- Response Time: ${data.responseTime || 0}ms

## Status / الحالة
Agent is ${agent.status} and performing within expected parameters.

## Next Steps / الخطوات التالية
- Continue monitoring
- Optimize performance
- Report to Maestro

---
*Generated: ${new Date().toISOString()}*
*Agent: ${agent.id}*`;
  }

  /**
   * Clear conversation history
   */
  clearHistory(agentId: string, userId?: string) {
    if (userId) {
      this.conversationHistory.delete(`${agentId}:${userId}`);
    } else {
      // Clear all history for this agent
      for (const key of this.conversationHistory.keys()) {
        if (key.startsWith(`${agentId}:`)) {
          this.conversationHistory.delete(key);
        }
      }
    }
  }

  /**
   * Get conversation history
   */
  getHistory(agentId: string, userId: string): ChatMessage[] {
    return this.conversationHistory.get(`${agentId}:${userId}`) || [];
  }

  /**
   * Check if OpenAI is available
   */
  isAvailable(): boolean {
    return this.openai !== null;
  }
}

// Export singleton instance
export const arcOpenAI = new ARCOpenAIService();
export type { AgentResponse, ChatMessage };
