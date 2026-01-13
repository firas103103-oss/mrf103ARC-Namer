# The Seventh Shadow (الظل السابع) | MrF Agent

## Elite AI Publishing System | MrF X OS Organization

![Version](https://img.shields.io/badge/Version-3.0.0_Complete-gold?style=for-the-badge)
![AI](https://img.shields.io/badge/AI-Gemini_3_Pro-blue?style=for-the-badge)
![Capacity](https://img.shields.io/badge/Capacity-1000+_Pages-green?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Production_Ready-brightgreen?style=for-the-badge)

> **"From Manuscript to Masterpiece: Full Autonomy, Zero Compromise."**

---

## 🌌 Overview | نبذة

**The Seventh Shadow** هو نظام AI متقدم يحول المخطوطات الخام إلى أعمال احترافية جاهزة للنشر.

تحت إدارة **MrF X OS Organization**، هذا الوكيل الذكي يستبدل النماذج الثابتة بحوار تفاعلي طويل وموجّه. يجري مقابلة شاملة مع المؤلف، يتحقق من المدخلات لحظياً، يحلل الاستراتيجية، وينفذ العمليات المعقدة من تحرير وتدقيق قانوني وتصميم أغلفة.

### 🎯 Primary Goals Supported (الأهداف الأساسية)

1. **Proofread & Edit Only** - تنقيح وتدقيق لغوي دون تغيير جذري
2. **Complete Enhancement** - تحسين المحتوى + إضافة صفحات احترافية (مقدمة، فهرس، مراجع، خاتمة)
3. **Split into Series** - تقسيم مخطوطة ضخمة (500+ صفحة) إلى سلسلة كتب مترابطة
4. **Merge Books** - دمج عدة مخطوطات في عمل واحد متماسك

---

## 🚀 Core Capabilities | القدرات الأساسية

### 🧠 Massive Context Engine (محرك السياق الضخم)

- معالجة مخطوطات حتى **150,000 كلمة** مباشرة في المتصفح
- خوارزمية **Smart Chunking** تقسم النص عند حدود الفقرات مع overlap ذكي
- تحليل شامل مع الحفاظ على تماسك السياق

### 🛡️ Real-Time Validation Loop

- وكيل **Flash-Lite Gatekeeper** يتحقق من كل مدخل لحظياً
- يعيد صياغة النوايا ويطلب التأكيد قبل الحفظ
- يمنع "Garbage In, Garbage Out"

### ⚖️ Strategic & Legal Intelligence

- **Literary Analysis:** تحليل الإيقاع، الثغرات الحبكية، الشخصيات
- **Legal Compliance:** فحص المخاطر القانونية حسب المنطقة المستهدفة
- **Market Strategy:** تحديد الجمهور والأسلوب السردي

### 🎨 Cinematic Cover Studio

- مدعوم بـ **Gemini Imagen 3**
- يولّد أغلفة سينمائية بدقة عالية
- أبعاد مخصصة (1:1, 2:3, 16:9)

### 📊 AI Performance Monitoring

- **Terminal لحظي** يعرض:
  - Tokens/sec المعالجة
  - استخدام الذاكرة
  - API Latency
  - النموذج النشط (Pro/Flash/Imagen)
  - تقدم الأجزاء (Chunk 3/12)

### 📦 Production-Ready Package

في نهاية الجلسة، تحصل على **ZIP متكامل**:

1. **Master Manuscript (.docx)** - مع فهرس وفصول منسقة
2. **Complete Dossier** - تقارير تحليلية وملاحظات محررين
3. **High-Res Cover Art** - غلاف احترافي
4. **MrF Signature Letter** - خطاب توقيع رسمي من المنظمة
5. **(Enhanced Mode)** مقدمة، فهرس، مراجع، خاتمة، فهرس موضوعي

---

## 🏗️ Technical Architecture | البنية التقنية

### Stack

- **Frontend:** React 19.2.3 + TypeScript + Vite 6.4.1
- **Styling:** Tailwind CSS 3.x (Dark Terminal Theme)
- **Icons:** lucide-react 0.562.0
- **AI Engine:** Google GenAI SDK
  - Validation: `gemini-flash-lite-latest`
  - Editing: `gemini-3-flash-preview`
  - Analysis: `gemini-3-pro-preview` (32k thinking budget)
  - Cover: `gemini-3-pro-image-preview`
- **Document Processing:** mammoth.js, docx, jszip

### State Management

- **useReducer Pattern** - 22+ step conversation flow
- **Context API** - global state sharing
- **localStorage** - progress persistence

### Smart Text Processing

```typescript
// Smart Chunking at paragraph boundaries
chunkTextSmart(text, {
  chunkSize: 75000,
  overlap: 1000,
  splitAt: ['\\n\\n', '.\\n', '؟\\n', '!\\n']
});

// Seamless merging with overlap detection
mergeEditedChunks(editedChunks);

// Length validation (±10% tolerance)
validateEditedLength(original, edited);
```

---

## 📋 Complete Workflow | سير العمل الكامل

### Phase 1: Identity & Strategy (الهوية والاستراتيجية)

1. **Language Selection** - اختيار اللغة (AR/EN/DE)
2. **Introduction** - تعريف الوكيل
3. **User Name** - اسم المستخدم
4. **User Email** - البريد الإلكتروني (مع validation)
5. **User Country** - الدولة (لأغراض رقابية)
6. **PRIMARY GOAL** - اختيار الهدف الأساسي ⭐ جديد
7. **Manuscript Upload** - رفع المخطوطة (.docx/.txt)

8. **Book Title** - عنوان الكتاب
9. **Author Name** - اسم المؤلف
10. **Publishing Goal** - هدف النشر (Draft/Commercial/Educational)
11. **Editing Style** - أسلوب التحرير (Minimal/Standard/Deep)
12. **Editing Intensity** - شدة التحرير (Light/Moderate/Deep/Preserve Voice)
13. **Preserve Voice?** - الحفاظ على الصوت الأصلي
14. **(Conditional) Custom Preferences** - تفضيلات مخصصة

### Phase 3: Targeting (الاستهداف)

1. **Target Region** - المنطقة المستهدفة
2. **Target Audience** - الجمهور المستهدف
3. **Key Themes** - المواضيع الرئيسية
4. **Narrative Tone** - النغمة السردية

### Phase 4: Visual Design (التصميم البصري)

1. **Cover Description** - وصف الغلاف
2. **Aspect Ratio** - نسبة الأبعاد
3. **Color Palette** - لوحة الألوان
4. **Avoid Elements** - عناصر يجب تجنبها

### Phase 5: Confirmation & Processing (التأكيد والمعالجة)

1. **CONFIRMATION** - مراجعة نهائية وتأكيد
2. **PROCESSING** - معالجة كاملة مع AI Performance Terminal
3. **PROCESSING** - معالجة كاملة مع AI Performance Terminal
4. **COMPLETED** - تحميل الحزمة النهائية

---

## 🎨 UI/UX Features | مميزات الواجهة

- **Dark Terminal Theme** - خلفية slate-950 مع gold-500 accents
- **RTL/LTR Support** - دعم كامل للعربية والإنجليزية والألمانية
- **Typing Animation** - نصوص متحركة character-by-character
- **Progress Visualization** - شريط تقدم مع chunk counter
- **Auto-Scroll** - تمرير تلقائي للرسائل الجديدة
- **File Upload** - drag & drop support (future enhancement)
- **Word Counter** - عداد كلمات عند رفع الملف

---

## 🔒 Security & Compliance | الأمان والامتثال

- **Legal Scanning** - فحص المحتوى للمخاطر القانونية حسب المنطقة
- **Content Validation** - تحقق من المدخلات لمنع الحقن والبريد العشوائي
- **Privacy** - معالجة محلية في المتصفح (لا رفع لخوادم خارجية إلا Google AI)
- **Compliance Reports** - تقارير امتثال قانوني مفصلة

---

## 🌍 Multi-Language Support | الدعم متعدد اللغات

| Language | UI | Processing | Cover Text |
| -------- | --- | ---------- | ---------- |
| العربية (AR) | ✅ | ✅ | ✅ |
| English (EN) | ✅ | ✅ | ✅ |
| Deutsch (DE) | ✅ | ✅ | ✅ |

---

## 🚀 Quick Start | البدء السريع

### Installation

```bash
git clone <repository>
cd x-book
npm install
```

### Configuration

Create `.env` file:

```env
API_KEY=your_google_genai_api_key
```

### Development

```bash
npm run dev
# Server runs on http://localhost:3000
```

### Production Build

```bash
npm run build
npm run preview
```

---

## 📊 Performance Metrics | مقاييس الأداء

- **Processing Speed:** 150-400 tokens/sec (depending on model)
- **Max Manuscript:** 150,000 words
- **Chunk Size:** 75k-80k characters
- **Overlap:** 1000 characters
- **API Latency:** 80-300ms average
- **Memory Usage:** <65% during processing

---

## 🛠️ Future Enhancements | التحسينات المستقبلية

- [ ] **Drag & Drop Upload** - سحب وإفلات الملفات
- [ ] **Multi-File Upload** (for merge_books goal)
- [ ] **Live Collaboration** - مشاركة الجلسة مع محررين آخرين
- [ ] **Voice Input** - إدخال صوتي للمحادثة
- [ ] **Export Formats** - PDF, EPUB, MOBI
- [ ] **Advanced Analytics** - تحليلات متقدمة للنصوص

---

## 📄 License & Attribution | الترخيص والإسناد

### Developed by MrF within Feras Assaf Group

This project operates under the **MrF X OS Organization** framework.

- **Primary Author:** The Seventh Shadow AI Agent
- **Organization:** MrF X OS
- **Parent Company:** Feras Assaf Group
- **License:** Proprietary (Contact for commercial use)

---

## 📞 Contact & Support | التواصل والدعم

- **Organization:** MrF X OS
- **Email:** <support@mrf-xos.org> (placeholder)
- **Website:** <https://mrf-xos.org> (placeholder)

---

### Powered by MrF X OS Organization | مدعوم من منظمة MrF X OS

- *Heavy Editing:* `gemini-3-flash-preview`
- *Vision:* `gemini-3-pro-image-preview`

- **Privacy Protocol:** **Local-First Processing.** The manuscript is processed in client memory and sent to the API in ephemeral chunks. No data is stored on external databases.

---

## ⚡ Installation & Deployment

### Prerequisites

- Node.js (v18+)

- Valid Google Gemini API Key (`GEMINI_API_KEY`)

### Quick Start

1. **Clone the Repository**

    ```bash
    git clone https://github.com/MrFXOS/seventh-shadow-agent.git
    cd seventh-shadow-agent
    ```

2. **Install Dependencies**

    ```bash
    npm install
    ```

3. **Configure Environment**
    Create a `.env` file in the root:

    ```env
    API_KEY=your_gemini_api_key_here
    ```

4. **Awaken the Agent**

    ```bash
    npm run dev
    ```

---

## 📜 License & Credits

**Developed by MrF** within **Feras Assaf Group**.
*All Rights Reserved © 2025.*

*This software is a proprietary internal tool released for specific strategic partners of MrF X OS Organization.*
