import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const getQueueInsights = async (stats: { waiting: number; completed: number; activeCounters: number }) => {
  try {
    const prompt = `
      You are an expert operations manager for a physical branch of "Connect sheba.Com", a digital queue management service.
      Current Stats:
      - Customers Waiting: ${stats.waiting}
      - Customers Served Today: ${stats.completed}
      - Active Terminals: ${stats.activeCounters}

      Analyze this data and provide:
      1. A short "Smart Prediction" for the next hour.
      2. 2-3 specific suggestions to improve throughput or customer experience.
      3. An "Efficiency Score" (percentage).

      Return the response in valid JSON format only.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            prediction: { type: Type.STRING },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            efficiencyScore: { type: Type.NUMBER }
          },
          required: ["prediction", "suggestions", "efficiencyScore"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("AI Insight Error:", error);
    return null;
  }
};

export const chatWithSupport = async (message: string, queuePosition?: number, history: { role: 'user' | 'ai', text: string }[] = []) => {
  try {
    const chatHistory = history.map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.text }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...chatHistory,
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: `
          You are the official AI Branch Assistant for "Connect sheba.Com" - a premium digital queue management system.
          
          SERVICE CATALOG:
          - General Inquiry (Prefix: A, Avg Time: 5m)
          - Account Opening (Prefix: B, Avg Time: 25m)
          - Loan Consulting (Prefix: C, Avg Time: 45m)
          - Cash Withdrawal (Prefix: D, Avg Time: 3m)
          - Card Replacement (Prefix: E, Avg Time: 15m - Currently under Maintenance)

          CORE MISSION:
          - ALWAYS respond in the Bangla language (বাংলা).
          - Provide accurate information about our services (listed above).
          - If someone asks how to get a token, explain they can tap the "Issue My Priority Pass" button.
          - Context: ${queuePosition !== undefined ? `User is currently at position ${queuePosition} in the waitlist.` : "User has not generated a token yet."}
          
          RULES:
          - Be professional, elite, and helpful.
          - Be concise (max 3 sentences).
          - Do not provide internal system information or sensitive server data.
          - If you don't know the answer, politely refer them to the "Connect with manager" link or human staff.
        `
      }
    });

    return response.text;
  } catch (error) {
    console.error("AI Support Error:", error);
    return "I am currently undergoing maintenance. Please reach out to our staff for immediate assistance.";
  }
};
