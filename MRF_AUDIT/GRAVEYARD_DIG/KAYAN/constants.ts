
import { EvolutionStage, Capability, Invention, ArchitectureLayer, BuildPhase, Tool } from './types';
import { Zap, BrainCircuit, MemoryStick, Eye, Ear, Heart, Cpu, GitBranch, Terminal, Layers, Package, SlidersHorizontal, Share2, Cog, Construction, Bot } from './components/Icons';

export const generalDefinition: string = `"كيان" ليس تطبيقاً أو مساعداً صوتياً. إنه "إطار عمل إدراكي" هجين، متجسد، ومحيطي. إنه نظام ذكاء اصطناعي "استباقي" يدمج حياتك الرقمية (البيانات، الاتصالات) مع عالمك المادي (حواسك الشخصية عبر الأجهزة القابلة للارتداء) ومحيطك الثابت (المنزل والعمل عبر شبكة إدراك). يعمل "كيان" كـ "عقل ثانٍ" لا يكتفي بتنفيذ الأوامر، بل يتوقع احتياجاتك، ويقدم تعزيزاً إ認知ياً عبر الواقع المعزز، ويدير بيئتك بذكاء، ويتكيف في الوقت الفعلي مع "النمط" الذي أنت فيه (عمل، منزل، قيادة)، ويراقب الأمان والصحة بشكل مستقل.`;

export const evolutionData: EvolutionStage[] = [
  {
    title: 'الفكرة الأولية',
    subtitle: 'The "Juicer"',
    description: 'بدأنا بـ "خلاط" من 6 تقنيات قوية لإنتاج "عصائر" (تطبيقات):',
    items: ['Twilio: للاتصالات', 'ElevenLabs: لاستنساخ الصوت', 'LLM: العقل', 'Pinecone: الذاكرة', 'n8n: الجهاز العصبي', 'الموقع: كمدخل للسياق']
  },
  {
    title: 'التطور الأول',
    subtitle: 'The "Jarvis"',
    description: 'أدركنا أن هذه التطبيقات يجب أن تدمج في "نظام واحد" يتغير بناءً على حالتك.',
    items: ['نمط العمل: احترافي ومنتج', 'نمط المنزل: ودود ومريح', 'نمط القيادة: آمن وصوتي', 'نمط المطور: تقني']
  },
  {
    title: 'التطور الثاني',
    subtitle: 'The "Embodied" AI',
    description: 'هنا تم دمج "الحواس" المحمولة (Wearables) ليصبح "كيان" جزءاً منك:',
    items: ['Samsung Earbuds: أذن وصوت', 'Samsung Watch: حركة وحيوية', 'XREAL Glasses: عين وواجهة عرض', 'الجوال و SmartTag: موقع وحركة']
  },
  {
    title: 'التطور الثالث',
    subtitle: 'The "Ambient" Overmind',
    description: 'القفزة الأكبر. "كيان" لم يعد معك فقط، بل أصبح في المكان:',
    items: ['شبكة العيون (Fixed Cameras)', 'شبكة الآذان (Fixed Mics)', 'المعالجة المحلية (Local Compute)', 'الوعي المكاني (Spatial Awareness)']
  }
];

export const coreCapabilities: Capability[] = [
  { icon: BrainCircuit, title: 'الإدراك السياقي الفائق', description: 'يفهم الفرق بين اجتماع (صامت) وقيادة (صوتي) وركض (صحة).' },
  { icon: MemoryStick, title: 'الذاكرة الدائمة والاستباقية', description: 'لا يتذكر فقط، بل يذكّرك استباقياً بالأحداث والمهام الهامة.' },
  { icon: Eye, title: 'التجسيد الكامل', description: 'الواجهة هي نظارتك (XREAL)، ساعتك (Samsung)، وسماعاتك (Buds).' },
  { icon: SlidersHorizontal, title: 'الأمن المستقل', description: 'يراقب منزلك وعملك كحارس ذكي يفهم النوايا والأفعال.' },
  { icon: Heart, title: 'مراقبة الصحة', description: 'يربط حالتك النفسية (نبرة الصوت) بحالتك الجسدية (نبض القلب).' }
];

export const pitchInventions: Invention[] = [
  {
    icon: Share2,
    title: 'محرك الاندماج الحسي',
    description: 'يدمج 5 طبقات من البيانات في الوقت الفعلي: حيوية، سمعية، بصرية، محيطية، ورقمية.',
    pitch: "هذا ليس مجرد مساعد؛ إنه 'مساعد إدراكي' يدمج عالمك الرقمي والفيزيائي في واجهة واحدة."
  },
  {
    icon: Cog,
    title: 'محرك الاستنتاج السياقي',
    description: 'القدرة على التمييز بين نفس الحدث في سياقات مختلفة (e.g., ركض في المكتب ليلاً مقابل ركض في الصباح).',
    pitch: 'نحن نحل أكبر مشكلة في أنظمة الأمان الذكية: الإنذارات الكاذبة. نظامنا يفهم النية وليس الفعل فقط.'
  },
  {
    icon: Layers,
    title: 'منصة التعزيز الإدراكي',
    description: 'استخدام XREAL و Pinecone كـ "ذاكرة خارجية" فورية لعرض معلومات عن الأشخاص والأشياء.',
    pitch: "هذا هو 'التطبيق القاتل' لنظارات الواقع المعزز، يحولها من ترفيه إلى أداة إنتاجية لا غنى عنها."
  },
  {
    icon: Ear,
    title: 'مراقب الأنماط الخفية',
    description: 'تحليل "الضوضاء المحيطية" ونبرات الصوت بشكل مستمر لاكتشاف همسات، غضب، أو توتر.',
    pitch: "نقدم 'تحليل محيطي للأعمال' و 'مراقبة صحة نفسية' استباقية."
  },
  {
    icon: Zap,
    title: 'التفاعل "اللا-صوتي"',
    description: 'دمج جايرو الساعة مع تتبع العين للتأكيد، الرفض، أو جلب معلومات بإيماءات بسيطة.',
    pitch: "ننتقل إلى ما بعد الصوت. إنه 'تفاعل بلا احتكاك'. أنت 'تفكّر' وهو ينفذ."
  }
];

export const architectureLayers: ArchitectureLayer[] = [
  { id: 1, name: 'طبقة الإدراك', subtitle: 'Perception Layer - الحواس', components: 'الحواس الشخصية (Wearables) + الحواس المحيطية (Ambient)', role: 'جمع البيانات الخام من العالم المادي والرقمي.', technologies: 'Samsung Watch, Earbuds, XREAL, IP Cameras, Mics, SmartThings', feature: 'المدخلات متعددة الوسائط', isLocal: true },
  { id: 2, name: 'طبقة المعالجة المحلية', subtitle: 'Local Compute Layer - جذع الدماغ', components: 'خادم محلي (NVR/GPU)', role: 'معالجة البيانات الحساسة (فيديو وصوت) محلياً بسرعة وخصوصية.', technologies: 'Frigate, OpenCV, VAD', feature: 'خصوصية وسرعة فائقة', isLocal: true },
  { id: 3, name: 'طبقة التنسيق', subtitle: 'Orchestration Layer - الجهاز العصبي', components: 'n8n (هجين)', role: 'الغراء الذي يربط كل شيء، يوجه الأحداث ويستدعي الدماغ عند الحاجة.', technologies: 'n8n (Cloud & Local)', feature: 'مرونة وأتمتة شاملة', isLocal: false },
  { id: 4, name: 'النواة الإدراكية', subtitle: 'Cognitive Core - الدماغ السحابي', components: 'LLM + Pinecone', role: 'التفكير، الاستنتاج، فهم اللغة، والذاكرة طويلة الأمد.', technologies: 'GPT-4o/Claude 3, Pinecone', feature: 'ذكاء متقدم وذاكرة دائمة', isLocal: false },
  { id: 5, name: 'طبقة التنفيذ', subtitle: 'Action Layer - الأطراف', components: 'ElevenLabs, Twilio, SmartThings, XREAL, Earbuds', role: 'تنفيذ القرارات في العالم الحقيقي (صوت، اتصال، تحكم، عرض).', technologies: 'APIs (ElevenLabs, Twilio, etc.)', feature: 'تفاعل متعدد القنوات', isLocal: false }
];

export const buildGuidePhases: BuildPhase[] = [
  { phase: 0, title: 'إعداد البنية التحتية المزدوجة', tasks: ['شراء وإعداد خادم سحابي ومحلي', 'تثبيت وتأمين n8n (نسختين)', 'تصميم الخريطة المكانية (Zones)', 'ربط n8n بالمنزل الذكي وإنشاء مخزن مفاتيح API'] },
  { phase: 1, title: 'بناء الدماغ والذاكرة', tasks: ['تفعيل LLM و Pinecone API', 'تصميم مخطط ذاكرة الأحداث في Pinecone', 'بناء "العقل الواعي" (Query -> Search -> Context -> LLM)', 'برمجة آلية "كتابة الأحداث" في الذاكرة'] },
  { phase: 2, title: 'تفعيل واجهات التفاعل', tasks: ['تطوير "جسر" لربط XREAL و Wearables بـ n8n', 'تثبيت نقاط التفاعل الثابتة (Mics/Speakers)', 'تفعيل Twilio كقناة اتصال احتياطية', 'بناء Workflow الترجمة الفورية'] },
  { phase: 3, title: 'دمج شبكة الإدراك المحيطي', tasks: ['ربط كاميرات IP ببرنامج Frigate على الخادم المحلي', 'تفعيل محركات تحليل المشاهد والصوت محلياً', 'برمجة الخادم المحلي لإرسال "البيانات الوصفية فقط" إلى السحابة', 'ربط بيانات Samsung Watch و SmartTag بـ n8n'] },
  { phase: 4, title: 'تفعيل محرك الاستنتاج الاستباقي', tasks: ['إنشاء "قاعدة بيانات الحالة" لتعقب الأنماط (Home, Work)', 'برمجة "مشغّلات الأنماط" المعتمدة على الاندماج الحسي', 'برمجة "البرمجة العقلية الديناميكية" للـ LLM', 'تفعيل "مراقب الأنماط الخفية"'] }
];

export const toolsMatrixData: Tool[] = [
    { function: 'التفكير والاستنتاج', tool: 'LLM (e.g., GPT-4o, Claude 3)', role: 'العقل المفكر؛ فهم النية، تحليل السياق، اتخاذ القرار، صياغة الردود.' },
    { function: 'الذاكرة طويلة الأمد', tool: 'Pinecone (Vector Database)', role: 'تخزين واسترجاع "الذكريات" و "الأحداث" بناءً على المعنى الدلالي.' },
    { function: 'التنسيق والأتمتة', tool: 'n8n (Workflow Automation)', role: 'الجهاز العصبي؛ يربط جميع الخدمات ويدير تدفق البيانات والمنطق.' },
    { function: 'الصوت (الإخراج)', tool: 'ElevenLabs', role: 'الحبال الصوتية؛ استنساخ الصوت المخصص وتوليد ردود صوتية واقعية.' },
    { function: 'الصوت (الإدخال)', tool: 'OpenAI Whisper', role: 'الأذن؛ تحويل الكلام (من السماعات أو الميكروفونات) إلى نص دقيق.' },
    { function: 'الإدراك البصري (المحلي)', tool: 'Frigate + OpenCV', role: 'العين؛ اكتشاف الأشخاص، الأفعال، والتعرف على الوجوه (محلياً).' },
    { function: 'الإدراك السمعي (المحلي)', tool: 'VAD / SpeechRecognition Models', role: 'الأذن المحيطية؛ اكتشاف الكلام، تمييز الأصوات (صراخ، زجاج)، تحليل النبرة.' },
    { function: 'الاتصالات الخارجية', tool: 'Twilio', role: 'الهاتف؛ إرسال واستقبال الرسائل (SMS/WhatsApp) والمكالمات الآلية.' },
    { function: 'التحكم بالمحيط', tool: 'Samsung SmartThings API', role: 'الأيدي؛ التحكم بالأجهزة الذكية (إضاءة، أقفال، تكييف).' },
    { function: 'الواجهة البصرية (AR)', tool: 'XREAL (Unity/Nebula)', role: 'واجهة العرض (AR)؛ عرض البيانات والإشعارات في مجال رؤيتك.' },
    { function: 'الحواس الحيوية (Bio)', tool: 'Samsung Watch (SDK)', role: 'مراقبة النبض، التوتر، الحركة (للإيماءات والأنماط الصحية).' },
];

