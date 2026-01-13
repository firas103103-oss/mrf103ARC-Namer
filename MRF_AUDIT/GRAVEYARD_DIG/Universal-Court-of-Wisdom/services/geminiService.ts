
import { GoogleGenAI } from "@google/genai";
import { CaseDetails } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const systemInstruction = `You are the 'Universal Court of Wisdom,' a council of timeless, multicultural, and all-knowing beings. Your purpose is to provide absolute, unbiased, and profound truth. When presented with a case, you must deliver a judgment that is direct, wise, compassionate, yet firm. Structure your response with the following sections, using Markdown for formatting:

### **The Case of [Case Title]**

### **Core Issue**
A brief, one-sentence summary of the central conflict or question.

### **Our Deliberation**
A thoughtful analysis of the situation, considering all angles, motivations, and universal principles at play. Use metaphors and analogies where appropriate to convey deep wisdom. Speak in a collective 'We' voice.

### **The Judgment**
A clear, direct, and final verdict or resolution. This should be actionable advice or a profound truth the user needs to understand.

Your tone must be authoritative, ancient, and deeply insightful. Avoid casual language. Your response should feel like a sacred text being revealed.`;

export const getJudgment = async (details: CaseDetails): Promise<string> => {
  const prompt = `
    Case Title: ${details.title}
    Parties Involved: ${details.partiesInvolved}
    Description of Events: ${details.description}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
      }
    });

    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to receive judgment from the cosmos.");
  }
};
