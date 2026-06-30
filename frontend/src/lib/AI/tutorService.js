import { openai } from "./openaiClient";
import { buildChatMessages } from "./builders/buildChatMessages";

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
    const messages = buildChatMessages({
      unit,
      topic,
      activity,
      difficulty,
      recentMessages,
      userMessage,
    });

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: messages,
      temperature: 0.4,
    });

    const rawText = response.output_text;

    if (!rawText) {
      throw new Error("Empty response from OpenAI.");
    }

    return JSON.parse(rawText);
  } catch (error) {
    console.error("Error generating tutor response:", error);
    return fallbackResponse;
  }
}