
import { GoogleGenAI } from "@google/genai";
import type { Concept } from '../types';

if (!process.env.API_KEY) {
    console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const generatePrompt = (concept: Concept, params: Record<string, any>): string => {
  const baseLocation = "You are observing a bustling modern-day city park with people, trees, a fountain, and skyscrapers in the background.";
  let dynamicDescription = '';

  switch (concept.id) {
    case 'chronos-glass':
      dynamicDescription = `The temporal lens is set to the year ${params.year}. The emotional resonance filter is tuned to '${params.emotion}'. Describe the scene as it appears now, focusing on the changes and the feeling in the air.`;
      break;
    case 'symbiotic-sightlines':
      dynamicDescription = `You are seeing through the eyes of a ${params.organism}. Describe the sensory experience. How are colors, shapes, and movements perceived differently? What new information is revealed through this unique perspective?`;
      break;
    case 'axiom-shifter':
      dynamicDescription = `The gravity axiom is set to ${params.gravity}g. The materials in the scene have been transmuted to a state of '${params.material}'. Describe the surreal and physically impossible phenomena you are witnessing.`;
      break;
    case 'collective-unconscious':
      dynamicDescription = `You have activated the '${params.visualization}' visualization. Describe the intangible forces you can now perceive. What do the emotional auras of people look like? How do the streams of ideas flow through the space?`;
      break;
  }

  return `${concept.promptContext}\n\n**Base Reality:** ${baseLocation}\n\n**Perspective Shift:** ${dynamicDescription}\n\nProvide a vivid, one-paragraph description.`;
};


export const generatePerspectiveContent = async (concept: Concept, params: Record<string, any>): Promise<string> => {
  try {
    const prompt = generatePrompt(concept, params);
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          temperature: 0.8,
          topP: 0.95,
        }
    });

    return response.text;
  } catch (error) {
    console.error("Error generating content with Gemini:", error);
    return "Error: Could not generate a new perspective. Please check your API key and connection.";
  }
};
