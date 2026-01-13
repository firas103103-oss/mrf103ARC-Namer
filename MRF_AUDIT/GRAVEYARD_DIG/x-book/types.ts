export type Language = 'ar' | 'en' | 'de';

export enum ProcessingMode {
  STANDARD = 'standard',
  FUSION = 'fusion',
  FISSION = 'fission'
}

// الهدف الأساسي من المشروع (خطوة رئيسية جديدة)
export enum PrimaryGoal {
  PROOFREAD_EDIT = 'proofread_edit',              // تنقيح وتدقيق فقط
  ENHANCE_COMPLETE = 'enhance_complete',          // تمكين وإضافة صفحات (مقدمة، فهرس، مراجع، إندكس)
  SPLIT_SERIES = 'split_series',                  // تقسيم كتاب ضخم إلى سلسلة
  MERGE_BOOKS = 'merge_books'                     // دمج عدة كتب لكتاب واحد
}

export enum PublishingGoal {
  DRAFT = 'draft',
  COPYRIGHT = 'copyright',
  COMMERCIAL = 'commercial',
  SELF_PUBLISH = 'self_publish'
}

export enum EditingStyle {
  STANDARD = 'standard',
  CREATIVE = 'creative',
  ACADEMIC = 'academic',
  PHILOSOPHICAL = 'philosophical'
}

// مستويات التحرير (تظهر بناءً على الاختيارات السابقة)
export enum EditingIntensity {
  LIGHT = 'light',           // تصحيحات خفيفة فقط
  MODERATE = 'moderate',     // تحسينات متوسطة
  DEEP = 'deep',             // تحرير شامل
  PRESERVE_VOICE = 'preserve_voice' // المحافظة على الصوت الأصلي
}

// تفضيلات التحرير المخصصة (تظهر إذا اختار PRESERVE_VOICE)
export interface CustomEditingPreferences {
  preserveDialogueStyle: boolean;        // الحفاظ على أسلوب الحوار
  preserveNarrativeTone: boolean;        // الحفاظ على نبرة السرد
  enhanceDescriptions: boolean;          // تحسين الأوصاف
  improveStructure: boolean;             // تحسين البنية
  focusAreas: string[];                  // مجالات التركيز المحددة
  avoidChangingElements: string[];       // عناصر يجب عدم تغييرها
}

export type AspectRatio = "1:1" | "2:3" | "3:2" | "3:4" | "4:3" | "9:16" | "16:9" | "21:9";

// The steps of the conversational flow
export enum ChatStep {
  LANGUAGE_SELECT = 'LANGUAGE_SELECT',
  INTRO = 'INTRO',
  USER_NAME = 'USER_NAME',
  USER_EMAIL = 'USER_EMAIL',
  USER_COUNTRY = 'USER_COUNTRY',
  PRIMARY_GOAL = 'PRIMARY_GOAL',              // خطوة جديدة: الهدف الأساسي
  BOOK_TITLE = 'BOOK_TITLE',
  BOOK_AUTHOR = 'BOOK_AUTHOR',
  BOOK_GENRE = 'BOOK_GENRE',                   // خطوة جديدة: نوع الكتاب
  UPLOAD_MANUSCRIPT = 'UPLOAD_MANUSCRIPT',
  VALIDATE_UPLOAD = 'VALIDATE_UPLOAD',
  STRATEGY_GOAL = 'STRATEGY_GOAL',
  STRATEGY_STYLE = 'STRATEGY_STYLE',
  EDITING_INTENSITY = 'EDITING_INTENSITY',        // خطوة جديدة: مستوى التحرير
  CUSTOM_PREFERENCES = 'CUSTOM_PREFERENCES',      // خطوة شرطية: التفضيلات المخصصة
  TARGET_REGION = 'TARGET_REGION',                // خطوة جديدة: المنطقة المستهدفة
  TARGET_AUDIENCE = 'TARGET_AUDIENCE',            // خطوة جديدة: الجمهور المستهدف
  KEY_THEMES = 'KEY_THEMES',                      // خطوة جديدة: المواضيع الرئيسية
  NARRATIVE_TONE = 'NARRATIVE_TONE',              // خطوة جديدة: نبرة السرد
  VISUAL_COVER_DESC = 'VISUAL_COVER_DESC',
  COVER_ASPECT_RATIO = 'COVER_ASPECT_RATIO',      // خطوة جديدة: نسبة الغلاف
  COVER_COLOR_PALETTE = 'COVER_COLOR_PALETTE',    // خطوة جديدة: لوحة الألوان
  CONFIRMATION = 'CONFIRMATION',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface BookMetadata {
  title: string;
  author: string;
  genre: string;
  language: Language;
  
  userName: string;
  userEmail: string;
  userCountry: string;
  publisherName?: string;
  publishingYear?: string;

  primaryGoal: PrimaryGoal;                     // الهدف الأساسي من المشروع
  goal: PublishingGoal;
  style: EditingStyle;
  editingIntensity: EditingIntensity;           // مستوى التحرير
  customPreferences?: CustomEditingPreferences; // التفضيلات المخصصة (اختياري)
  targetRegion: string;
  targetAudience: string;
  keyThemes: string;
  narrativeTone: string;

  coverDescription: string;
  coverAspectRatio: AspectRatio;
  colorPalette: string;
  avoidElements: string;
}

// حالة التقدم في المعالجة (للحفظ في localStorage)
export interface ProcessingProgress {
  step: ChatStep;
  metadata: Partial<BookMetadata>;
  rawText?: string;
  currentChunk?: number;
  totalChunks?: number;
  processedChunks?: string[];    // الأجزاء المحررة
  timestamp: number;
}

// حالة الخطوة في المعالجة
export interface ProcessingStatus {
  stage: 'analyzing' | 'editing' | 'generating_cover' | 'creating_package' | 'complete';
  progress: number;               // 0-100
  currentChunk?: number;
  totalChunks?: number;
  message: string;                // رسالة للعرض للمستخدم
}

export interface PublishingPackage {
  originalText: string;
  editedText: string;
  analysisReport: string;
  legalReport: string;
  editorNotes: string;
  coverImageBase64: string;
  extras: {
    dedication: string;
    aboutAuthor: string;
    synopsis: string;
    suggestedBlurb: string;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'agent' | 'system';
  content: string; // HTML supported for formatting
  timestamp: Date;
  attachmentName?: string;
  options?: { label: string; value: any }[]; // If the agent presents choices
  requiresInput?: boolean; // If true, show text input
  inputType?: 'text' | 'file' | 'confirmation';
}
