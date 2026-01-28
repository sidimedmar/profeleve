import { GoogleGenAI, Type } from "@google/genai";
import { Question, QuestionType } from "../types";

const apiKey = process.env.API_KEY || ''; // Ensure this is set in your environment
const ai = new GoogleGenAI({ apiKey });

export const generateQuestionFromTopic = async (topic: string, lang: 'fr' | 'ar'): Promise<Partial<Question> | null> => {
  try {
    const model = 'gemini-3-flash-preview';
    
    const prompt = `
      Create a multiple-choice quiz question about "${topic}" in ${lang === 'fr' ? 'French' : 'Arabic'}.
      It should have 4 options.
      Indicate which options are correct (indices 0-3).
      Assign a difficulty score (1-5) which we will use as points.
      Return strictly JSON.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING, description: "The question text" },
            type: { type: Type.STRING, enum: ["single", "multiple"], description: "Whether it is single or multiple choice" },
            options: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "List of 4 option texts"
            },
            correctOptionIndices: { 
              type: Type.ARRAY, 
              items: { type: Type.INTEGER },
              description: "Array of indices (0-3) that are correct"
            },
            points: { type: Type.INTEGER, description: "Points for this question" }
          },
          required: ["text", "type", "options", "correctOptionIndices", "points"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;

    const data = JSON.parse(text);

    return {
      id: crypto.randomUUID(),
      text: data.text,
      type: data.type === 'multiple' ? QuestionType.MULTIPLE : QuestionType.SINGLE,
      options: data.options.map((opt: string, idx: number) => ({ id: idx, text: opt })),
      correctOptionIds: data.correctOptionIndices,
      points: data.points
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
};