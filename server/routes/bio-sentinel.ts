import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { eq, desc, sql, and, gte } from "drizzle-orm";
import { sensorReadings, smellProfiles, smellCaptures } from "@shared/schema";
import OpenAI from "openai";

export const bioSentinelRouter = Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ============================================
// SENSOR READINGS
// ============================================

bioSentinelRouter.get("/readings", async (req, res) => {
  try {
    const { deviceId, hours = 24 } = req.query;
    const hoursNum = parseInt(hours as string);
    const since = new Date(Date.now() - hoursNum * 60 * 60 * 1000);

    let readings;

    if (deviceId) {
      readings = await db
        .select()
        .from(sensorReadings)
        .where(
          and(eq(sensorReadings.deviceId, deviceId as string), gte(sensorReadings.createdAt, since))
        )
        .orderBy(desc(sensorReadings.createdAt))
        .limit(1000);
    } else {
      readings = await db
        .select()
        .from(sensorReadings)
        .orderBy(desc(sensorReadings.createdAt))
        .limit(1000);
    }

    res.json(readings);
  } catch (error) {
    console.error("Error fetching sensor readings:", error);
    res.status(500).json({ error: "Failed to fetch readings" });
  }
});

bioSentinelRouter.post("/readings", async (req, res) => {
  try {
    const data = req.body;

    const [reading] = await db
      .insert(sensorReadings)
      .values({
        deviceId: data.deviceId,
        gasResistance: data.gasResistance,
        temperature: data.temperature,
        humidity: data.humidity,
        pressure: data.pressure,
        iaqScore: data.iaqScore,
        co2Equivalent: data.co2Equivalent,
        vocEquivalent: data.vocEquivalent,
        heaterTemperature: data.heaterTemperature,
        mode: data.mode,
      })
      .returning();

    res.json(reading);
  } catch (error) {
    console.error("Error saving sensor reading:", error);
    res.status(500).json({ error: "Failed to save reading" });
  }
});

// ============================================
// AI ANALYSIS
// ============================================

bioSentinelRouter.post("/analyze", async (req, res) => {
  try {
    const { deviceId, question, context } = req.body;

    // Get recent readings
    const recentReadings = await db
      .select()
      .from(sensorReadings)
      .where(eq(sensorReadings.deviceId, deviceId))
      .orderBy(desc(sensorReadings.createdAt))
      .limit(100);

    if (recentReadings.length === 0) {
      return res.json({
        answer: "لا توجد قراءات متاحة حالياً للتحليل. يرجى التأكد من اتصال الجهاز.",
        confidence: 0,
      });
    }

    // Calculate statistics
    const stats = {
      avgGasResistance:
        recentReadings.reduce((sum, r) => sum + (r.gasResistance || 0), 0) / recentReadings.length,
      avgTemperature:
        recentReadings.reduce((sum, r) => sum + (r.temperature || 0), 0) / recentReadings.length,
      avgHumidity:
        recentReadings.reduce((sum, r) => sum + (r.humidity || 0), 0) / recentReadings.length,
      avgIAQ: recentReadings.reduce((sum, r) => sum + (r.iaqScore || 0), 0) / recentReadings.length,
      avgCO2:
        recentReadings.reduce((sum, r) => sum + (r.co2Equivalent || 0), 0) /
        recentReadings.length,
      avgVOC:
        recentReadings.reduce((sum, r) => sum + (r.vocEquivalent || 0), 0) / recentReadings.length,
      minGasResistance: Math.min(...recentReadings.map((r) => r.gasResistance || 0)),
      maxGasResistance: Math.max(...recentReadings.map((r) => r.gasResistance || 0)),
      trend: detectTrend(recentReadings),
    };

    // Use AI for advanced analysis
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: `أنت خبير في تحليل بيانات أجهزة الاستشعار BME688. 
          مهمتك تحليل القراءات وتقديم رؤى عملية بناءً على البيانات.
          
          المعلومات الأساسية:
          - مقاومة الغاز (Gas Resistance): مقياس لجودة الهواء (أعلى = أفضل)
          - IAQ Score: مؤشر جودة الهواء (0-500، أقل = أفضل)
          - VOC: المركبات العضوية المتطايرة (ppm)
          - CO2 Equivalent: ثاني أكسيد الكربون المكافئ (ppm)
          
          قدم إجابات واضحة ومفيدة مع توصيات عملية.`,
        },
        {
          role: "user",
          content: `السؤال: ${question}

الإحصائيات الحالية:
- متوسط مقاومة الغاز: ${stats.avgGasResistance.toFixed(0)} أوم
- متوسط درجة الحرارة: ${stats.avgTemperature.toFixed(1)}°C
- متوسط الرطوبة: ${stats.avgHumidity.toFixed(1)}%
- متوسط IAQ: ${stats.avgIAQ.toFixed(0)}
- متوسط CO2: ${stats.avgCO2.toFixed(0)} ppm
- متوسط VOC: ${stats.avgVOC.toFixed(2)} ppm
- الاتجاه العام: ${stats.trend}

السياق الإضافي: ${context || "لا يوجد"}

عدد القراءات المحللة: ${recentReadings.length}

قدم تحليلاً شاملاً مع توصيات عملية.`,
        },
      ],
    });

    const answer = completion.choices[0].message.content || "لم أتمكن من تحليل البيانات";

    res.json({
      answer,
      stats,
      confidence: 0.85,
      readingsAnalyzed: recentReadings.length,
    });
  } catch (error) {
    console.error("Error in AI analysis:", error);
    res.status(500).json({ error: "Failed to analyze data" });
  }
});

// ============================================
// SMELL PROFILES & LEARNING
// ============================================

bioSentinelRouter.get("/profiles", async (req, res) => {
  try {
    const profiles = await db.select().from(smellProfiles).orderBy(desc(smellProfiles.createdAt));
    res.json(profiles);
  } catch (error) {
    console.error("Error fetching profiles:", error);
    res.status(500).json({ error: "Failed to fetch profiles" });
  }
});

bioSentinelRouter.post("/profiles", async (req, res) => {
  try {
    const { name, category, subcategory, description, tags } = req.body;

    // Generate embedding for the smell profile using AI
    const embeddingText = `${name} ${category} ${subcategory} ${description} ${tags?.join(" ") || ""}`;

    const embedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: embeddingText,
    });

    const [profile] = await db
      .insert(smellProfiles)
      .values({
        name,
        category,
        subcategory,
        description,
        label: `${category}/${subcategory}`,
        featureVector: embedding.data[0].embedding,
        embeddingText,
      })
      .returning();

    res.json(profile);
  } catch (error) {
    console.error("Error creating profile:", error);
    res.status(500).json({ error: "Failed to create profile" });
  }
});

// ============================================
// CAPTURES & TRAINING
// ============================================

bioSentinelRouter.post("/capture", async (req, res) => {
  try {
    const { deviceId, durationMs, samplesCount, rawData, profileId } = req.body;

    // Extract feature vector from raw data
    const featureVector = extractFeatures(rawData);

    const [capture] = await db
      .insert(smellCaptures)
      .values({
        deviceId,
        profileId,
        durationMs,
        samplesCount,
        rawData,
        featureVector,
        status: "completed",
      })
      .returning();

    // If profileId exists, update the profile's feature vector
    if (profileId) {
      const [profile] = await db
        .select()
        .from(smellProfiles)
        .where(eq(smellProfiles.id, profileId));

      if (profile) {
        // Combine old and new feature vectors (simple averaging for now)
        const oldVector = profile.featureVector as number[];
        const newVector = featureVector;

        const combined = oldVector.map((v, i) => (v + newVector[i]) / 2);

        await db
          .update(smellProfiles)
          .set({
            featureVector: combined,
            updatedAt: new Date(),
          })
          .where(eq(smellProfiles.id, profileId));
      }
    }

    res.json(capture);
  } catch (error) {
    console.error("Error saving capture:", error);
    res.status(500).json({ error: "Failed to save capture" });
  }
});

// ============================================
// PATTERN RECOGNITION
// ============================================

bioSentinelRouter.post("/recognize", async (req, res) => {
  try {
    const { readings } = req.body;

    if (!readings || readings.length < 10) {
      return res.json({
        match: null,
        confidence: 0,
        message: "عدد القراءات غير كافٍ للتعرف على النمط",
      });
    }

    // Extract features from readings
    const features = extractFeatures(readings);

    // Get all smell profiles
    const profiles = await db.select().from(smellProfiles);

    if (profiles.length === 0) {
      return res.json({
        match: null,
        confidence: 0,
        message: "لا توجد ملفات رائحة محفوظة للمقارنة",
      });
    }

    // Calculate cosine similarity with each profile
    const matches = profiles
      .map((profile) => {
        const profileVector = profile.featureVector as number[];
        if (!profileVector || profileVector.length === 0) return null;

        const similarity = cosineSimilarity(features, profileVector);

        return {
          profile,
          similarity,
        };
      })
      .filter(Boolean)
      .sort((a, b) => (b?.similarity || 0) - (a?.similarity || 0));

    const bestMatch = matches[0];

    if (!bestMatch || bestMatch.similarity < 0.6) {
      return res.json({
        match: null,
        confidence: bestMatch?.similarity || 0,
        message: "لم يتم العثور على تطابق قوي مع الملفات المحفوظة",
      });
    }

    res.json({
      match: bestMatch.profile,
      confidence: bestMatch.similarity,
      message: `تم التعرف على: ${bestMatch.profile.name}`,
    });
  } catch (error) {
    console.error("Error in pattern recognition:", error);
    res.status(500).json({ error: "Failed to recognize pattern" });
  }
});

// ============================================
// ADVANCED ANALYTICS
// ============================================

bioSentinelRouter.get("/analytics", async (req, res) => {
  try {
    const { deviceId, days = 7 } = req.query;
    const since = new Date(Date.now() - parseInt(days as string) * 24 * 60 * 60 * 1000);

    const readings = await db
      .select()
      .from(sensorReadings)
      .where(and(eq(sensorReadings.deviceId, deviceId as string), gte(sensorReadings.createdAt, since)))
      .orderBy(desc(sensorReadings.createdAt));

    // Calculate hourly averages
    const hourlyData = groupByHour(readings);

    // Detect anomalies
    const anomalies = detectAnomalies(readings);

    // Calculate trends
    const trends = {
      gasResistance: calculateTrend(readings.map((r) => r.gasResistance || 0)),
      temperature: calculateTrend(readings.map((r) => r.temperature || 0)),
      humidity: calculateTrend(readings.map((r) => r.humidity || 0)),
      iaqScore: calculateTrend(readings.map((r) => r.iaqScore || 0)),
    };

    // Health score (0-100)
    const healthScore = calculateHealthScore(readings);

    res.json({
      totalReadings: readings.length,
      periodDays: parseInt(days as string),
      hourlyData,
      anomalies,
      trends,
      healthScore,
      recommendations: generateRecommendations(readings, anomalies, trends),
    });
  } catch (error) {
    console.error("Error in analytics:", error);
    res.status(500).json({ error: "Failed to generate analytics" });
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

function extractFeatures(readings: any[]): number[] {
  // Extract meaningful features from sensor readings
  const features = [];

  // Statistical features
  const gasValues = readings.map((r) => r.gasResistance || 0);
  const tempValues = readings.map((r) => r.temperature || 0);
  const humidValues = readings.map((r) => r.humidity || 0);

  features.push(
    average(gasValues),
    stdDev(gasValues),
    Math.min(...gasValues),
    Math.max(...gasValues),
    average(tempValues),
    stdDev(tempValues),
    average(humidValues),
    stdDev(humidValues),
    // Rate of change
    calculateRateOfChange(gasValues),
    calculateRateOfChange(tempValues)
  );

  return features;
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));

  return magA && magB ? dotProduct / (magA * magB) : 0;
}

function average(arr: number[]): number {
  return arr.length > 0 ? arr.reduce((sum, v) => sum + v, 0) / arr.length : 0;
}

function stdDev(arr: number[]): number {
  const avg = average(arr);
  const squareDiffs = arr.map((v) => Math.pow(v - avg, 2));
  return Math.sqrt(average(squareDiffs));
}

function calculateRateOfChange(arr: number[]): number {
  if (arr.length < 2) return 0;
  return (arr[arr.length - 1] - arr[0]) / arr.length;
}

function detectTrend(readings: any[]): string {
  if (readings.length < 10) return "غير محدد";

  const gasValues = readings.map((r) => r.gasResistance || 0);
  const roc = calculateRateOfChange(gasValues);

  if (Math.abs(roc) < 10) return "مستقر";
  return roc > 0 ? "تحسن" : "تدهور";
}

function groupByHour(readings: any[]): any[] {
  const grouped = new Map();

  readings.forEach((r) => {
    const hour = new Date(r.createdAt).getHours();
    if (!grouped.has(hour)) {
      grouped.set(hour, []);
    }
    grouped.get(hour).push(r);
  });

  return Array.from(grouped.entries()).map(([hour, data]) => ({
    hour,
    avgGasResistance: average(data.map((d: any) => d.gasResistance || 0)),
    avgTemperature: average(data.map((d: any) => d.temperature || 0)),
    avgHumidity: average(data.map((d: any) => d.humidity || 0)),
    avgIAQ: average(data.map((d: any) => d.iaqScore || 0)),
    count: data.length,
  }));
}

function detectAnomalies(readings: any[]): any[] {
  const gasValues = readings.map((r) => r.gasResistance || 0);
  const avg = average(gasValues);
  const std = stdDev(gasValues);

  return readings
    .filter((r, i) => {
      const zScore = Math.abs((gasValues[i] - avg) / std);
      return zScore > 3; // 3 standard deviations
    })
    .map((r) => ({
      timestamp: r.createdAt,
      type: "شذوذ في القراءة",
      severity: "متوسط",
      value: r.gasResistance,
    }));
}

function calculateTrend(values: number[]): number {
  // Simple linear regression slope
  if (values.length < 2) return 0;

  const n = values.length;
  const sumX = (n * (n - 1)) / 2;
  const sumY = values.reduce((sum, v) => sum + v, 0);
  const sumXY = values.reduce((sum, v, i) => sum + i * v, 0);
  const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;

  return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
}

function calculateHealthScore(readings: any[]): number {
  if (readings.length === 0) return 50;

  const avgIAQ = average(readings.map((r) => r.iaqScore || 100));
  const avgGas = average(readings.map((r) => r.gasResistance || 0));

  // Normalize to 0-100 scale
  const iaqScore = Math.max(0, Math.min(100, 100 - avgIAQ / 5));
  const gasScore = Math.min(100, avgGas / 500);

  return Math.round((iaqScore + gasScore) / 2);
}

function generateRecommendations(
  readings: any[],
  anomalies: any[],
  trends: any
): string[] {
  const recommendations = [];

  const avgIAQ = average(readings.map((r) => r.iaqScore || 0));
  if (avgIAQ > 150) {
    recommendations.push("جودة الهواء سيئة - يُنصح بفتح النوافذ وتحسين التهوية");
  }

  const avgVOC = average(readings.map((r) => r.vocEquivalent || 0));
  if (avgVOC > 1.0) {
    recommendations.push("مستويات VOC مرتفعة - تحقق من مصادر التلوث المحتملة");
  }

  if (trends.iaqScore > 5) {
    recommendations.push("اتجاه سلبي في جودة الهواء - يُنصح بالمراقبة المستمرة");
  }

  if (anomalies.length > 5) {
    recommendations.push("تم اكتشاف شذوذ متكرر - قد يحتاج الجهاز للمعايرة");
  }

  if (recommendations.length === 0) {
    recommendations.push("جميع المؤشرات ضمن النطاق الطبيعي - استمر في المراقبة");
  }

  return recommendations;
}
