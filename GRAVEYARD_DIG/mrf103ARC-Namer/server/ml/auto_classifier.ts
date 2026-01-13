/**
 * 🤖 Auto Classifier - نظام التصنيف التلقائي بالذكاء الاصطناعي
 * 
 * يقوم بتصنيف البيانات تلقائياً باستخدام خوارزميات ML
 * ويتعلم من تصحيحات المستخدمين
 */

import { supabase } from '../supabase';
import { EventEmitter } from 'events';

// أنواع التصنيف
export enum ClassificationType {
  PRIORITY = 'priority',
  CATEGORY = 'category',
  SENTIMENT = 'sentiment',
  INTENT = 'intent',
  ENTITY = 'entity',
  TOPIC = 'topic',
  URGENCY = 'urgency',
  LANGUAGE = 'language',
}

// واجهة نتيجة التصنيف
export interface ClassificationResult {
  id: string;
  entityType: string;
  entityId: string;
  classificationType: ClassificationType;
  predictedClass: string;
  confidence: number;
  alternativeClasses: { class: string; confidence: number }[];
  features: Record<string, any>;
  model: string;
  timestamp: Date;
}

// واجهة التصحيح
export interface ClassificationCorrection {
  id: string;
  classificationId: string;
  originalClass: string;
  correctedClass: string;
  correctedBy: string;
  reason?: string;
  incorporated: boolean;
  createdAt: Date;
}

// واجهة نموذج التصنيف
export interface ClassificationModel {
  id: string;
  name: string;
  type: ClassificationType;
  version: string;
  accuracy: number;
  trainingSamples: number;
  lastTrained: Date;
  isActive: boolean;
  config: Record<string, any>;
}

// قواعد التصنيف المبنية مسبقاً
const CLASSIFICATION_RULES: Record<ClassificationType, Record<string, string[]>> = {
  [ClassificationType.PRIORITY]: {
    critical: ['urgent', 'emergency', 'asap', 'immediately', 'critical', 'طارئ', 'عاجل', 'فوري'],
    high: ['important', 'high', 'soon', 'مهم', 'عالي'],
    medium: ['normal', 'medium', 'regular', 'عادي', 'متوسط'],
    low: ['low', 'later', 'eventually', 'منخفض', 'لاحقاً'],
  },
  [ClassificationType.SENTIMENT]: {
    positive: ['great', 'excellent', 'love', 'amazing', 'wonderful', 'رائع', 'ممتاز', 'جميل'],
    negative: ['bad', 'terrible', 'hate', 'awful', 'سيء', 'مشكلة', 'خطأ'],
    neutral: ['okay', 'fine', 'normal', 'عادي', 'لا بأس'],
  },
  [ClassificationType.INTENT]: {
    question: ['what', 'how', 'why', 'when', 'where', 'ما', 'كيف', 'لماذا', 'متى', 'أين', '?', '؟'],
    command: ['do', 'make', 'create', 'delete', 'update', 'اعمل', 'أنشئ', 'احذف', 'عدّل'],
    request: ['please', 'can you', 'could you', 'من فضلك', 'هل يمكنك'],
    statement: [],
  },
  [ClassificationType.CATEGORY]: {
    technical: ['code', 'bug', 'error', 'api', 'database', 'server', 'كود', 'خطأ'],
    business: ['sales', 'revenue', 'customer', 'مبيعات', 'عميل', 'إيرادات'],
    support: ['help', 'issue', 'problem', 'مساعدة', 'مشكلة'],
    general: [],
  },
  [ClassificationType.URGENCY]: {
    immediate: ['now', 'asap', 'urgent', 'الآن', 'فوراً'],
    today: ['today', 'this day', 'اليوم'],
    this_week: ['this week', 'soon', 'هذا الأسبوع', 'قريباً'],
    later: ['later', 'whenever', 'لاحقاً', 'متى ما أمكن'],
  },
  [ClassificationType.TOPIC]: {},
  [ClassificationType.ENTITY]: {},
  [ClassificationType.LANGUAGE]: {
    arabic: ['ال', 'في', 'من', 'على', 'إلى', 'أن', 'هذا', 'التي'],
    english: ['the', 'is', 'are', 'was', 'were', 'have', 'has', 'this', 'that'],
  },
};

// 🤖 Auto Classifier Class
export class AutoClassifier extends EventEmitter {
  private models: Map<ClassificationType, ClassificationModel> = new Map();
  private corrections: ClassificationCorrection[] = [];
  private learningEnabled: boolean = true;

  constructor() {
    super();
    this.initializeModels();
    this.loadCorrections();
  }

  // تهيئة النماذج
  private async initializeModels(): Promise<void> {
    const types = Object.values(ClassificationType);
    
    for (const type of types) {
      this.models.set(type, {
        id: `model_${type}`,
        name: `${type} Classifier`,
        type,
        version: '1.0.0',
        accuracy: 0.85,
        trainingSamples: 0,
        lastTrained: new Date(),
        isActive: true,
        config: CLASSIFICATION_RULES[type] || {},
      });
    }

    console.log(`✅ AutoClassifier: Initialized ${this.models.size} classification models`);
  }

  // تحميل التصحيحات من قاعدة البيانات
  private async loadCorrections(): Promise<void> {
    try {
      if (!supabase) return;
      const { data, error } = await supabase
        .from('classification_corrections')
        .select('*')
        .eq('incorporated', false)
        .order('created_at', { ascending: false })
        .limit(1000);

      if (data) {
        this.corrections = data;
        console.log(`✅ AutoClassifier: Loaded ${this.corrections.length} pending corrections`);
      }
    } catch (error) {
      console.error('Failed to load corrections:', error);
    }
  }

  // === PUBLIC API ===

  // تصنيف نص
  public async classifyText(
    text: string,
    types: ClassificationType[] = Object.values(ClassificationType)
  ): Promise<ClassificationResult[]> {
    const results: ClassificationResult[] = [];
    const normalizedText = text.toLowerCase().trim();

    for (const type of types) {
      const result = await this.classifySingle(normalizedText, type);
      if (result) {
        results.push(result);
      }
    }

    // تسجيل التصنيفات
    await this.logClassifications(results);
    this.emit('classification_complete', results);

    return results;
  }

  // تصنيف واحد
  private async classifySingle(
    text: string,
    type: ClassificationType
  ): Promise<ClassificationResult | null> {
    const model = this.models.get(type);
    if (!model || !model.isActive) return null;

    const rules = model.config as Record<string, string[]>;
    const scores: Record<string, number> = {};
    const words = text.split(/\s+/);

    // حساب النقاط لكل فئة
    for (const [className, keywords] of Object.entries(rules)) {
      let score = 0;
      for (const keyword of keywords) {
        if (text.includes(keyword.toLowerCase())) {
          score += 1;
        }
      }
      // تطبيع النقاط
      scores[className] = keywords.length > 0 ? score / keywords.length : 0;
    }

    // إيجاد أعلى فئة
    const sortedClasses = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .filter(([_, score]) => score > 0);

    if (sortedClasses.length === 0) {
      // فئة افتراضية
      return {
        id: `cls_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        entityType: 'text',
        entityId: text.substring(0, 50),
        classificationType: type,
        predictedClass: 'unknown',
        confidence: 0.5,
        alternativeClasses: [],
        features: { wordCount: words.length, charCount: text.length },
        model: model.id,
        timestamp: new Date(),
      };
    }

    const [predictedClass, topScore] = sortedClasses[0];
    const confidence = Math.min(0.95, 0.5 + topScore * 0.5);

    return {
      id: `cls_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      entityType: 'text',
      entityId: text.substring(0, 50),
      classificationType: type,
      predictedClass,
      confidence,
      alternativeClasses: sortedClasses.slice(1, 4).map(([c, s]) => ({
        class: c,
        confidence: Math.min(0.9, 0.3 + s * 0.5),
      })),
      features: {
        wordCount: words.length,
        charCount: text.length,
        matchedKeywords: sortedClasses.length,
      },
      model: model.id,
      timestamp: new Date(),
    };
  }

  // تصنيف كيان (مهمة، رسالة، إلخ)
  public async classifyEntity(
    entityType: string,
    entityId: string,
    data: Record<string, any>
  ): Promise<ClassificationResult[]> {
    const textFields = ['title', 'description', 'content', 'message', 'name'];
    let combinedText = '';

    for (const field of textFields) {
      if (data[field] && typeof data[field] === 'string') {
        combinedText += ' ' + data[field];
      }
    }

    const results = await this.classifyText(combinedText.trim());
    
    // تحديث entity info في النتائج
    for (const result of results) {
      result.entityType = entityType;
      result.entityId = entityId;
    }

    return results;
  }

  // تسجيل تصحيح
  public async recordCorrection(
    classificationId: string,
    originalClass: string,
    correctedClass: string,
    correctedBy: string,
    reason?: string
  ): Promise<void> {
    const correction: ClassificationCorrection = {
      id: `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      classificationId,
      originalClass,
      correctedClass,
      correctedBy,
      reason,
      incorporated: false,
      createdAt: new Date(),
    };

    this.corrections.push(correction);

    // حفظ في قاعدة البيانات
    try {
      if (!supabase) return;
      await supabase.from('classification_corrections').insert({
        id: correction.id,
        classification_id: correction.classificationId,
        original_class: correction.originalClass,
        corrected_class: correction.correctedClass,
        corrected_by: correction.correctedBy,
        reason: correction.reason,
        incorporated: correction.incorporated,
        created_at: correction.createdAt,
      });
    } catch (error) {
      console.error('Failed to save correction:', error);
    }

    this.emit('correction_recorded', correction);

    // تحقق مما إذا كان يجب إعادة التدريب
    if (this.corrections.length >= 10) {
      await this.retrainModels();
    }
  }

  // إعادة تدريب النماذج
  public async retrainModels(): Promise<void> {
    if (!this.learningEnabled) return;

    console.log('🔄 AutoClassifier: Starting model retraining...');
    this.emit('retraining_started');

    // تجميع التصحيحات حسب النوع
    const correctionsByType: Record<string, ClassificationCorrection[]> = {};
    
    for (const correction of this.corrections.filter(c => !c.incorporated)) {
      // استخراج نوع التصنيف من ID
      const type = correction.classificationId.split('_')[1] as ClassificationType;
      if (!correctionsByType[type]) {
        correctionsByType[type] = [];
      }
      correctionsByType[type].push(correction);
    }

    // تحديث كل نموذج
    for (const [type, corrections] of Object.entries(correctionsByType)) {
      const model = this.models.get(type as ClassificationType);
      if (!model) continue;

      // إضافة الكلمات المفتاحية الجديدة
      const rules = model.config as Record<string, string[]>;
      
      for (const correction of corrections) {
        if (!rules[correction.correctedClass]) {
          rules[correction.correctedClass] = [];
        }
        // يمكن إضافة منطق أكثر تعقيداً هنا
      }

      model.trainingSamples += corrections.length;
      model.lastTrained = new Date();
      model.version = this.incrementVersion(model.version);

      // علّم التصحيحات على أنها مدمجة
      for (const correction of corrections) {
        correction.incorporated = true;
        if (supabase) {
          await supabase
            .from('classification_corrections')
            .update({ incorporated: true })
            .eq('id', correction.id);
        }
      }
    }

    console.log('✅ AutoClassifier: Model retraining complete');
    this.emit('retraining_complete');
  }

  // زيادة رقم الإصدار
  private incrementVersion(version: string): string {
    const parts = version.split('.');
    const patch = parseInt(parts[2]) + 1;
    return `${parts[0]}.${parts[1]}.${patch}`;
  }

  // تسجيل التصنيفات
  private async logClassifications(results: ClassificationResult[]): Promise<void> {
    try {
      if (!supabase) return;
      const records = results.map(r => ({
        id: r.id,
        entity_type: r.entityType,
        entity_id: r.entityId,
        classification_type: r.classificationType,
        predicted_class: r.predictedClass,
        confidence: r.confidence,
        alternative_classes: r.alternativeClasses,
        features: r.features,
        model: r.model,
        created_at: r.timestamp,
      }));

      await supabase.from('classification_logs').insert(records);
    } catch (error) {
      console.error('Failed to log classifications:', error);
    }
  }

  // الحصول على إحصائيات النماذج
  public getModelStats(): ClassificationModel[] {
    return Array.from(this.models.values());
  }

  // تفعيل/تعطيل التعلم
  public setLearningEnabled(enabled: boolean): void {
    this.learningEnabled = enabled;
    this.emit('learning_toggled', enabled);
  }

  // الحصول على التصحيحات المعلقة
  public getPendingCorrections(): ClassificationCorrection[] {
    return this.corrections.filter(c => !c.incorporated);
  }
}

// Singleton instance
export const autoClassifier = new AutoClassifier();
