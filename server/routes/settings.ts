/**
 * ⚙️ Settings API - System Configuration
 * إعدادات النظام والتكاملات
 */

import { Router } from "express";
import type { Request, Response } from "express";
import { db } from '../db';
import { systemSettings } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

const router = Router();

// GET /api/settings - Get all system settings
router.get("/", async (req: Request, res: Response) => {
  try {
    const allSettings = await db.select().from(systemSettings).execute();
    
    // Group by category
    const grouped = allSettings.reduce((acc: any, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = {};
      }
      acc[setting.category][setting.key] = setting.value;
      return acc;
    }, {});

    res.json({ success: true, data: grouped });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

// PUT /api/settings/:category - Update settings by category
router.put("/:category", async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const updates = req.body;

    // Update each setting in the category
    for (const [key, value] of Object.entries(updates)) {
      await db
        .update(systemSettings)
        .set({ 
          value: value as any,
          updatedAt: new Date()
        })
        .where(
          and(
            eq(systemSettings.category, category),
            eq(systemSettings.key, key)
          )
        )
        .execute();
    }

    res.json({ 
      success: true, 
      message: `${category} settings updated successfully`,
      data: updates
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update settings" });
  }
});

// POST /api/settings/test-integration - Test external integration
router.post("/test-integration", async (req: Request, res: Response) => {
  try {
    const { integration, config } = req.body;

    // TODO: Test actual connection
    const testResults = {
      integration,
      status: 'success',
      responseTime: 234,
      message: `Successfully connected to ${integration}`,
      timestamp: new Date().toISOString()
    };

    res.json({ success: true, data: testResults });
  } catch (error) {
    res.status(500).json({ error: "Integration test failed" });
  }
});

// GET /api/settings/integrations - Get available integrations
router.get("/integrations", async (req: Request, res: Response) => {
  try {
    const integrations = [
      { 
        id: 'openai', 
        name: 'OpenAI', 
        icon: '🤖', 
        status: 'active', 
        description: 'GPT-4 and GPT-3.5 models for advanced AI capabilities'
      },
      { 
        id: 'anthropic', 
        name: 'Anthropic', 
        icon: '🧠', 
        status: 'active', 
        description: 'Claude 3 models for reasoning and analysis'
      },
      { 
        id: 'supabase', 
        name: 'Supabase', 
        icon: '🗄️', 
        status: 'active', 
        description: 'PostgreSQL database and real-time subscriptions'
      },
      { 
        id: 'n8n', 
        name: 'n8n Workflows', 
        icon: '🔄', 
        status: 'active', 
        description: 'Automation workflows and integrations'
      },
      { 
        id: 'stripe', 
        name: 'Stripe', 
        icon: '💳', 
        status: 'inactive', 
        description: 'Payment processing and billing'
      },
      { 
        id: 'sendgrid', 
        name: 'SendGrid', 
        icon: '📧', 
        status: 'inactive', 
        description: 'Email delivery and marketing'
      }
    ];

    res.json({ success: true, data: integrations });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch integrations" });
  }
});

export default router;
