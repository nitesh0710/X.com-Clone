
import { GoogleGenAI } from "@google/genai";

// FIX: Per coding guidelines, assume API_KEY is always available from process.env and remove manual checks.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generatePostSuggestion = async (): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Give me a short, witty, and interesting post idea for a social media platform like X.com. It should be under 280 characters.",
      config: {
        temperature: 0.8,
        maxOutputTokens: 100,
        thinkingConfig: { thinkingBudget: 50 },
      },
    });
    
    const text = response.text.trim();
    // Clean up potential markdown like quotes or asterisks
    return text.replace(/["*]/g, '');
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get suggestion from AI.");
  }
};
