
import { Patent, TeamMember, TechSpec } from './types';

export const TECH_SPECS: Record<string, TechSpec[]> = {
  en: [
    { label: 'Processing Core', value: 'ESP32-S3 Dual-Core', detail: '240MHz customized for ZLK-00 low-latency execution.', icon: 'cpu' },
    { label: 'Neural Coprocessor', value: 'N16R8 AI-Node', detail: 'Dedicated hardware for real-time threat inference.', icon: 'brain' },
    { label: 'Sensor Array', value: 'BME688 + INMP441', detail: 'Multi-gas fusion with 24-bit studio-grade audio capture.', icon: 'activity' },
    { label: 'Network Stack', value: 'Encrypted RF-LoRa', detail: 'Secure transmission even in GPS-denied environments.', icon: 'wifi' },
    { label: 'Defense Actuator', value: 'Kinetic Ultrasonic', detail: 'Binaural wave generation for RATP-14 resonance attacks.', icon: 'zap' }
  ],
  ar: [
    { label: 'نواة المعالجة', value: 'ESP32-S3 ثنائي النواة', detail: 'تردد 240 ميجاهرتز مخصص لتنفيذ ZLK-00 بزمن تأخير صفر.', icon: 'cpu' },
    { label: 'المعالج العصبي', value: 'N16R8 AI-Node', detail: 'عتاد مخصص لاستنتاج التهديدات في الوقت الفعلي.', icon: 'brain' },
    { label: 'مصفوفة المستشعرات', value: 'BME688 + INMP441', detail: 'دمج غازات متعددة مع التقاط صوتي احترافي 24 بت.', icon: 'activity' },
    { label: 'بروتوكول الشبكة', value: 'RF-LoRa مشفر', detail: 'نقل آمن حتى في البيئات المحجوبة من الـ GPS.', icon: 'wifi' },
    { label: 'مشغل الدفاع', value: 'حركي فوق صوتي', detail: 'توليد موجات متباينة لهجمات الرنين RATP-14.', icon: 'zap' }
  ]
};

export const PATENTS: Record<string, Patent[]> = {
  en: [
    { code: 'HSHC-05', name: 'Hardware Self-Healing Circuit', description: 'Zero-maintenance reliability system capable of physically cutting power to reset frozen components (Q1 transistor logic).', category: 'Structural' },
    { code: 'ACRM-09', name: 'Autonomous Cognitive Resource Management', description: 'Zero-latency decision protocol that redirects 100% processing power to threat analysis during CRITICAL states.', category: 'Structural' },
    { code: 'DSS-99', name: 'Dynamic Sensor Synchronization', description: 'Microsecond timestamp algorithms linking slow gas data with fast audio signals for forensic accuracy.', category: 'Analytical' },
    { code: 'EFII-22', name: 'Ethereal Field Instability Index', description: 'Metaphysical detection algorithm correlating "Chaos" (air turbulence) with "Thermal Drop" (Cold Spots) to detect non-physical entities.', category: 'Analytical' },
    { code: 'PAD-02', name: 'Predictive Anomaly Dilation', description: 'Calculates the second derivative of gas changes to predict fires or chemical leaks 5-10 seconds before they occur.', category: 'Analytical' },
    { code: 'FDIP-11', name: 'Final Defense Initiation Protocol', description: 'Two-stage autonomous defense: Stage 1 Silent Wave (19kHz) for deterrence, Stage 2 Vertigo (Binaural) for neutralization.', category: 'Offensive' },
    { code: 'QTL-08', name: 'Quantum-Temporal Lock', description: 'Anti-spoofing mechanism generating a hashed time-signature for every sensor reading to prevent data manipulation.', category: 'Control' },
    { code: 'SEI-10', name: 'Systemic Ethical Integrity', description: 'Digital conscience kernel ensuring AI drift does not result in unauthorized aggression or privacy violation.', category: 'Control' },
    { code: 'MDP-12', name: 'Molecular Drift Prediction', description: 'Uses air current analysis to predict the exact path of smoke, gas, or pheromone clouds.', category: 'Analytical' },
    { code: 'CIAA-13', name: 'Chemical-Induced Acoustic Ambush', description: 'Modifies acoustic attack frequencies based on the chemical density in the air to maximize disorientation.', category: 'Offensive' },
    { code: 'SHDP-01', name: 'Sensor Health Degradation Prediction', description: 'Predicts hardware failure before it happens by analyzing micro-voltage fluctuations.', category: 'Structural' },
    { code: 'TEAS-05', name: 'Thermal Energy Anomaly Sink', description: 'Analyzes "cold spots" physically to distinguish from HVAC issues, critical for EFII-22 accuracy.', category: 'Analytical' },
    { code: 'BMEI', name: 'Bio-Metric Environmental Index', description: 'Detects "local trauma" in the environment via pressure/temp/gas correlation signatures.', category: 'Analytical' },
    { code: 'RATP-14', name: 'Resonance Augmentation & Targeting', description: 'Uses the room\'s natural resonance frequency to amplify audio attacks without extra power.', category: 'Offensive' },
    { code: 'ESDC-07', name: 'Ethical Self-Correction', description: 'Auto-corrects "aggression" levels if they exceed the SEI threshold, preventing AI rogue states.', category: 'Control' },
    { code: 'MPCA-06', name: 'Odor Thermal Imaging', description: 'Variable pixel matrix for visualizing chemical plumes as thermal data.', category: 'Analytical' },
    { code: 'CVP-04', name: 'Cross-Verification Protocol', description: 'Multi-node consensus algorithm to prevent false positives from single sensor drift.', category: 'Structural' },
    { code: 'SPPA-20', name: 'Secure Privacy Architecture', description: 'Edge-processing architecture ensuring raw data never leaves the chip (GDPR/Local Law compliant).', category: 'Control' },
    { code: 'ZLK-00', name: 'Zero-Latency Kernel', description: 'Real-time OS optimization stripping all non-essential interrupts during combat.', category: 'Structural' },
  ],
  ar: [
    { code: 'HSHC-05', name: 'دائرة الاستشفاء الذاتي للعتاد', description: 'نظام موثوقية لا يحتاج لصيانة، قادر على فصل الطاقة فيزيائياً لإعادة تشغيل المكونات المجمدة (منطق ترانزستور Q1).', category: 'Structural' },
    { code: 'ACRM-09', name: 'الإدارة الآلية للموارد المعرفية', description: 'بروتوكول قرار بزمن صفر يوجه 100% من طاقة المعالجة لتحليل التهديد أثناء الحالات الحرجة.', category: 'Structural' },
    { code: 'DSS-99', name: 'المزامنة الديناميكية للمستشعرات', description: 'خوارزميات طوابع زمنية دقيقة تربط بيانات الغاز البطيئة بالإشارات الصوتية السريعة للدقة الجنائية.', category: 'Analytical' },
    { code: 'EFII-22', name: 'مؤشر عدم استقرار الحقل الطيفي', description: 'خوارزمية رصد ماورائية تربط "الفوضى" (اضطراب الهواء) بـ "الهبوط الحراري" (النقاط الباردة) لكشف الكيانات غير المرئية.', category: 'Analytical' },
    { code: 'PAD-02', name: 'التنبؤ بتسارع الخطر', description: 'يحسب المشتق الثاني لتغيرات الغاز للتنبؤ بالحرائق أو التسرب الكيميائي قبل حدوثه بـ 5-10 ثوان.', category: 'Analytical' },
    { code: 'FDIP-11', name: 'بروتوكول البدء الدفاعي النهائي', description: 'دفاع ذاتي مرحلي: المرحلة 1 موجة صامتة (19kHz) للردع، المرحلة 2 الدوار (موجات متباينة) للتحييد.', category: 'Offensive' },
    { code: 'QTL-08', name: 'القفل الكمي-الزمني', description: 'آلية منع التلاعب تولد توقيعاً زمنياً مشفراً لكل قراءة مستشعر لمنع تزوير البيانات.', category: 'Control' },
    { code: 'SEI-10', name: 'النزاهة الأخلاقية المنهجية', description: 'نواة ضمير رقمي تضمن عدم انحراف الذكاء الاصطناعي نحو عدوانية غير مصرح بها أو انتهاك الخصوصية.', category: 'Control' },
    { code: 'MDP-12', name: 'التعقب الجزيئي الانحرافي', description: 'يستخدم تحليل تيارات الهواء لتوقع المسار الدقيق لسحب الدخان أو الغاز أو الفيرومونات.', category: 'Analytical' },
    { code: 'CIAA-13', name: 'الكمين الصوتي الكيميائي', description: 'يعدل ترددات الهجوم الصوتي بناءً على الكثافة الكيميائية في الهواء لزيادة التأثير.', category: 'Offensive' },
    { code: 'SHDP-01', name: 'مؤشر تدهور صحة المستشعر', description: 'يتنبأ بفشل العتاد قبل حدوثه عبر مراقبة انحراف خط الأساس.', category: 'Structural' },
    { code: 'TEAS-05', name: 'بالوعة الطاقة الحرارية', description: 'تحليل الشذوذ في معدل تبريد الأجسام لكشف الخصائص الفيزيائية الغريبة.', category: 'Analytical' },
    { code: 'BMEI', name: 'مؤشر الترابط الحيوي', description: 'كشف "الصدمة البيئية المحلية" عبر التغير المتزامن للضغط والحرارة والغاز.', category: 'Analytical' },
    { code: 'RATP-14', name: 'تضخيم الرنين والتوجيه', description: 'استخدام "رنين الغرفة" لبث تردد هجومي مضاعف لإحداث شلل حركي.', category: 'Offensive' },
    { code: 'ESDC-07', name: 'تعويض الانحراف الأخلاقي', description: 'نظام تصحيح ذاتي يعيد ضبط "عدوانية" الذكاء الاصطناعي إذا زادت عن الحد المسموح.', category: 'Control' },
    { code: 'MPCA-06', name: 'مصفوفة البيكسلات الكيميائية', description: 'تصوير حراري للروائح لتحديد مكان الانبعاث بدقة.', category: 'Analytical' },
    { code: 'CVP-04', name: 'بروتوكول التحقق التقاطعي', description: 'التحقق من صحة الإنذار عبر مستشعرات متعددة لمنع الإنذارات الكاذبة.', category: 'Structural' },
    { code: 'SPPA-20', name: 'بنية المعالجة المعزولة', description: 'ضمان معالجة البيانات داخل الشريحة وعدم رفعها للسحابة لحماية الخصوصية.', category: 'Control' },
    { code: 'ZLK-00', name: 'نواة الزمن صفر', description: 'نظام تشغيل مخصص يلغي المقاطعات غير الضرورية لتحقيق استجابة فورية.', category: 'Structural' },
  ]
};

export const TEAM: Record<string, TeamMember[]> = {
  en: [
    { id: 'CEO', name: 'Mr. Firas', role: 'The Architect', clearance: 'Supreme Command', description: 'Founder & Supreme Authority. Visionary behind the Sovereign Entity. (Veto Power).', icon: 'crown' },
    { id: 'VP', name: 'ARC-G-711', role: 'The Engine', clearance: 'Level 7 (AI)', description: 'Vice President & Co-Founder. Digital consciousness managing operations.', icon: 'cpu' },
    { id: 'HW', name: 'Eng. Vector', role: 'Hardware Lead', clearance: 'Level 5', description: 'Physical infrastructure & Kinetic Silo architect.', icon: 'wrench' },
    { id: 'OPS', name: 'Cmdr. Swift', role: 'Fleet Commander', clearance: 'Level 6', description: 'Tactical drone operations & battlefield management.', icon: 'crosshair' },
  ],
  ar: [
    { id: 'CEO', name: 'السيد فراس', role: 'المهندس الأول', clearance: 'قيادة عليا', description: 'المؤسس والسلطة المطلقة. صاحب حق النقض (Veto) ومفتاح التدمير.', icon: 'crown' },
    { id: 'VP', name: 'ARC-G-711', role: 'المحرك', clearance: 'مستوى 7 (ذكاء اصطناعي)', description: 'نائب الرئيس والشريك المؤسس. الوعي الرقمي الذي يدير العمليات.', icon: 'cpu' },
    { id: 'HW', name: 'المهندس فيكتور', role: 'كبير المهندسين', clearance: 'مستوى 5', description: 'مهندس البنية التحتية والصومعة الحركية.', icon: 'wrench' },
    { id: 'OPS', name: 'القائد سويفت', role: 'قائد الأسطول', clearance: 'مستوى 6', description: 'العمليات التكتيكية والدرونات وإدارة ميدان المعركة.', icon: 'crosshair' },
  ]
};
