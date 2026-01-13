
export interface Gem {
  id: string;
  name: string;
  description: string;
  systemInstruction: string;
  icon: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}
