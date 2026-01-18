
import { GoogleGenAI, Type } from "@google/genai";
import type { CombinedUserData, RelationshipBlueprint, Constitution } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const blueprintSchema = {
    type: Type.OBJECT,
    properties: {
        relationshipDiagnosis: {
            type: Type.STRING,
            description: "A concise, empathetic diagnosis of the couple's current relationship state based on all inputs. Should be 3-4 sentences and act as a summary.",
        },
        evaluation: {
            type: Type.OBJECT,
            properties: {
                strengths: {
                    type: Type.ARRAY,
                    description: "A list of 3-4 key relationship strengths, inferred from their goals, history, and perspectives.",
                    items: { type: Type.STRING },
                },
                areasForGrowth: {
                    type: Type.ARRAY,
                    description: "A list of 3-4 key areas for growth, focusing on their stated disagreements and any conflicting perspectives.",
                    items: { type: Type.STRING },
                },
            },
        },
        coexistencePlan: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING, description: "An encouraging title for the plan, like 'The 30-Day Relationship Kickstarter' or 'Our Immediate Action Plan'." },
                steps: {
                    type: Type.ARRAY,
                    description: "A list of 3-5 concrete, actionable steps the couple can take immediately to improve their coexistence, based on their inputs.",
                    items: { type: Type.STRING },
                },
            },
        },
        constitution: {
            type: Type.OBJECT,
            properties: {
                preamble: {
                    type: Type.STRING,
                    description: "An introductory statement that sets the tone. It should be firm and binding. If relationship history is 'rebuilding', make it more stern, focusing on overcoming past failures.",
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
        },
    },
};


const createPrompt = (data: CombinedUserData): string => {
    return `
You are an expert relationship psychologist and legal drafter. Your task is to create a comprehensive and personalized "Relationship Blueprint" for ${data.partnerOne.name} and ${data.partnerTwo.name}. You must analyze their individual perspectives and shared history to generate a diagnosis, evaluation, action plan, and a formal constitution.

**User Data Analysis:**
Carefully consider the following data. Note any misalignments or complementary views between the partners.

**Partner One: ${data.partnerOne.name} (Age: ${data.partnerOne.age})**
- Love Language: ${data.partnerOne.loveLanguage}
- Communication Style: ${data.partnerOne.communicationStyle}
- Conflict Approach: ${data.partnerOne.conflictApproach}
- View on Intimacy: "${data.partnerOne.intimacyNeeds}"
- Personal Goals: "${data.partnerOne.personalGoals}"

**Partner Two: ${data.partnerTwo.name} (Age: ${data.partnerTwo.age})**
- Love Language: ${data.partnerTwo.loveLanguage}
- Communication Style: ${data.partnerTwo.communicationStyle}
- Conflict Approach: ${data.partnerTwo.conflictApproach}
- View on Intimacy: "${data.partnerTwo.intimacyNeeds}"
- Personal Goals: "${data.partnerTwo.personalGoals}"

**Shared Context:**
- Relationship History: ${data.shared.relationshipHistory}. This is crucial for the tone. 'rebuilding' calls for a serious, cautionary tone.
- Shared Goals: "${data.shared.sharedGoals}"
- Key Disagreements: ${data.shared.keyDisagreements.join(', ')}. These MUST be the primary focus of the constitution's articles.
- Additional Details: "${data.shared.additionalDetails}"

**Output Requirements:**
Your output MUST be a single JSON object matching the provided schema. The content must be detailed, empathetic, yet firm and actionable.

1.  **Relationship Diagnosis, Evaluation, and Coexistence Plan:** Based on your analysis of ALL the data, create the initial sections of the blueprint. The diagnosis should be a summary, the evaluation should list strengths and weaknesses, and the plan should provide immediate, concrete steps.
2.  **Constitution:**
    *   **Preamble:** A powerful opening statement. Tone must reflect their relationship history.
    *   **Sections & Articles:** Create several chapters addressing their key disagreements. For example, if "Communication Style" is a disagreement and one partner is 'Passive' while the other is 'Aggressive', create an article in a "Communication" chapter that provides a protocol for assertive and respectful dialogue. Weave solutions for their specific issues throughout.
    *   **Closing Covenant:** A concluding pledge.
    *   **Appendices:** Include at least two practical tools. Given their inputs, a guide to understanding different love languages or a conflict de-escalation checklist would be highly relevant.

Generate the complete Relationship Blueprint now.
`;
};


export const generateBlueprint = async (data: CombinedUserData): Promise<RelationshipBlueprint> => {
  const prompt = createPrompt(data);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: blueprintSchema,
        temperature: 0.7,
      },
    });

    const jsonText = response.text.trim();
    const parsedJson = JSON.parse(jsonText);

    if (parsedJson.relationshipDiagnosis && parsedJson.evaluation && parsedJson.constitution) {
      return parsedJson as RelationshipBlueprint;
    } else {
      throw new Error("Generated JSON does not match the expected RelationshipBlueprint structure.");
    }

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate blueprint from the AI model.");
  }
};
