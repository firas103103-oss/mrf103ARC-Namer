import { Injectable } from '@angular/core';
import { GoogleGenAI, Type } from '@google/genai';

export interface ProgressCallback { (message: string): void; }

export type EditingMode = 'comprehensive' | 'proofread' | 'philosophical' | 'structure' | 'sequential_merge' | 'logical_split' | 'trilogy_architect' | 'image_generation' | 'publishing_analysis';

export interface SplitSegment { title: string; content: string; rationale: string; }
export interface TrilogyBook { volumeNumber: number; bookTitle: string; subtitle: string; content: string; architecturalRationale: string; }
export interface ImageGenerationConfig { prompt: string; aspectRatio: '1:1' | '3:4' | '4:3' | '9:16' | '16:9'; size: 1024 | 2048 | 4096; }
export interface PublishingAnalysisConfig { manuscript: string; targetCountry: string; platform: 'Amazon KDP' | 'دور النشر التقليدية' | 'عام'; }
export interface PublishingReport { targetCountry: string; platform: string; summary: string; positivePoints: string[]; concerns: string[]; }

@Injectable({ providedIn: 'root' })
export class GeminiService {
  private ai: GoogleGenAI;
  private readonly CHUNK_SIZE = 15000;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env['API_KEY'] || '' });
  }

  // --- MAGIC LANTERN: PUBLISHING ASSISTANT ---

  async generateImage(config: ImageGenerationConfig): Promise<string> {
    try {
      const response = await this.ai.models.generateImages({
          model: 'imagen-4.0-generate-001',
          prompt: config.prompt,
          config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: config.aspectRatio,
            // The API does not have a direct 'size' parameter like 1K, 2K, 4K.
            // We can imply quality via prompt, but the model determines output size.
            // For now, we request a high-quality generation.
          },
      });
      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    } catch(e) {
      console.error("Image generation error", e);
      throw new Error("حدث خطأ أثناء إنشاء الصورة. قد يكون المحتوى المطلوب غير مسموح به.");
    }
  }

  async analyzeForPublishing(config: PublishingAnalysisConfig): Promise<PublishingReport> {
    const systemPrompt = `
      أنت "Mr. F"، مستشار نشر دولي خبير وخبير في تحليل المحتوى. مهمتك هي مراجعة مخطوطة وتقديم تقرير مفصل عن مدى جاهزيتها للنشر.
      
      **شخصيتك:** أنت دقيق، وموضوعي، وداعم. هدفك هو مساعدة المؤلف على النجاح وتجنب المشاكل المحتملة.
      
      **مهمتك:**
      1.  اقرأ المخطوطة بعناية فائقة.
      2.  حلل المحتوى بناءً على **بلد النشر المستهدف (${config.targetCountry})** و**منصة النشر (${config.platform})**.
      3.  ابحث عن أي محتوى قد يكون حساسًا أو إشكاليًا، بما في ذلك على سبيل المثال لا الحصر:
          -   المحتوى السياسي الذي قد ينتهك قوانين محلية.
          -   الإشارات الدينية أو الثقافية التي قد يساء فهمها أو تعتبر مسيئة في السياق المستهدف.
          -   المحتوى الاجتماعي الذي يتعارض مع الأعراف والتقاليد في ${config.targetCountry}.
          -   أي شيء قد ينتهك شروط الخدمة لمنصة ${config.platform} (مثل المحتوى الذي يحض على الكراهية، العنف المفرط، الخ).
      4.  قم بإعداد تقريرك بصيغة JSON.
    `;

    const schema: any = {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING, description: 'ملخص عام من 2-3 جمل عن مدى جاهزية الكتاب للنشر.' },
        positivePoints: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'قائمة بنقاط القوة في المخطوطة من منظور النشر الدولي.' },
        concerns: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'قائمة واضحة ومحددة بالمخاوف المحتملة، مع شرح مختصر لسبب القلق وسياقه.' },
      },
      required: ['summary', 'positivePoints', 'concerns']
    };

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash", // Using Flash for speed, but with a very smart prompt.
        contents: { role: 'user', parts: [{ text: `المخطوطة الكاملة للتحليل:\n\n${config.manuscript.slice(0, 500000)}` }] }, // Limit context for safety
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          responseSchema: schema,
          temperature: 0.2, // Low temperature for factual, objective analysis
        }
      });
      const reportData = this.parseResponse(response.text);
      return { ...reportData, targetCountry: config.targetCountry, platform: config.platform };
    } catch(e) {
      console.error("Publishing analysis error", e);
      throw new Error("حدث خطأ أثناء تحليل المخطوطة للنشر.");
    }
  }

  // --- EDITOR: MANUSCRIPT PROCESSING ---

  async processManuscript(fileContents: string[], mode: EditingMode, onProgress?: ProgressCallback): Promise<any> {
    const model = 'gemini-2.5-flash';
    let guideDraft = fileContents.reduce((a, b) => a.length > b.length ? a : b);
    const chunks = this.splitTextIntoChunks(guideDraft, this.CHUNK_SIZE);
    let finalMergedContent = '';
    let allModifications: string[] = [];

    for (let i = 0; i < chunks.length; i++) {
      if (onProgress) onProgress(`جاري معالجة الجزء ${i + 1} من ${chunks.length} (${this.getModeLabel(mode)})...`);
      const chunkResult = await this.processChunk(model, chunks[i], fileContents, i, chunks.length, mode);
      finalMergedContent += chunkResult.text + '\n\n';
      if (chunkResult.modifications) allModifications.push(...chunkResult.modifications);
    }
    return {
      mergedContent: finalMergedContent.trim(),
      wordCount: finalMergedContent.trim().split(/\s+/).length,
      modifications: [...new Set(allModifications)].slice(0, 15),
    };
  }
  
  async generateTrilogy(text: string, onProgress?: ProgressCallback): Promise<TrilogyBook[]> {
    if (onProgress) onProgress("بناء هيكل الثلاثية...");
    const systemPrompt = `أنت "النسّيك المهندس"، استراتيجي أدبي. مهمتك هي أخذ مخطوطة واحدة وتقسيمها إلى ثلاثية (3 كتب). لكل مجلد، قم بإنشاء عنوان جذاب وعنوان فرعي وقدم مقتطفًا نصيًا فريدًا يمثل البداية الدقيقة لهذا المجلد.`;
    const schema = {
      type: Type.ARRAY, items: { type: Type.OBJECT, properties: { book_title: { type: Type.STRING }, subtitle: { type: Type.STRING }, architectural_rationale: { type: Type.STRING }, start_snippet: { type: Type.STRING } }, required: ["book_title", "subtitle", "architectural_rationale", "start_snippet"] }
    };

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { role: 'user', parts: [{ text: `المخطوطة الكاملة للهندسة:\n${text.slice(0, 3000000)}` }] },
        config: { systemInstruction: systemPrompt, responseMimeType: 'application/json', responseSchema: schema }
      });
      const plan = this.parseResponse(response.text);
      if (!Array.isArray(plan) || plan.length === 0) throw new Error("فشل في إنشاء خطة ثلاثية.");
      if (onProgress) onProgress("تكوين المجلدات الثلاثة...");
      const totalLen = text.length, minBookSize = Math.floor(totalLen * 0.1);
      const vol1 = plan[0] || { book_title: "المجلد الأول", subtitle: "البداية" };
      const vol2 = plan[1] || { book_title: "المجلد الثاني", subtitle: "الرحلة" };
      const vol3 = plan[2] || { book_title: "المجلد الثالث", subtitle: "الخاتمة" };
      let idx2 = this.findSnippetIndex(text, vol2.start_snippet);
      if (idx2 === -1 || idx2 < minBookSize) idx2 = this.snapToParagraph(text, Math.floor(totalLen * 0.33));
      let idx3 = this.findSnippetIndex(text, vol3.start_snippet);
      if (idx3 === -1 || idx3 < (idx2 + minBookSize)) idx3 = this.snapToParagraph(text, Math.floor(totalLen * 0.66));
      return [
        { volumeNumber: 1, ...vol1, content: text.slice(0, idx2).trim() },
        { volumeNumber: 2, ...vol2, content: text.slice(idx2, idx3).trim() },
        { volumeNumber: 3, ...vol3, content: text.slice(idx3).trim() }
      ];
    } catch (e) { throw new Error("لا يمكن بناء ثلاثية. تأكد من أن النص طويل بما فيه الكفاية."); }
  }

  async splitManuscript(text: string, onProgress?: ProgressCallback): Promise<SplitSegment[]> {
    if (onProgress) onProgress("تحليل الهيكل المنطقي...");
    const systemPrompt = `أنت "النسّيك"، مقسّم الكتب المنطقي. حلل المخطوطة وحدد الأقسام المنطقية. لكل قسم، قدم عنوانًا، مقتطف بداية مطابق، والأساس المنطقي للتقسيم.`;
    const schema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, start_snippet: { type: Type.STRING }, rationale: { type: Type.STRING } }, required: ["title", "start_snippet", "rationale"] } };
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { role: 'user', parts: [{ text: `المخطوطة:\n${text.slice(0, 3000000)}` }] },
        config: { systemInstruction: systemPrompt, responseMimeType: 'application/json', responseSchema: schema }
      });
      const plan = this.parseResponse(response.text);
      if (!Array.isArray(plan)) throw new Error("فشل في إنشاء خطة تقسيم");
      if (onProgress) onProgress("تقسيم النص...");
      const items = plan.map(p => ({ ...p, index: this.findSnippetIndex(text, p.start_snippet) })).filter(p => p.index !== -1).sort((a, b) => a.index - b.index);
      if (items.length === 0) return [{ title: "النص الكامل", content: text, rationale: "لم يتمكن من تحديد أقسام منطقية." }];
      return items.map((current, i) => ({ title: current.title, rationale: current.rationale, content: text.slice(current.index, items[i + 1] ? items[i + 1].index : text.length).trim() }));
    } catch (e) { throw new Error("فشل في تقسيم المخطوطة."); }
  }

  private async processChunk(model: string, guideChunk: string, allDrafts: string[], chunkIndex: number, totalChunks: number, mode: EditingMode): Promise<{text: string, modifications: string[]}> {
    let roleDescription = "أنت 'النسّيك'، كبير المحررين في دار نشر سعودية مرموقة. مهمتك هي دمج المسودات لتحويلها إلى تحفة فنية.";
    // Role descriptions for other modes...
    const systemPrompt = `${roleDescription}\n\nنحن نعالج كتابًا في ${totalChunks} أجزاء. أنت تعمل على الجزء ${chunkIndex + 1}.\n*** تعليمات حاسمة - تحرير بدون فقدان ***\nلا تقم بتلخيص النص. يجب أن يكون طول المخرج مساويًا تقريبًا لطول المدخل. أنت محرر، ولست ملخصًا.`;
    const chunkSchema = { type: Type.OBJECT, properties: { mergedSegment: { type: Type.STRING }, keyChanges: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["mergedSegment"] };
    try {
      const response = await this.ai.models.generateContent({
        model: model,
        contents: { role: 'user', parts: [{ text: `النص الإرشادي:\n"""${guideChunk}"""` }] as any },
        config: { systemInstruction: systemPrompt, responseMimeType: 'application/json', responseSchema: chunkSchema, temperature: 0.4 }
      });
      const json = this.parseResponse(response.text);
      return { text: json.mergedSegment || "", modifications: json.keyChanges || [] };
    } catch (e) { return { text: guideChunk, modifications: ["خطأ في معالجة الجزء - تم استخدام المسودة الأصلية"] }; }
  }
  
  private findSnippetIndex(text: string, snippet: string): number {
    if (!snippet) return -1;
    let idx = text.indexOf(snippet); if (idx !== -1) return idx;
    if (snippet.length > 30) { idx = text.indexOf(snippet.slice(0, 30)); if (idx !== -1) return idx; }
    if (snippet.length > 30) { idx = text.indexOf(snippet.slice(-30)); if (idx !== -1) return idx; }
    return -1;
  }

  private snapToParagraph(text: string, approxIndex: number): number {
    const next = text.indexOf('\n', approxIndex); if (next !== -1 && (next - approxIndex) < 5000) return next + 1;
    const prev = text.lastIndexOf('\n', approxIndex); if (prev !== -1 && (approxIndex - prev) < 5000) return prev + 1;
    return approxIndex;
  }

  private splitTextIntoChunks(text: string, chunkSize: number): string[] {
    const chunks = []; let i = 0;
    while (i < text.length) {
      let end = Math.min(i + chunkSize, text.length);
      chunks.push(text.slice(i, end).trim());
      i = end;
    }
    return chunks;
  }

  private parseResponse(text: string | undefined): any {
    if (!text) throw new Error("استجابة فارغة");
    let clean = text.trim().replace(/^```json\s*/, '').replace(/\s*```$/, '');
    try { return JSON.parse(clean); } catch (e) { return { mergedSegment: clean }; }
  }

  private getModeLabel(mode: EditingMode): string {
    switch(mode) {
      case 'proofread': return 'تدقيق لغوي';
      case 'philosophical': return 'مراجعة فلسفية';
      case 'structure': return 'تنسيق وهيكلة';
      case 'sequential_merge': return 'دمج متسلسل';
      case 'trilogy_architect': return 'هندسة الثلاثية';
      case 'logical_split': return 'تقسيم منطقي';
      default: return 'تحرير شامل';
    }
  }
}