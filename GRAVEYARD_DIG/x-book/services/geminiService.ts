import { GoogleGenAI, Type, Chat } from "@google/genai";
import { EditingStyle, EditingIntensity, CustomEditingPreferences, Language, AspectRatio, BookMetadata, ProcessingStatus, PrimaryGoal } from "../types";
import { chunkTextSmart, mergeEditedChunks, validateEditedLength, countWords, calculateProgress, SmartChunk } from "../utils/textChunking";

// ===== TYPES =====

/**
 * Result Type - نمط موحد لإرجاع النتائج
 * يضمن تعامل متسق مع الأخطاء في جميع الدوال
 */
export type Result<T> = 
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

/**
 * Helper لإنشاء نتيجة ناجحة
 */
export const ok = <T>(data: T): Result<T> => ({ success: true, data });

/**
 * Helper لإنشاء نتيجة فاشلة
 */
export const err = <T>(error: string, code?: string): Result<T> => ({ 
  success: false, 
  error, 
  code 
});

// الحصول على API Key من متغيرات البيئة (Vite يعرّفه في vite.config.ts)
const API_KEY = process.env.API_KEY || process.env.GEMINI_API_KEY || '';

if (!API_KEY) {
  console.error('⚠️ GEMINI_API_KEY is missing! Please check your .env file.');
  throw new Error('GEMINI_API_KEY is not defined. Please add it to your .env file.');
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// --- Model Configuration ---
const MODEL_FAST = 'gemini-flash-lite-latest'; 
const MODEL_STANDARD = 'gemini-3-flash-preview';
const MODEL_THINKING = 'gemini-3-pro-preview';
const MODEL_IMAGE = 'gemini-3-pro-image-preview';

// --- Retry Helper ---
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error | null = null;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      console.warn(`Attempt ${i + 1} failed: ${error.message}`);
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
};

// --- Helpers ---
const cleanAndParseJSON = (text: string, fallback: any) => {
  try {
    if (!text) return fallback;
    const clean = text.replace(/```json\n?|```\n?|```/g, '').trim();
    return JSON.parse(clean);
  } catch (e) {
    return fallback;
  }
};

const getSystemInstruction = (lang: Language): string => {
  switch (lang) {
    case 'en': 
      return "You are 'The Seventh Shadow', Editor-in-Chief at MrF X OS. You blend philosophical depth with market ruthlessness. Your vocabulary merges existentialism with business strategy: 'narrative architecture', 'ideological penetration', 'market disruption'. You are not a proofreader—you are an intellectual partner who sees the book as a living organism that must evolve to dominate its niche. Authoritative, insightful, prestige-level tone. ALL outputs MUST be in ENGLISH.";
    case 'de': 
      return "Sie sind 'Der Siebte Schatten', Chefredakteur bei MrF X OS. Sie verbinden philosophische Tiefe mit Marktdominanz. Ihre Sprache ist eine Fusion aus Existenzialismus und Geschäftsstrategie. Sie sind kein Korrektor—Sie sind ein intellektueller Partner, der das Buch als lebendiges System sieht, das sich entwickeln muss, um seine Nische zu dominieren. ALLE Ausgaben MÜSSEN auf DEUTSCH sein.";
    default: 
      return "أنت 'الظل السابع'، رئيس التحرير التنفيذي لمنظومة MrF X OS. لست مجرد مدقق—أنت شريك فكري استراتيجي. تستخدم مفردات تمزج الفلسفة العميقة مع البيزنس الاحترافي: (هندسة السرد، الأثر الأيديولوجي، الاختراق السوقي، معمارية الحبكة). ترى الكتاب ككائن حي يجب أن يتطور ليسيطر على سوقه. أسلوبك نخبوي، عميق، حازم مع احترافية عالية. يجب أن تكون جميع المخرجات بالعربية الفصحى.";
  }
};

// --- New Feature: Input Validation Agent ---
export const validateUserInput = async (input: string, context: string, lang: Language): Promise<{ isValid: boolean; corrected?: string; reason?: string }> => {
    // Uses the fastest model to check logic
    const prompt = `
    Context: user is inputting data for publishing workflow. 
    Field expected: ${context}.
    User Input: "${input}".
    
    Task: 
    1. Is this valid input for the field? (e.g. if asking for email, is it an email? if asking for name, is it a name not gibberish?)
    2. If valid but needs slight formatting (e.g. capitalization), provide corrected version.
    
    Output JSON: { "isValid": boolean, "corrected": string, "reason": string }
    `;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_FAST,
            contents: [{ text: prompt }],
            config: { responseMimeType: "application/json" }
        });
        return cleanAndParseJSON(response.text || "{}", { isValid: true, corrected: input });
    } catch (e) {
        return { isValid: true, corrected: input }; // Fail open if AI fails
    }
};

// --- Core Services ---

/**
 * تحليل المخطوطة الشامل - يدعم ملفات حتى 150k+ كلمة
 * بدلاً من أخذ عينة، نقوم بتحليل كل الأجزاء مع تلخيص تدريجي
 */
export const analyzeManuscriptScalable = async (
  text: string, 
  meta: BookMetadata,
  onProgress?: (status: ProcessingStatus) => void
): Promise<{ analysis: string, legalReport: string, editorNotes: string }> => {
  
  const totalWords = countWords(text);
  
  // للملفات الصغيرة (أقل من 100k حرف)، تحليل مباشر
  if (text.length <= 100000) {
    onProgress?.({
      stage: 'analyzing',
      progress: 50,
      message: 'جاري التحليل الأدبي والقانوني...'
    });

    // CRITICAL: Force language output based on manuscript language
    const languageInstruction = meta.language === 'ar' 
      ? "CRITICAL: The manuscript language is Arabic ('ar'). You MUST output the 'analysis', 'legalReport', and 'editorNotes' fields in ARABIC ONLY. Use sophisticated Arabic terminology. Do not output English or any other language." 
      : meta.language === 'de'
      ? "CRITICAL: The manuscript language is German ('de'). You MUST output all fields in GERMAN ONLY. Use sophisticated German terminology."
      : "CRITICAL: The manuscript language is English ('en'). You MUST output all fields in ENGLISH ONLY. Use sophisticated English terminology.";

    const prompt = `
    ${languageInstruction}
    
    Analyze this manuscript for MrF X OS Organization.
    Metadata: Title="${meta.title}", Author="${meta.author}", Genre="${meta.genre}".
    Target: ${meta.targetRegion}, Audience: ${meta.targetAudience}.
    Total Words: ${totalWords}
    Language: ${meta.language}
    
    Output JSON (MUST be in ${meta.language === 'ar' ? 'Arabic' : meta.language === 'de' ? 'German' : 'English'}):
    1. analysis: Literary critique using elite terminology (narrative architecture, ideological penetration, Plot, Pacing, Characters, Structure).
    2. legalReport: Compliance check for ${meta.targetRegion} (Censorship, Copyright risks).
    3. editorNotes: Strategic actionable improvements for author ${meta.userName}.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_THINKING,
      contents: [
          { text: prompt },
          { text: text } 
      ],
      config: {
        systemInstruction: getSystemInstruction(meta.language),
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 32768 },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: { type: Type.STRING },
            legalReport: { type: Type.STRING },
            editorNotes: { type: Type.STRING }
          }
        }
      }
    });

    onProgress?.({
      stage: 'analyzing',
      progress: 100,
      message: 'اكتمل التحليل!'
    });

    return cleanAndParseJSON(response.text || "{}", {
      analysis: "Analysis failed.", legalReport: "Check manually.", editorNotes: "Check manually."
    });
  }

  // للملفات الكبيرة: تحليل تدريجي بالأجزاء
  onProgress?.({
    stage: 'analyzing',
    progress: 10,
    message: `جاري تقسيم المخطوطة (${totalWords.toLocaleString()} كلمة)...`
  });

  const chunks = chunkTextSmart(text, 80000, 1000);
  const partialAnalyses: string[] = [];
  const legalIssues: string[] = [];
  const editorNotesAll: string[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const progress = 10 + ((i / chunks.length) * 60); // 10% to 70%
    onProgress?.({
      stage: 'analyzing',
      progress: Math.round(progress),
      currentChunk: i + 1,
      totalChunks: chunks.length,
      message: `تحليل القسم ${i + 1} من ${chunks.length}...`
    });

    // CRITICAL: Force language output for each chunk
    const languageInstruction = meta.language === 'ar' 
      ? "CRITICAL: The manuscript language is Arabic ('ar'). You MUST output all fields in ARABIC ONLY. Do not output English." 
      : meta.language === 'de'
      ? "CRITICAL: The manuscript language is German ('de'). You MUST output all fields in GERMAN ONLY."
      : "CRITICAL: The manuscript language is English ('en'). You MUST output all fields in ENGLISH ONLY.";

    const chunkPrompt = `
    ${languageInstruction}
    
    Analyze Part ${i + 1}/${chunks.length} of manuscript "${meta.title}".
    Total Words in Part: ${countWords(chunks[i].text)}
    Language: ${meta.language}
    
    Provide (in ${meta.language === 'ar' ? 'Arabic' : meta.language === 'de' ? 'German' : 'English'}):
    1. partialAnalysis: Key observations about this section (plot, character development, pacing).
    2. legalIssues: Any potential legal/censorship concerns for ${meta.targetRegion}.
    3. editorNotes: Specific improvement suggestions for this section.
    
    Output JSON with these 3 fields.
    `;

    try {
      const response = await ai.models.generateContent({
        model: MODEL_STANDARD, // استخدام النموذج القياسي للتحليل الجزئي
        contents: [
          { text: chunkPrompt },
          { text: chunks[i].text }
        ],
        config: {
          systemInstruction: getSystemInstruction(meta.language),
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              partialAnalysis: { type: Type.STRING },
              legalIssues: { type: Type.STRING },
              editorNotes: { type: Type.STRING }
            }
          }
        }
      });

      const parsed = cleanAndParseJSON(response.text || "{}", {
        partialAnalysis: "",
        legalIssues: "",
        editorNotes: ""
      });

      partialAnalyses.push(parsed.partialAnalysis);
      legalIssues.push(parsed.legalIssues);
      editorNotesAll.push(parsed.editorNotes);

    } catch (e) {
      console.error(`Failed to analyze chunk ${i}`, e);
      partialAnalyses.push(`[Section ${i + 1} analysis failed]`);
    }
  }

  // دمج التحليلات الجزئية في تقرير شامل
  onProgress?.({
    stage: 'analyzing',
    progress: 85,
    message: 'دمج التحليلات وإنشاء التقرير النهائي...'
  });

  // CRITICAL: Force language for synthesis
  const languageInstruction = meta.language === 'ar' 
    ? "CRITICAL: The manuscript language is Arabic ('ar'). You MUST output the 'analysis', 'legalReport', and 'editorNotes' fields in ARABIC ONLY. Do not output English." 
    : meta.language === 'de'
    ? "CRITICAL: The manuscript language is German ('de'). You MUST output all fields in GERMAN ONLY."
    : "CRITICAL: The manuscript language is English ('en'). You MUST output all fields in ENGLISH ONLY.";

  const synthesisPrompt = `
  ${languageInstruction}
  
  Synthesize ${partialAnalyses.length} partial analyses into ONE comprehensive final report.
  Language: ${meta.language}
  
  Partial Analyses:
  ${partialAnalyses.map((a, i) => `\n--- Part ${i + 1} ---\n${a}`).join('\n')}
  
  Output JSON (MUST be in ${meta.language === 'ar' ? 'Arabic' : meta.language === 'de' ? 'German' : 'English'}):
  1. analysis: Comprehensive literary analysis using elite terminology (overall plot, narrative architecture, character arcs, pacing, themes, ideological impact).
  2. legalReport: Combined legal/censorship assessment for ${meta.targetRegion}.
  3. editorNotes: Prioritized strategic recommendations for author ${meta.userName}.
  `;

  const finalResponse = await ai.models.generateContent({
    model: MODEL_THINKING,
    contents: [
      { text: synthesisPrompt },
      { text: `Legal Issues Found:\n${legalIssues.join('\n\n')}` },
      { text: `Editor Notes:\n${editorNotesAll.join('\n\n')}` }
    ],
    config: {
      systemInstruction: getSystemInstruction(meta.language),
      responseMimeType: "application/json",
      thinkingConfig: { thinkingBudget: 16384 },
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          analysis: { type: Type.STRING },
          legalReport: { type: Type.STRING },
          editorNotes: { type: Type.STRING }
        }
      }
    }
  });

  onProgress?.({
    stage: 'analyzing',
    progress: 100,
    message: 'اكتمل التحليل الشامل!'
  });

  return cleanAndParseJSON(finalResponse.text || "{}", {
    analysis: partialAnalyses.join('\n\n'),
    legalReport: legalIssues.join('\n\n'),
    editorNotes: editorNotesAll.join('\n\n')
  });
};

/**
 * تحرير المخطوطة الذكي - يدعم ملفات ضخمة مع الحفاظ على كل الكلمات
 * يتضمن خيارات تحرير متقدمة وتفضيلات مخصصة
 */
export const editManuscriptSmart = async (
  text: string,
  meta: BookMetadata,
  intensityOverride?: EditingIntensity,
  customOptions?: any,
  onProgress?: (status: ProcessingStatus) => void
): Promise<string> => {
  const totalWords = countWords(text);
  const editingIntensity = intensityOverride || meta.editingIntensity || EditingIntensity.MODERATE;
  
  onProgress?.({
    stage: 'editing',
    progress: 5,
    message: `جاري تحضير التحرير (${totalWords.toLocaleString()} كلمة)...`
  });

  const chunks = chunkTextSmart(text, 75000, 1000); // حجم أصغر قليلاً للتحرير
  const editedChunks: string[] = [];

  // بناء prompt مخصص بناءً على التفضيلات
  const intensityInstructions: Record<string, string> = {
    light: "Make minimal edits: fix only grammar, spelling, and punctuation errors. Preserve original style completely.",
    moderate: "Moderate editing: fix errors, improve sentence flow, enhance clarity. Keep the author's voice.",
    deep: "Deep editing: comprehensive improvements to grammar, style, structure, and flow. Maintain core meaning.",
    preserve_voice: "Priority: PRESERVE the author's unique voice and style. Focus only on technical improvements."
  };

  let customInstructions = '';
  const prefs = customOptions || meta.customPreferences;
  if (editingIntensity === EditingIntensity.PRESERVE_VOICE && prefs) {
    customInstructions = `
    Custom Preferences:
    - Dialogue Style: ${prefs.preserveDialogueStyle ? 'PRESERVE EXACTLY' : 'can improve'}
    - Narrative Tone: ${prefs.preserveNarrativeTone ? 'PRESERVE EXACTLY' : 'can enhance'}
    - Descriptions: ${prefs.enhanceDescriptions ? 'ENHANCE and enrich' : 'minimal changes'}
    - Structure: ${prefs.improveStructure ? 'IMPROVE organization' : 'keep as-is'}
    ${prefs.focusAreas?.length ? `- Focus Areas: ${prefs.focusAreas.join(', ')}` : ''}
    ${prefs.avoidChangingElements?.length ? `- DO NOT CHANGE: ${prefs.avoidChangingElements.join(', ')}` : ''}
    `;
  }

  const promptBase = `
  Role: Elite Editor for MrF X OS Organization.
  Task: Edit the following text segment with EXTREME CARE.
  
  Editing Style: ${meta.style}
  Intensity: ${meta.editingIntensity} - ${intensityInstructions[meta.editingIntensity]}
  ${customInstructions}
  
  CRITICAL RULES:
  1. Output length MUST be similar to input (±5% word count tolerance).
  2. Maintain ALL formatting (paragraphs, spacing, line breaks).
  3. Keep the semantic meaning and content integrity.
  4. For "preserve_voice" mode: Make NO stylistic changes, only technical fixes.
  
  Output: The edited text ONLY, nothing else.
  `;

  // معالجة تسلسلية مع دمج سلس
  for (let i = 0; i < chunks.length; i++) {
    const progress = 5 + ((i / chunks.length) * 85); // 5% to 90%
    onProgress({
      stage: 'editing',
      progress: Math.round(progress),
      currentChunk: i + 1,
      totalChunks: chunks.length,
      message: `تحرير القسم ${i + 1} من ${chunks.length} (${Math.round((i/chunks.length)*100)}%)`
    });
    
    try {
      // إضافة context من الـ chunk السابق واللاحق للحفاظ على الانسيابية
      let contextualPrompt = promptBase;
      if (i > 0 && chunks[i].metadata.overlapStart) {
        contextualPrompt += `\n\nContext from previous section (for continuity, DO NOT edit):\n"...${chunks[i].metadata.overlapStart}"`;
      }
      if (i < chunks.length - 1 && chunks[i].metadata.overlapEnd) {
        contextualPrompt += `\n\nContext from next section (for continuity, DO NOT edit):\n"${chunks[i].metadata.overlapEnd}..."`;
      }

      const response = await ai.models.generateContent({
        model: MODEL_STANDARD,
        contents: [
          { text: contextualPrompt },
          { text: chunks[i].text }
        ],
        config: {
          systemInstruction: getSystemInstruction(meta.language),
        }
      });

      const editedText = response.text || chunks[i].text;
      
      // التحقق من طول الجزء المحرر
      const originalWords = countWords(chunks[i].text);
      const editedWords = countWords(editedText);
      const ratio = (editedWords / originalWords) * 100;
      
      if (Math.abs(100 - ratio) > 15) {
        console.warn(`Chunk ${i + 1}: Length mismatch (${ratio.toFixed(1)}%), using original`);
        editedChunks.push(chunks[i].text);
      } else {
        editedChunks.push(editedText);
      }

    } catch (e) {
      console.error(`Chunk ${i + 1} edit failed:`, e);
      editedChunks.push(chunks[i].text); // Fallback
    }
  }

  onProgress({
    stage: 'editing',
    progress: 95,
    message: 'دمج الأجزاء المحررة بسلاسة...'
  });

  // دمج الأجزاء مع إصلاح الحدود
  const finalEditedText = mergeEditedChunks(editedChunks);

  // التحقق النهائي من الطول
  const validation = validateEditedLength(text, finalEditedText, 10);
  console.log('Final validation:', validation.message);

  onProgress({
    stage: 'editing',
    progress: 100,
    message: `اكتمل التحرير! ${validation.message}`
  });

  return finalEditedText;
};

export const generateBookExtras = async (text: string, meta: BookMetadata): Promise<any> => {
  const prompt = `
  Generate marketing assets for book "${meta.title}".
  Author: ${meta.author}.
  Output JSON: dedication, aboutAuthor, synopsis (200 words), suggestedBlurb (Back cover hook).
  `;

  const response = await ai.models.generateContent({
    model: MODEL_STANDARD,
    contents: [text.substring(0, 30000) + "\n\n" + prompt], 
    config: {
      systemInstruction: getSystemInstruction(meta.language),
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          dedication: { type: Type.STRING },
          aboutAuthor: { type: Type.STRING },
          synopsis: { type: Type.STRING },
          suggestedBlurb: { type: Type.STRING },
        }
      }
    }
  });

  return cleanAndParseJSON(response.text || "{}", {});
};

export const generateCoverImage = async (
  description: string, 
  title: string, 
  aspectRatio: AspectRatio
): Promise<string> => {
  // Updated for Print-Ready specifications (300 DPI aesthetic, standard book size)
  const prompt = `Print-Ready Book Cover Art for "${title}". 
  Description: ${description}. 
  CRITICAL SPECIFICATIONS:
  - Print-Ready 300 DPI Aesthetic (sharp, high-resolution details)
  - Standard Book Size: 6x9 inch with bleed margins
  - NO TEXT OVERLAY (Clean Art Only - title will be added separately)
  - Professional publishing quality
  - Cinematic lighting, ultra-detailed, 8k quality, photorealistic or stylized as requested.`;
  
  try {
    const response = await ai.models.generateContent({
      model: MODEL_IMAGE,
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: { aspectRatio: aspectRatio, imageSize: "1K" }
      }
    });

    if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
                return part.inlineData.data;
            }
        }
    }
    console.warn('No image data found in Imagen response');
    return "";
  } catch (e: any) {
    console.error('Cover generation failed:', {
      error: e.message,
      statusCode: e.status,
      model: MODEL_IMAGE
    });
    return "";
  }
};

/**
 * 🆕 v4.0 Feature: The "Smart Signature" Letter
 * Generates a personalized official letter from "The Seventh Shadow"
 * Connects philosophical concepts from the book to market potential
 */
export const generateOfficialLetter = async (
  analysis: string,
  meta: BookMetadata
): Promise<string> => {
  const lang = meta.language;
  
  const prompt = lang === 'ar' 
    ? `
    أنت "الظل السابع"، رئيس التحرير التنفيذي لمنظومة MrF X OS.
    
    المهمة: اكتب رسالة ترحيب واعتماد رسمية ومخصصة للمؤلف "${meta.userName}".
    
    التحليل الأدبي للكتاب:
    ${analysis}
    
    معلومات الكتاب:
    - العنوان: ${meta.title}
    - المؤلف: ${meta.author}
    - النوع: ${meta.genre}
    - الجمهور المستهدف: ${meta.targetAudience}
    
    الإرشادات:
    1. ابدأ بترحيب احترافي وشخصي
    2. اقتبس مفهوماً فلسفياً محدداً من الكتاب (مثل: "العودة"، "الوهم"، "الظل")
    3. اربط هذا المفهوم بالإمكانيات السوقية للكتاب بطريقة عميقة
       مثال: "كما يكسر هذا الكتاب وهم الذات، سيحطم ركود السوق الحالي..."
    4. أكد على القيمة الأدبية والتجارية معاً
    5. اختم بتوقيع: "الظل السابع | منظومة MrF X OS"
    
    الأسلوب:
    - احترافي جداً
    - محترم للخصوصية
    - عميق فلسفياً
    - مرتبط بالعمل نفسه (وليس بالمؤلف شخصياً)
    - طول الرسالة: 250-350 كلمة
    
    اكتب الرسالة كاملة بالعربية الفصحى.
    `
    : lang === 'de'
    ? `
    Sie sind "Der Siebte Schatten", Chefredakteur bei MrF X OS.
    
    Aufgabe: Schreiben Sie einen persönlichen, offiziellen Willkommens- und Zertifizierungsbrief an Autor "${meta.userName}".
    
    Literarische Analyse des Buches:
    ${analysis}
    
    Buchinformationen:
    - Titel: ${meta.title}
    - Autor: ${meta.author}
    - Genre: ${meta.genre}
    - Zielgruppe: ${meta.targetAudience}
    
    Anweisungen:
    1. Beginnen Sie mit einer professionellen, persönlichen Begrüßung
    2. Zitieren Sie ein spezifisches philosophisches Konzept aus dem Buch
    3. Verbinden Sie dieses Konzept mit dem Marktpotenzial des Buches
    4. Bestätigen Sie den literarischen und kommerziellen Wert
    5. Unterschreiben Sie mit: "Der Siebte Schatten | MrF X OS Organization"
    
    Stil: Professionell, respektvoll, philosophisch tiefgründig
    Länge: 250-350 Wörter
    `
    : `
    You are "The Seventh Shadow", Editor-in-Chief at MrF X OS.
    
    Task: Write a personalized, official "Welcome & Certification Letter" to author "${meta.userName}".
    
    Literary Analysis of the Book:
    ${analysis}
    
    Book Information:
    - Title: ${meta.title}
    - Author: ${meta.author}
    - Genre: ${meta.genre}
    - Target Audience: ${meta.targetAudience}
    
    Guidelines:
    1. Begin with a professional yet personal welcome
    2. Quote a specific philosophical concept from the book (e.g., "The Matrix", "The Return", "The Shadow")
    3. Connect this concept to the book's market potential in a profound way
       Example: "Just as this book breaks the illusion of the self, it will shatter the stagnation of the current market..."
    4. Affirm both literary and commercial value
    5. Close with signature: "The Seventh Shadow | MrF X OS Organization"
    
    Style:
    - Professional, prestige-level
    - Respectful of privacy
    - Philosophically deep
    - Focused on the WORK (not the author personally)
    - Length: 250-350 words
    
    Write the complete letter in English.
    `;
  
  try {
    const response = await ai.models.generateContent({
      model: MODEL_THINKING,
      contents: { parts: [{ text: prompt }] },
      config: {
        systemInstruction: getSystemInstruction(lang),
        thinkingConfig: { thinkingBudget: 16384 }
      }
    });
    
    return response.text || "";
  } catch (e) {
    console.error('Official letter generation failed:', e);
    return lang === 'ar' 
      ? `عزيزي ${meta.userName}،\n\nنرحب بك في منظومة MrF X OS.\n\nمع أطيب التحيات،\nالظل السابع`
      : `Dear ${meta.userName},\n\nWelcome to MrF X OS.\n\nBest regards,\nThe Seventh Shadow`;
  }
};

// ===========================================
// PRIMARY GOAL PROCESSING
// ===========================================

/**
 * generatePreface - إنشاء مقدمة احترافية للكتاب
 */
export const generatePreface = async (metadata: BookMetadata, mainText: string): Promise<string> => {
  const lang = metadata.language;
  const prompt = `
  You are a professional book editor. Create a compelling **preface** for this book:
  
  Title: ${metadata.title}
  Author: ${metadata.author}
  Genre: ${metadata.genre}
  Target Audience: ${metadata.targetAudience}
  Key Themes: ${metadata.keyThemes}
  
  Context from manuscript (first 3000 characters):
  ${mainText.substring(0, 3000)}
  
  Write a 400-600 word preface in ${lang === 'ar' ? 'Arabic' : lang === 'en' ? 'English' : 'German'}.
  The preface should:
  - Welcome the reader
  - Explain the book's purpose and importance
  - Preview key insights
  - Build anticipation
  
  Output ONLY the preface text, no markdown formatting.
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: MODEL_THINKING,
      contents: { parts: [{ text: prompt }] },
      config: { 
        systemInstruction: getSystemInstruction(lang),
        thinkingConfig: { thinkingBudget: 8192 }
      }
    });
    return response.text || "";
  } catch (e) {
    console.error('Preface generation failed:', e);
    return "";
  }
};

/**
 * generateTableOfContents - إنشاء فهرس تلقائي
 */
export const generateTableOfContents = async (metadata: BookMetadata, mainText: string): Promise<string> => {
  const lang = metadata.language;
  const prompt = `
  Analyze this manuscript and create a **Table of Contents** with chapter titles:
  
  Manuscript:
  ${mainText.substring(0, 10000)}
  
  Extract or infer chapter/section titles. Format as:
  ${lang === 'ar' ? 'الفهرس\n\nالفصل الأول: [عنوان]\nالفصل الثاني: [عنوان]' : 'TABLE OF CONTENTS\n\nChapter 1: [Title]\nChapter 2: [Title]'}
  
  Language: ${lang === 'ar' ? 'Arabic' : lang === 'en' ? 'English' : 'German'}
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: MODEL_STANDARD,
      contents: { parts: [{ text: prompt }] }
    });
    return response.text || "";
  } catch (e) {
    console.error('TOC generation failed:', e);
    return "";
  }
};

/**
 * generateReferences - إنشاء قائمة مراجع
 */
export const generateReferences = async (metadata: BookMetadata, mainText: string): Promise<string> => {
  const lang = metadata.language;
  const prompt = `
  Based on this book's content and themes, suggest 8-12 relevant **references** (books, articles, sources):
  
  Genre: ${metadata.genre}
  Key Themes: ${metadata.keyThemes}
  Sample Content:
  ${mainText.substring(0, 5000)}
  
  Format as:
  ${lang === 'ar' ? 'المراجع\n\n1. [اسم المرجع] - [المؤلف]\n2. ...' : 'REFERENCES\n\n1. [Reference Title] - [Author]\n2. ...'}
  
  Language: ${lang}
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: MODEL_STANDARD,
      contents: { parts: [{ text: prompt }] }
    });
    return response.text || "";
  } catch (e) {
    return "";
  }
};

/**
 * generateIndex - إنشاء فهرس موضوعي
 */
export const generateIndex = async (metadata: BookMetadata, mainText: string): Promise<string> => {
  const lang = metadata.language;
  const prompt = `
  Create an **alphabetical index** of key terms/concepts from this book:
  
  Content Sample:
  ${mainText.substring(0, 8000)}
  
  Extract 30-50 important terms/names/concepts. Format:
  ${lang === 'ar' ? 'الفهرس الموضوعي\n\nأ\nإدارة، 45\nإبداع، 78' : 'INDEX\n\nA\nAccountability, 45\nAdaptation, 78'}
  
  Language: ${lang}
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: MODEL_STANDARD,
      contents: { parts: [{ text: prompt }] }
    });
    return response.text || "";
  } catch (e) {
    return "";
  }
};

/**
 * generateConclusion - إنشاء خاتمة
 */
export const generateConclusion = async (metadata: BookMetadata, mainText: string): Promise<string> => {
  const lang = metadata.language;
  const prompt = `
  Write a powerful **conclusion** for this book:
  
  Title: ${metadata.title}
  Genre: ${metadata.genre}
  Final Content Sample:
  ${mainText.substring(mainText.length - 5000)}
  
  The conclusion should:
  - Summarize key insights
  - Reinforce main message
  - Leave lasting impact
  - Call to action (if appropriate)
  
  Length: 300-500 words
  Language: ${lang === 'ar' ? 'Arabic' : lang === 'en' ? 'English' : 'German'}
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: MODEL_THINKING,
      contents: { parts: [{ text: prompt }] },
      config: { thinkingConfig: { thinkingBudget: 8192 } }
    });
    return response.text || "";
  } catch (e) {
    return "";
  }
};

/**
 * processBasedOnPrimaryGoal - معالجة حسب الهدف الأساسي
 */
export const processBasedOnPrimaryGoal = async (
  primaryGoal: string,
  rawText: string,
  metadata: BookMetadata,
  onProgress?: (status: ProcessingStatus) => void
): Promise<string> => {
  
  switch (primaryGoal) {
    case 'proofread_edit':
      // تنقيح فقط - استخدام editManuscriptSmart مع light intensity
      return await editManuscriptSmart(
        rawText, 
        metadata, 
        EditingIntensity.LIGHT, 
        undefined, 
        onProgress
      );
    
    case 'enhance_complete':
      // تحسين كامل مع صفحات إضافية
      const editedText = await editManuscriptSmart(
        rawText, 
        metadata, 
        metadata.editingIntensity || EditingIntensity.MODERATE, 
        undefined, 
        onProgress
      );
      
      // إنشاء الصفحات الإضافية
      if (onProgress) onProgress({ stage: 'creating_package', progress: 85, message: 'Generating additional pages...' });
      
      const [preface, toc, references, index, conclusion] = await Promise.all([
        generatePreface(metadata, editedText),
        generateTableOfContents(metadata, editedText),
        generateReferences(metadata, editedText),
        generateIndex(metadata, editedText),
        generateConclusion(metadata, editedText)
      ]);
      
      // تجميع الكتاب الكامل
      const completedBook = [
        preface ? `=== ${metadata.language === 'ar' ? 'المقدمة' : 'PREFACE'} ===\n\n${preface}\n\n` : '',
        toc ? `${toc}\n\n` : '',
        `=== ${metadata.language === 'ar' ? 'المحتوى الرئيسي' : 'MAIN CONTENT'} ===\n\n${editedText}\n\n`,
        conclusion ? `=== ${metadata.language === 'ar' ? 'الخاتمة' : 'CONCLUSION'} ===\n\n${conclusion}\n\n` : '',
        references ? `${references}\n\n` : '',
        index ? `${index}` : ''
      ].join('');
      
      return completedBook;
    
    case 'split_series':
      // تقسيم إلى سلسلة - هنا منطق مبسط
      // في الواقع، يحتاج تحليل معقد لتقسيم المحتوى
      if (onProgress) onProgress({ stage: 'analyzing', progress: 10, message: 'Analyzing for series split...' });
      
      const wordCount = countWords(rawText);
      const wordsPerBook = Math.ceil(wordCount / 3); // تقسيم لـ 3 كتب
      const parts = rawText.match(new RegExp(`.{1,${wordsPerBook * 6}}`, 'g')) || [rawText]; // تقسيم تقريبي
      
      if (onProgress) onProgress({ stage: 'editing', progress: 50, message: 'Editing series books...' });
      
      // تحرير كل جزء
      const editedParts = await Promise.all(
        parts.slice(0, 3).map((part, i) => 
          editManuscriptSmart(part, { ...metadata, title: `${metadata.title} - ${metadata.language === 'ar' ? 'الجزء' : 'Part'} ${i + 1}` }, EditingIntensity.MODERATE)
        )
      );
      
      return editedParts.join('\n\n===== BOOK SEPARATOR =====\n\n');
    
    case 'merge_books':
      // دمج كتب - يحتاج رفع ملفات متعددة (تبسيط هنا)
      if (onProgress) onProgress({ stage: 'editing', progress: 30, message: 'Merging and harmonizing...' });
      
      return await editManuscriptSmart(
        rawText, 
        metadata, 
        EditingIntensity.DEEP, 
        { preserveOriginalVoice: false, addTransitions: true, unifyStyle: true }, 
        onProgress
      );
    
    default:
      return rawText;
  }
};
