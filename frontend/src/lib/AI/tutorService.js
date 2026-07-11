import { GoogleGenAI } from "@google/genai";
import { buildTutorSystemPrompt } from "./prompts/tutorPrompt";
import { buildContext } from "./builders/buildContext";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const fallbackResponse = {
  assistantReply:
    "Sorry, I had a problem generating your feedback. Please try again.",
  feedback: {
    overall: "The tutor could not evaluate this response.",
    strengths: [],
    improvements: ["Try sending your answer again."],
  },
  corrections: [],
  newWords: [],
  grammarStructures: [],
  score: 0,
  activityCompleted: false,
  nextSuggestion: "Try again.",
};

export async function generateTutorResponse({
  unit,
  topic,
  activity,
  difficulty = "Beginner",
  recentMessages = [],
  userMessage,
}) {
  try {
    const systemInstruction = buildTutorSystemPrompt();

    const context = buildContext({
      unit,
      topic,
      activity,
      difficulty,
      userMessage,
    });

    const conversationHistory = recentMessages
      .map((message) => `${message.role}: ${message.content}`)
      .join("\n");

    const prompt = `
Recent conversation:
${conversationHistory || "No previous messages."}

${context}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.4,
        responseMimeType: "application/json",
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error generating tutor response:", error);
    console.error("Error message:", error.message);

    return fallbackResponse;
  }
}