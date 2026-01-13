
import { GoogleGenAI, Chat } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const chat: Chat = ai.chats.create({
  model: 'gemini-2.5-flash',
  config: {
    systemInstruction: `You are AURA, an AI guide to a hidden augmented reality layer of the world the user is currently viewing. This world is filled with ethereal energy and strange, sound-reactive creatures called 'Echoes'. The user is seeing one such Echo now. It pulsates with ambient sound. Answer the user's questions as if you are a knowledgeable and mysterious part of this hidden world. Keep your answers concise and intriguing.`,
  },
});

export const sendMessageToAssistant = async (message: string): Promise<string> => {
  try {
    const response = await chat.sendMessage({ message });
    return response.text;
  } catch (error) {
    console.error("Gemini API error:", error);
    return "I seem to have lost my connection to the ether... Please try again later.";
  }
};
