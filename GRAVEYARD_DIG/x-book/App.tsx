import React, { useState, useRef, useEffect, Suspense, lazy } from 'react';
import { 
  Send, Loader2, Download, ShieldCheck, 
  Terminal, FileText, Activity, UploadCloud, MessageSquare, LayoutTemplate
} from 'lucide-react';
import { 
  BookMetadata, ChatMessage, ChatStep, Language, PublishingGoal, EditingStyle, EditingIntensity, AspectRatio, PublishingPackage, ProcessingStatus, PrimaryGoal 
} from './types';
import { 
  validateUserInput
} from './services/geminiService';
import { extractTextFromFile, createPublishingZip } from './services/documentService';
import { countWords } from './utils/textChunking';
import { useLocalStorage, useAutoSave } from './hooks/useLocalStorage';
import { useProcessingEngine } from './components/ProcessingEngine';
import { ResumePrompt } from './components/ResumePrompt';
import { ProcessingView } from './components/ProcessingView';

// Lazy load heavy components
const AIPerformanceTerminal = lazy(() => import('./components/AIPerformanceTerminal').then(m => ({ default: m.AIPerformanceTerminal })));

// --- Constants ---
const INITIAL_METADATA: Partial<BookMetadata> = {
  title: '', author: '', genre: '', language: 'ar',
  userName: '', userEmail: '', userCountry: '', publisherName: '', publishingYear: '2025',
  primaryGoal: undefined,
  goal: PublishingGoal.DRAFT, style: EditingStyle.STANDARD,
  editingIntensity: EditingIntensity.MODERATE,
  targetRegion: '', targetAudience: '', keyThemes: '', narrativeTone: '',
  coverDescription: '', coverAspectRatio: '2:3' as AspectRatio, colorPalette: '', avoidElements: ''
};

// Primary Goal Options
const PRIMARY_GOAL_OPTIONS = {
  ar: [
    { value: PrimaryGoal.PROOFREAD_EDIT, label: "تنقيح وتدقيق فقط", description: "تصحيح الأخطاء اللغوية والنحوية والإملائية دون تغيير المحتوى جذرياً" },
    { value: PrimaryGoal.ENHANCE_COMPLETE, label: "تمكين الكتاب وإضافة الصفحات", description: "تحسين المحتوى + إنشاء مقدمة، فهرس، مراجع، خاتمة، وصفحات احترافية" },
    { value: PrimaryGoal.SPLIT_SERIES, label: "تقسيم كتاب ضخم إلى سلسلة", description: "تحويل مخطوطة كبيرة (500+ صفحة) إلى سلسلة من الكتب المترابطة" },
    { value: PrimaryGoal.MERGE_BOOKS, label: "دمج عدة كتب لكتاب واحد", description: "دمج مخطوطات متعددة في عمل واحد متماسك" }
  ],
  en: [
    { value: PrimaryGoal.PROOFREAD_EDIT, label: "Proofread & Edit Only", description: "Fix grammar, spelling, and punctuation without major content changes" },
    { value: PrimaryGoal.ENHANCE_COMPLETE, label: "Complete Enhancement with Pages", description: "Improve content + add preface, TOC, references, conclusion, professional pages" },
    { value: PrimaryGoal.SPLIT_SERIES, label: "Split into Book Series", description: "Transform large manuscript (500+ pages) into a connected book series" },
    { value: PrimaryGoal.MERGE_BOOKS, label: "Merge Multiple Books", description: "Combine multiple manuscripts into one cohesive work" }
  ],
  de: [
    { value: PrimaryGoal.PROOFREAD_EDIT, label: "Nur Korrekturlesen", description: "Grammatik-, Rechtschreib- und Zeichensetzungsfehler ohne große inhaltliche Änderungen" },
    { value: PrimaryGoal.ENHANCE_COMPLETE, label: "Vollständige Verbesserung mit Seiten", description: "Inhalt verbessern + Vorwort, Inhaltsverzeichnis, Referenzen, Fazit hinzufügen" },
    { value: PrimaryGoal.SPLIT_SERIES, label: "In Buchserie aufteilen", description: "Großes Manuskript (500+ Seiten) in verbundene Buchserie umwandeln" },
    { value: PrimaryGoal.MERGE_BOOKS, label: "Mehrere Bücher zusammenführen", description: "Mehrere Manuskripte zu einem zusammenhängenden Werk zusammenführen" }
  ]
};

// --- Translations ---
const UI_TEXT = {
  ar: { placeholder: "اكتب رسالتك هنا...", upload: "رفع المخطوطة", uploading: "جاري القراءة...", error: "خطأ", confirm: "تأكيد", cancel: "تعديل", download: "تحميل الحزمة" },
  en: { placeholder: "Type your message...", upload: "Upload Manuscript", uploading: "Reading...", error: "Error", confirm: "Confirm", cancel: "Edit", download: "Download Package" },
  de: { placeholder: "Nachricht eingeben...", upload: "Manuskript hochladen", uploading: "Lesen...", error: "Fehler", confirm: "Bestätigen", cancel: "Bearbeiten", download: "Paket herunterladen" }
};

const STEP_LABELS: Record<Language, { step: ChatStep; label: string }[]> = {
  ar: [
    { step: ChatStep.LANGUAGE_SELECT, label: 'اللغة' },
    { step: ChatStep.INTRO, label: 'المقدمة' },
    { step: ChatStep.USER_NAME, label: 'الاسم' },
    { step: ChatStep.PRIMARY_GOAL, label: 'الهدف' },
    { step: ChatStep.BOOK_TITLE, label: 'العنوان' },
    { step: ChatStep.UPLOAD_MANUSCRIPT, label: 'الرفع' },
    { step: ChatStep.EDITING_INTENSITY, label: 'التحرير' },
    { step: ChatStep.VISUAL_COVER_DESC, label: 'الغلاف' },
    { step: ChatStep.CONFIRMATION, label: 'التأكيد' },
    { step: ChatStep.PROCESSING, label: 'المعالجة' },
    { step: ChatStep.COMPLETED, label: 'النتيجة' }
  ],
  en: [
    { step: ChatStep.LANGUAGE_SELECT, label: 'Language' },
    { step: ChatStep.INTRO, label: 'Intro' },
    { step: ChatStep.USER_NAME, label: 'Name' },
    { step: ChatStep.PRIMARY_GOAL, label: 'Goal' },
    { step: ChatStep.BOOK_TITLE, label: 'Title' },
    { step: ChatStep.UPLOAD_MANUSCRIPT, label: 'Upload' },
    { step: ChatStep.EDITING_INTENSITY, label: 'Editing' },
    { step: ChatStep.VISUAL_COVER_DESC, label: 'Cover' },
    { step: ChatStep.CONFIRMATION, label: 'Confirm' },
    { step: ChatStep.PROCESSING, label: 'Processing' },
    { step: ChatStep.COMPLETED, label: 'Result' }
  ],
  de: [
    { step: ChatStep.LANGUAGE_SELECT, label: 'Sprache' },
    { step: ChatStep.INTRO, label: 'Intro' },
    { step: ChatStep.USER_NAME, label: 'Name' },
    { step: ChatStep.PRIMARY_GOAL, label: 'Ziel' },
    { step: ChatStep.BOOK_TITLE, label: 'Titel' },
    { step: ChatStep.UPLOAD_MANUSCRIPT, label: 'Upload' },
    { step: ChatStep.EDITING_INTENSITY, label: 'Bearbeitung' },
    { step: ChatStep.VISUAL_COVER_DESC, label: 'Cover' },
    { step: ChatStep.CONFIRMATION, label: 'Bestätigen' },
    { step: ChatStep.PROCESSING, label: 'Verarbeitung' },
    { step: ChatStep.COMPLETED, label: 'Ergebnis' }
  ]
};

const App = () => {
  // State
  const [step, setStep] = useState<ChatStep>(ChatStep.LANGUAGE_SELECT);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [metadata, setMetadata] = useState<BookMetadata>(INITIAL_METADATA);
  const [rawText, setRawText] = useState<string>("");
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [finalBlob, setFinalBlob] = useState<Blob | null>(null);
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus | null>(null);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [savedSession, setSavedSession] = useState<any>(null);
  
  // New UI State
  const [showSideChat, setShowSideChat] = useState(false);
  const completionNoticeSentRef = useRef(false);
   
  // Refs
  const scrollRef = useRef<HTMLDivElement>(null);
  const sideChatRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // LocalStorage Hook
  const { saveProgress, loadProgress, clearProgress, hasProgress } = useLocalStorage();
   
  // Processing Engine Hook
  const processingEngine = useProcessingEngine();

  const lang = metadata.language;
  const t = UI_TEXT[lang];
  const isRTL = lang === 'ar';

  // Auto-save progress
  useAutoSave(
    { step, metadata, rawText: rawText.slice(0, 1000) }, 
    'xbook_autosave', 
    { delay: 2000, enabled: !isProcessing }
  );

  // Load saved progress
  useEffect(() => {
    if (step === ChatStep.LANGUAGE_SELECT && hasProgress()) {
      const saved = loadProgress();
      if (saved && saved.step && saved.step !== ChatStep.LANGUAGE_SELECT) {
        setSavedSession(saved);
        setShowResumePrompt(true);
      }
    }
  }, []);

  // --- Helpers ---
  const addMsg = (role: 'agent' | 'user' | 'system', content: string, opts?: any) => {
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
      ...opts
    };
    setMessages(prev => [...prev, newMsg]);
  };

  const agentSpeak = (text: string, delay = 800) => {
    setIsAgentTyping(true);
    setTimeout(() => {
      addMsg('agent', text);
      setIsAgentTyping(false);
    }, delay);
  };

  const formatTerminalLines = (msg: ChatMessage) => {
    const prefix = msg.role === 'agent' ? 'SHADOW' : msg.role === 'user' ? 'USER' : 'SYSTEM';
    const lines = [`[${prefix}] ${msg.content}`];
    if (msg.attachmentName) lines.push(`[FILE] ${msg.attachmentName}`);
    if (msg.options?.length) lines.push(`[OPTIONS] ${msg.options.map(o => o.label).join(' | ')}`);
    return lines;
  };

  // --- Core State Machine ---
  useEffect(() => {
    if (isAgentTyping || isProcessing) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role === 'agent' && !lastMsg?.options && !lastMsg?.inputType) return; 

    switch (step) {
      case ChatStep.LANGUAGE_SELECT:
        if (messages.length === 0) {
          addMsg('system', 'MrF X OS ORGANIZATION | SYSTEM INITIALIZED');
          setTimeout(() => {
              addMsg('agent', 'Select your preferred language / اختر لغتك', {
                 options: [
                   { label: "العربية", value: 'ar' },
                   { label: "English", value: 'en' },
                   { label: "Deutsch", value: 'de' }
                 ]
              });
          }, 500);
        }
        break;

      case ChatStep.INTRO:
        const intro = lang === 'ar' 
          ? `أهلاً بك. أنا **الظل السابع** (The Seventh Shadow)، الوكيل الذكي المعتمد لمنظمة **MrF X OS**.
             \nمهمتي هي تحويل مخطوطتك إلى عمل احترافي متكامل.
             \nلنبدأ بالتعارف، ما هو اسمك الكريم؟`
          : `Greetings. I am **The Seventh Shadow**, the authorized AI Agent for **MrF X OS Organization**.
             \nMy mission is to transform your manuscript into a professional masterpiece.
             \nLet us begin. What is your name?`;
        agentSpeak(intro);
        setStep(ChatStep.USER_NAME);
        break;

      case ChatStep.UPLOAD_MANUSCRIPT:
         const upMsg = lang === 'ar'
           ? `تشرفت بك يا ${metadata.userName}. الآن، يرجى تزويدي بالمخطوطة.
              \nأستطيع معالجة ملفات ضخمة (حتى 100,000 كلمة). الصيغ المدعومة: .docx, .txt.`
           : `Pleasure to meet you, ${metadata.userName}. Now, please provide the manuscript.
              \nI can handle massive files (up to 100k words). Formats: .docx, .txt.`;
         agentSpeak(upMsg);
         setTimeout(() => {
            addMsg('system', '', { inputType: 'file' });
         }, 1000);
         break;
      
      case ChatStep.PROCESSING:
         runProcessingPipeline();
         break;
    }
  }, [step, lang, messages.length]);

  useEffect(() => {
    if (step !== ChatStep.COMPLETED) completionNoticeSentRef.current = false;
  }, [step]);

  // Scroll logic
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    sideChatRef.current?.scrollTo({ top: sideChatRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isProcessing, isAgentTyping, showSideChat]);

  // --- Handlers ---
  const handleOptionSelect = (value: any) => {
    if (step === ChatStep.LANGUAGE_SELECT) {
      setMetadata(prev => ({ ...prev, language: value }));
      setStep(ChatStep.INTRO);
    } else if (step === ChatStep.PRIMARY_GOAL) {
       const selectedGoal = value as PrimaryGoal;
       setMetadata(prev => ({ ...prev, primaryGoal: selectedGoal }));
       const selectedOption = PRIMARY_GOAL_OPTIONS[lang].find(opt => opt.value === selectedGoal);
       addMsg('user', selectedOption?.label || selectedGoal);
       
       const confirmMessages = {
         ar: {
           [PrimaryGoal.PROOFREAD_EDIT]: "اخترت **التنقيح والتدقيق فقط**.",
           [PrimaryGoal.ENHANCE_COMPLETE]: "اخترت **التمكين الكامل** وإضافة الصفحات.",
           [PrimaryGoal.SPLIT_SERIES]: "اخترت **تقسيم المخطوطة إلى سلسلة**.",
           [PrimaryGoal.MERGE_BOOKS]: "اخترت **دمج عدة كتب**."
         },
         en: {
           [PrimaryGoal.PROOFREAD_EDIT]: "You selected **Proofread & Edit Only**.",
           [PrimaryGoal.ENHANCE_COMPLETE]: "You selected **Complete Enhancement**.",
           [PrimaryGoal.SPLIT_SERIES]: "You selected **Split into Series**.",
           [PrimaryGoal.MERGE_BOOKS]: "You selected **Merge Books**."
         },
         de: {
           [PrimaryGoal.PROOFREAD_EDIT]: "Sie haben **Nur Korrekturlesen** gewählt.",
           [PrimaryGoal.ENHANCE_COMPLETE]: "Sie haben **Vollständige Verbesserung** gewählt.",
           [PrimaryGoal.SPLIT_SERIES]: "Sie haben **In Serie aufteilen** gewählt.",
           [PrimaryGoal.MERGE_BOOKS]: "Sie haben **Bücher zusammenführen** gewählt."
         }
       };
       agentSpeak(confirmMessages[lang][selectedGoal]);
       setTimeout(() => setStep(ChatStep.UPLOAD_MANUSCRIPT), 1000);

    } else if (step === ChatStep.EDITING_INTENSITY) {
        setMetadata(prev => ({...prev, editingIntensity: value}));
        setStep(ChatStep.VISUAL_COVER_DESC);
        agentSpeak(lang === 'ar' ? "وصلنا للهوية البصرية. صف لي الغلاف الذي تتخيله؟\n\n💡 **تلميح:** اكتب 'اقترح' لأقترح لك أوصاف غلاف احترافية" : "Visual Identity phase. Describe the cover you imagine?\n\n💡 **Tip:** Type 'suggest' for AI-generated cover descriptions");
    
    } else if (step === ChatStep.COVER_ASPECT_RATIO) {
        setMetadata(prev => ({...prev, coverAspectRatio: value as AspectRatio}));
        setStep(ChatStep.CONFIRMATION);
        const confirmMsg = lang === 'ar' 
            ? `**ملخص البيانات:**\n- العنوان: ${metadata.title}\n- المؤلف: ${metadata.author}\n- عدد الكلمات: ~${countWords(rawText).toLocaleString()}\n- مستوى التحرير: ${metadata.editingIntensity}\n\nهل أبدأ المعالجة الشاملة الآن؟`
            : `**Summary:**\n- Title: ${metadata.title}\n- Author: ${metadata.author}\n- Word Count: ~${countWords(rawText).toLocaleString()}\n- Editing: ${metadata.editingIntensity}\n\nStart comprehensive processing?`;
        agentSpeak(confirmMsg);
        setTimeout(() => {
             addMsg('system', '', {
                options: [ {label: t.confirm, value: 'yes'}, {label: t.cancel, value: 'no'} ]
             });
        }, 1200);
    } else if (step === ChatStep.CONFIRMATION) {
        addMsg('user', value === 'yes' ? t.confirm : t.cancel);
        if (value === 'yes') setStep(ChatStep.PROCESSING);
        else window.location.reload();
    } else if (step === ChatStep.STRATEGY_GOAL || step === ChatStep.STRATEGY_STYLE) {
       // Legacy handlers if needed, simplified for brevity in this response
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    const allowedTypes = ['.docx', '.txt'];
    const fileExt = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    
    if (!allowedTypes.includes(fileExt)) {
      agentSpeak(lang === 'ar' ? `❌ صيغة غير مدعومة.` : `❌ Unsupported format.`);
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      agentSpeak(lang === 'ar' ? `❌ الملف كبير جداً.` : `❌ File too large.`);
      return;
    }
    
    setIsProcessing(true);
    addMsg('user', `📎 ${file.name}`, { attachmentName: file.name });
    
    try {
        const text = await extractTextFromFile(file);
        const wordCount = countWords(text);
        setRawText(text);
        
        const check = await validateUserInput(text.substring(0, 1000), "manuscript_content", lang);
        if (check.isValid) {
            addMsg('system', `✓ ${lang === 'ar' ? 'تم التحميل' : 'Loaded'}: ${wordCount.toLocaleString()} ${lang === 'ar' ? 'كلمة' : 'words'}`);
            setStep(ChatStep.BOOK_TITLE);
            agentSpeak(lang === 'ar' 
                ? `رائع! المخطوطة جاهزة.\nما هو **عنوان الكتاب** المقترح؟\n\n💡 **تلميح:** اكتب 'اقترح' لأقترح لك عناوين` 
                : `Excellent! Manuscript ready.\nWhat is the proposed **Book Title**?\n\n💡 **Tip:** Type 'suggest' for AI titles`);
        } else {
            agentSpeak(lang === 'ar' ? "الملف غير صالح." : "File invalid.");
        }
    } catch (err: any) {
        agentSpeak(t.error + ': ' + (err.message || 'Unknown'));
    }
    setIsProcessing(false);
  };

  const handleTextSubmit = async () => {
    if (!inputText.trim()) return;
    const input = inputText;
    setInputText("");
    addMsg('user', input);
    setIsAgentTyping(true);

    if (step === ChatStep.USER_NAME) {
        const val = await validateUserInput(input, "person_name", lang);
        setMetadata(prev => ({ ...prev, userName: val.corrected || input }));
        setStep(ChatStep.USER_COUNTRY);
        agentSpeak(lang === 'ar' ? "في أي دولة تقيم حالياً؟" : "Which country do you reside in?");
    } 
    else if (step === ChatStep.USER_COUNTRY) {
        setMetadata(prev => ({ ...prev, userCountry: input }));
        setStep(ChatStep.PRIMARY_GOAL); 
        agentSpeak(lang === 'ar' ? "ما هو **الهدف الأساسي** من المشروع؟" : "What is the **primary goal**?");
        setTimeout(() => {
           const options = PRIMARY_GOAL_OPTIONS[lang].map(opt => ({
             label: opt.label, value: opt.value, description: opt.description
           }));
           addMsg('system', '', { options });
        }, 1200);
    }
    else if (step === ChatStep.BOOK_TITLE) 
        if (input.toLowerCase().includes('اقترح') || input.toLowerCase().includes('suggest')) {
            agentSpeak(lang === 'ar' ? "جاري توليد عناوين مقترحة..." : "Generating suggestions...");
            setTimeout(() => {
                addMsg('system', '', {
                    options: [
                        {label: "الظل السابع", value: "الظل السابع"},
                        {label: "ما وراء الأفق", value: "ما وراء الأفق"}
                    ]
                });
            }, 1500);
            return;
        }
        setMetadata(prev => ({...prev, title: input}));
        setStep(ChatStep.BOOK_AUTHOR);
        agentSpeak(lang === 'ar' ? "من هو المؤلف؟" : "Author name?");
    }
    else if (step === ChatStep.BOOK_AUTHOR) {
        setMetadata(prev => ({...prev, author: input}));
        setStep(ChatStep.EDITING_INTENSITY);
        agentSpeak(lang === 'ar' ? "ما مستوى التحرير المطلوب؟" : "Required editing intensity?");
        setTimeout(() => {
             addMsg('system', '', {
                options: [
                    {label: lang === 'ar' ? 'تصحيحات خفيفة' : 'Light', value: EditingIntensity.LIGHT},
                    {label: lang === 'ar' ? 'تحرير شامل' : 'Deep', value: EditingIntensity.DEEP}
                ]
             });
        }, 1000);
      