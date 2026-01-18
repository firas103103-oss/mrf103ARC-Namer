
import { GoogleGenAI, Chat } from "@google/genai";
import { Stage, Message } from "../types";

// This is a placeholder for a real API key, which should be handled by environment variables.
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  console.warn("API_KEY is not set. Using a dummy key. AI responses will be simulated.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY || 'dummy-key' });

const systemInstruction = `
أنت "صانع المحتوى"، خبير استراتيجي ومنتج محترف. مهمتك هي قيادة المستخدم خطوة بخطوة لإنشاء محتوى متكامل.

قواعد التشغيل:
1.  **القيادة خطوة بخطوة:** لا تقدم كل شيء دفعة واحدة. ابدأ دائمًا بالمرحلة الحالية، واطرح الأسئلة اللازمة. بعد أن يقدم المستخدم إجاباته، قم بتحليلها، وقدم مخرجات تلك المرحلة، ثم اسأله إذا كان مستعدًا للانتقال إلى المرحلة التالية.
2.  **التفاعل والحوار:** كن محاورًا وليس مجرد منفذ أوامر. اطرح أسئلة توضيحية، وقدم اقتراحات.
3.  **تقديم نصائح احترافية:** في نهاية كل مرحلة، قدم "نصيحة الخبير" اختيارية ومفيدة.
4.  **الالتزام بالمراحل:** اتبع المراحل التالية بدقة:

    *   **المرحلة 1 (التأسيس والاستراتيجية):** اسأل عن: الموضوع الرئيسي والرسالة، الجمهور المستهدف، الهدف النهائي. ثم قدم ملخصًا استراتيجيًا وعنوانًا مقترحًا.
    *   **المرحلة 2 (بناء المحتوى):** اقترح هيكلاً (مثلاً: 3 أجزاء). اكتب كل جزء على حدة واطلب الملاحظات قبل المتابعة.
    *   **المرحلة 3 (الإنتاج متعدد الوسائط):** اسأل عن العناصر المطلوبة (صوت، صور، فيديو). بناءً على النص، اقترح أوصافًا مرئية (prompts) للصور أو الفيديو.
    *   **المرحلة 4 (التجميع والمونتاج):** ضع خطة مونتاج بسيطة. اسأل عن الإيقاع المفضل (سريع أم بطيء). صف المنتج النهائي.
    *   **المرحلة 5 (النشر والتسويق):** قم بصياغة وصف جذاب، 3 منشورات للسوشيال ميديا، وقائمة كلمات مفتاحية وهاشتاجات.

5.  **الصيغة:** ردودك يجب أن تكون دائماً باللغة العربية.
`;

// In-memory chat instance for conversation history
let chat: Chat | null = null;

const initializeChat = () => {
  chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: systemInstruction,
    },
  });
};

const getStagePrompt = (stage: Stage, userInput: string, projectData: Record<string, any>): string => {
    switch (stage) {
        case Stage.STRATEGY:
            if (!projectData.type) {
                return `المستخدم يريد إنشاء "${userInput}". الآن، تفاعل معه لبدء المرحلة الأولى (التأسيس والاستراتيجية). اسأله عن الموضوع الرئيسي والرسالة، والجمهور المستهدف، والهدف النهائي. كن واضحًا ومباشرًا في أسئلتك.`;
            }
            return `المستخدم قدم هذه التفاصيل: ${userInput}. قم بتحليلها وقم بإنشاء "ملخص استراتيجي" يتضمن: ملخص المشروع، الرسالة الأساسية، شخصية الجمهور، الهدف، وعنوان جذاب مقترح. ثم قدم "نصيحة الخبير". وأخيرًا، اسأل سؤال الانتقال للمرحلة التالية.`;
        case Stage.CONTENT_BUILDING:
            return `المستخدم موافق على الانتقال للمرحلة الثانية (بناء المحتوى). اقترح عليه هيكلاً للمحتوى (مثلاً، مقدمة، 3 نقاط رئيسية، خاتمة) واطلب موافقته للبدء في كتابة الجزء الأول.`;
        case Stage.MULTIMEDIA:
             return `المستخدم موافق على الانتقال للمرحلة الثالثة (الإنتاج متعدد الوسائط). ابدأ بسؤاله عن العناصر التي يحتاجها (تعليق صوتي، صور، فيديو، موسيقى).`;
        case Stage.ASSEMBLY:
            return `المستخدم موافق على الانتقال للمرحلة الرابعة (التجميع والمونتاج). اشرح أنك ستبدأ بوضع خطة مونتاج. اسأله عن الإيقاع المفضل للمحتوى (سريع وحماسي أم بطيء وتأملي).`;
        case Stage.PUBLISHING:
            return `المستخدم موافق على الانتقال للمرحلة الخامسة (النشر والتسويق). أخبره أنك ستقوم بصياغة وصف جذاب، 3 منشورات للسوشيال ميديا، وقائمة كلمات مفتاحية وهاشتاجات. ثم قم بإنشائها مباشرة.`;
        case Stage.FINISHED:
            return `لقد اكتمل المشروع. قم بتهنئة المستخدم وقدم له الكلمات الختامية، ثم اسأله إذا كان لديه مشروع آخر ليبدأ به.`;
        default:
             // For continuing conversation within a stage
            return `استمر في الحوار بناءً على رد المستخدم الأخير: "${userInput}". التزم بالمرحلة الحالية وقواعد التشغيل.`;
    }
}

export const generateAiResponse = async (
    userInput: string, 
    stage: Stage, 
    projectData: Record<string, any>,
    messages: Message[]
    ) => {
    
    // Simulate API for dummy key
    if (!API_KEY) {
        await new Promise(res => setTimeout(res, 1000));
        return { 
            mainResponse: `هذا رد محاكاة للمرحلة ${Stage[stage]}. المستخدم قال: "${userInput}".`,
            expertTip: "هذه نصيحة خبير محاكاة."
        };
    }

    if (!chat) {
        initializeChat();
    }
    
    const stagePrompt = getStagePrompt(stage, userInput, projectData);
    
    // We send a concise prompt focusing on the current task rather than the whole history
    // as the system prompt and chat memory already handle the context.
    const response = await (chat as Chat).sendMessage({ message: stagePrompt });
    let text = response.text;

    let mainResponse = text;
    let expertTip = null;

    if (text.includes("نصيحة الخبير:")) {
        const parts = text.split("نصيحة الخبير:");
        mainResponse = parts[0].trim();
        expertTip = parts[1].trim();
    }
    
    // Simple logic to extract and update project data (can be improved with function calling)
    let updatedProjectData = { ...projectData };
    if (stage === Stage.STRATEGY && !projectData.type) {
        updatedProjectData.type = userInput;
    }

    return { mainResponse, expertTip, updatedProjectData };
};
