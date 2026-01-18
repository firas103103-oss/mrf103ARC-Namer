import { Component, signal, computed, inject, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeminiService, EditingMode, SplitSegment, TrilogyBook, PublishingReport } from './services/gemini.service';
import mammoth from 'mammoth';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface ProcessedResult {
  // Editor results
  mergedContent?: string;
  wordCount?: number;
  modifications?: string[];
  splitSegments?: SplitSegment[];
  trilogyBooks?: TrilogyBook[];
  // Assistant results
  generatedImage?: string;
  publishingReport?: PublishingReport;
}

@Pipe({ name: 'safeHtml', standalone: true })
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(value: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(value);
  }
}

interface ModeInfo {
  id: EditingMode;
  title: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, SafeHtmlPipe],
  templateUrl: './app.component.html',
  styleUrls: [] 
})
export class AppComponent {
  private geminiService = inject(GeminiService);

  // Core State Signals
  uploadedFiles = signal<{name: string, content: string}[]>([]);
  isProcessing = signal(false);
  processingStep = signal<string>(''); 
  result = signal<ProcessedResult | null>(null);
  error = signal<string | null>(null);
  
  // UI State Signals
  mainView = signal<'editor' | 'assistant'>('editor');
  selectedMode = signal<EditingMode>('comprehensive');

  // Image Generation State
  isGeneratingImage = signal(false);
  imagePrompt = signal('');
  aspectRatio = signal<'1:1' | '3:4' | '4:3' | '9:16' | '16:9'>('3:4');
  imageSize = signal<1024 | 2048 | 4096>(1024);

  // Publishing Assistant State
  publishingTargetCountry = signal('');
  publishingPlatform = signal<'Amazon KDP' | 'دور النشر التقليدية' | 'عام'>('Amazon KDP');
  
  // UI Data
  modes: ModeInfo[] = [
    { id: 'comprehensive', title: 'محرر شامل', description: 'مجموعة كاملة: تدقيق، تحرير، تنسيق.', icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 21V3m0 18h6m-6 0H3m18 0h-6M21 3H3m18 0h-6M3 9h18M3 15h18" /></svg>' },
    { id: 'proofread', title: 'مدقق لغوي', description: 'للتدقيق الإملائي والنحوي فقط.', icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>' },
    { id: 'philosophical', title: 'ناقد فلسفي', description: 'تحليل المنطق والعمق الفكري.', icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13.182V17.182a2 2 0 002 2h10a2 2 0 002-2v-4m-2-4.182a2 2 0 00-2-2h-2a2 2 0 00-2 2v1.182" /><path d="M12 13.182V4.818a2 2 0 012-2h2a2 2 0 012 2v8.364" /></svg>' },
    { id: 'structure', title: 'منسّق', description: 'للهيكلة والتنسيق العام.', icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h7" /></svg>' },
    { id: 'sequential_merge', title: 'دمج منطقي', description: 'لدمج الفصول في كتاب واحد متناغم.', icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>' },
    { id: 'logical_split', title: 'تقسيم منطقي', description: 'لتقسيم الكتاب حسب الأفكار.', icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" /></svg>' },
  ];
  trilogyArchitectMode: ModeInfo = { id: 'trilogy_architect', title: 'مهندس الثلاثية', description: 'لتحويل مخطوطة واحدة إلى ثلاثية ناجحة (الأصل، الرحلة، الإرث).', icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v12a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" /></svg>' };
  aspectRatios = [
    { value: '3:4', label: 'A5 رأسي (3:4)' },
    { value: '1:1', label: 'مربع (1:1)' },
    { value: '4:3', label: 'أفقي (4:3)' },
    { value: '16:9', label: 'عريض (16:9)' },
    { value: '9:16', label: 'طولي (9:16)' }
  ];
  imageSizes = [
    { value: 1024, label: 'جودة قياسية (1K)' },
    { value: 2048, label: 'جودة عالية (2K)' },
    { value: 4096, label: 'جودة فائقة (4K)' },
  ];

  // Computed
  hasFiles = computed(() => this.uploadedFiles().length > 0);
  fileCount = computed(() => this.uploadedFiles().length);
  currentModeTitle = computed(() => {
    const allModes = [...this.modes, this.trilogyArchitectMode];
    const mode = allModes.find(m => m.id === this.selectedMode());
    if (this.selectedMode() === 'image_generation') return 'تصميم غلاف كتاب';
    if (this.selectedMode() === 'publishing_analysis') return 'تحليل التوافق للنشر';
    return mode?.title || 'غير محدد';
  });
  
  wordCountStatus = computed(() => {
    const count = this.result()?.wordCount || 0;
    if (count < 25000) return 'مسودة قصيرة';
    if (count > 80000) return 'مخطوطة ضخمة';
    return 'حجم كتاب قياسي';
  });

  setMode(mode: EditingMode) { this.selectedMode.set(mode); }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    this.error.set(null);
    const newFiles: {name: string, content: string}[] = [];
    for (let i = 0; i < input.files.length; i++) {
      const file = input.files[i];
      try {
        const text = await this.readFile(file);
        newFiles.push({ name: file.name, content: text });
      } catch (err: any) {
        this.error.set(`خطأ في قراءة ${file.name}: ${err.message}`);
      }
    }
    this.uploadedFiles.update(current => [...current, ...newFiles]);
    input.value = ''; 
  }

  removeFile(index: number) { this.uploadedFiles.update(files => files.filter((_, i) => i !== index)); }

  private async processTask(task: () => Promise<any>) {
    this.isProcessing.set(true);
    this.result.set(null);
    this.error.set(null);
    try {
      const response = await task();
      this.result.set(response);
    } catch (err: any) {
      this.error.set(err.message || 'حدث خطأ غير متوقع.');
    } finally {
      this.isProcessing.set(false);
      this.isGeneratingImage.set(false);
      this.processingStep.set('');
    }
  }

  startImageGeneration() {
    this.selectedMode.set('image_generation');
    this.isGeneratingImage.set(true);
    this.processTask(async () => {
      this.processingStep.set('يتم الآن استلهام الفكرة...');
      const imageUrl = await this.geminiService.generateImage({
        prompt: this.imagePrompt(),
        aspectRatio: this.aspectRatio(),
        size: this.imageSize()
      });
      return { generatedImage: imageUrl };
    });
  }

  startPublishingAnalysis() {
    if (!this.hasFiles() || !this.publishingTargetCountry()) return;
    this.selectedMode.set('publishing_analysis');
    this.processTask(async () => {
      this.processingStep.set('تحليل المخطوطة بعمق...');
      const combinedText = this.uploadedFiles().map(f => f.content).join('\n\n');
      const report = await this.geminiService.analyzeForPublishing({
        manuscript: combinedText,
        targetCountry: this.publishingTargetCountry(),
        platform: this.publishingPlatform()
      });
      return { publishingReport: report };
    });
  }
  
  startProcessing() {
    if (!this.hasFiles()) return;
    this.processTask(async () => {
      this.processingStep.set('تهيئة المحرر...');
      const contents = this.uploadedFiles().map(f => f.content);
      const mode = this.selectedMode();
      const combinedText = contents.join('\n\n');

      if (mode === 'logical_split') {
        const segments = await this.geminiService.splitManuscript(combinedText, (msg) => this.processingStep.set(msg));
        return { splitSegments: segments, modifications: ['تم تقسيم المخطوطة إلى ' + segments.length + ' أقسام.'] };
      } else if (mode === 'trilogy_architect') {
        const books = await this.geminiService.generateTrilogy(combinedText, (msg) => this.processingStep.set(msg));
        return { trilogyBooks: books, modifications: ['تمت إعادة هيكلة المخطوطة إلى ثلاثية.'] };
      } else {
        return await this.geminiService.processManuscript(contents, mode, (msg) => this.processingStep.set(msg));
      }
    });
  }

  reset() {
    this.result.set(null);
    this.error.set(null);
    if(this.mainView() === 'editor') {
      this.uploadedFiles.set([]);
    }
  }

  downloadResult() {
    const data = this.result()?.mergedContent;
    if (!data) return;
    this.downloadText(data, `مخطوطة_النسيك_الكاملة.txt`);
  }

  downloadSegment(segment: SplitSegment, index: number) { this.downloadText(segment.content, `جزء_${index + 1}_${segment.title.replace(/\s+/g, '_')}.txt`); }
  downloadBook(book: TrilogyBook) { this.downloadText(book.content, `مجلد_${book.volumeNumber}_${book.bookTitle.replace(/\s+/g, '_')}.txt`); }
  
  private downloadText(content: string, filename: string) {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }
  
  private async readFile(file: File): Promise<string> {
    if (file.name.toLowerCase().endsWith('.docx')) {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    }
    return file.text();
  }
}