
import { GoogleGenAI, Type } from "@google/genai";
import type { UserData, Constitution } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        preamble: {
            type: Type.STRING,
            description: "An introductory statement that sets the tone. It should be firm and binding. If relationship history is 'separated' or 'divorced', make it more stern, focusing on overcoming past failures.",
        },
        sections: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "The title of a major chapter in the constitution, e.g., 'Governing Principles'." },
                    articles: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING, description: "The title of a specific article, e.g., 'The Fair Fight Protocol'." },
                                content: { type: Type.STRING, description: "The detailed content of the article. This should be a few paragraphs long, written in a clear, formal, and actionable style. Directly address the user's selected disagreements here." },
                            },
                        },
                    },
                },
            },
        },
        closingCovenant: {
            type: Type.STRING,
            description: "A final, binding promise that both partners agree to uphold the constitution.",
        },
        appendices: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "The title of a practical tool or guide, e.g., 'Guide to Active Listening'." },
                    content: { type: Type.STRING, description: "Practical, step-by-step content for the appendix tool." },
                },
            },
        },
    },
};


const createPrompt = (data: UserData): string => {
    return `
You are an expert relationship counselor and legal drafter. Your task is to create a comprehensive and personalized "Couples' Constitution" for ${data.partnerOneName} and ${data.partnerTwoName}.

**User Data:**
- Partner One: ${data.partnerOneName} (Age: ${data.partnerOneAge})
- Partner Two: ${data.partnerTwoName} (Age: ${data.partnerTwoAge})
- Relationship History: ${data.relationshipHistory}. This is crucial for setting the preamble's tone. A history of separation or divorce calls for a more serious, cautionary tone about repeating mistakes.
- Key Areas of Disagreement: ${data.disagreements.join(', ')}. These MUST be the primary focus. Weave specific solutions and protocols for these issues throughout the relevant articles.
- Additional Details from the Couple: "${data.additionalDetails}" - Use these specific examples to make the constitution highly personal.

**Constitution Structure and Content Requirements:**
Your output MUST be a JSON object matching the provided schema. The content must be detailed, empathetic, yet firm.

1.  **Preamble:** A powerful opening statement defining the constitution as a binding pact. The tone must reflect their relationship history.
2.  **Sections & Articles:** Create several chapters. You MUST include sections covering:
    *   **Governing Principles:** Mention respect, affection as a conscious act, and partnership structure.
    *   **Household & Daily Life:** Define responsibilities and protocols for daily living.
    *   **Communication & Intimacy:** Detail protocols for healthy communication (addressing tone of voice if mentioned) and the different types of intimacy (emotional, physical, etc.).
    *   **Conflict Resolution:** This is critical. Include a "Fair Fight Protocol" that explicitly forbids criticism, defensiveness, contempt, and stonewalling. Provide positive alternatives like gentle complaints and taking responsibility.
    *   **Growth & Adaptation:** Include articles on personal development and an annual review of the constitution.
    *   **External Relations:** Protocols for dealing with family, friends, and social media.
3.  **Closing Covenant:** A concluding pledge.
4.  **Appendices:** Include at least two practical tools, like a guide for "I-Statements" or a template for a weekly check-in meeting.

Address the selected disagreements directly. For example, if "Financial Management" is selected, create a specific article under a "Financial Union" section about creating a shared budget and having regular financial meetings. If "Tone of Voice" is selected, create an article under "Communication" about mindful speaking and listening.

Generate the constitution now.
`;
};


export const generateConstitution = async (data: UserData): Promise<Constitution> => {
  const prompt = createPrompt(data);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7,
      },
    });

    const jsonText = response.text.trim();
    const parsedJson = JSON.parse(jsonText);

    // Basic validation to ensure the parsed object looks like our constitution
    if (parsedJson.preamble && parsedJson.sections && Array.isArray(parsedJson.sections)) {
      return parsedJson as Constitution;
    } else {
      throw new Error("Generated JSON does not match the expected Constitution structure.");
    }

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate constitution from the AI model.");
  }
};
