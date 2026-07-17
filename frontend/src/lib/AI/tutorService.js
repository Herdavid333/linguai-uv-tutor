import { GoogleGenAI, Type } from "@google/genai";
import { buildTutorSystemPrompt } from "./prompts/tutorPrompt";
import { buildContext } from "./builders/buildContext";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const tutorResponseSchema = {
  type: Type.OBJECT,
  properties: {
    assistantReply: {
      type: Type.STRING,
    },

    feedback: {
      type: Type.OBJECT,
      properties: {
        overall: {
          type: Type.STRING,
        },
        strengths: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
          },
        },
        improvements: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
          },
        },
      },
      required: ["overall", "strengths", "improvements"],
    },

    corrections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          wrong: {
            type: Type.STRING,
          },
          correct: {
            type: Type.STRING,
          },
          explanation: {
            type: Type.STRING,
          },
          type: {
            type: Type.STRING,
            enum: [
              "grammar",
              "vocabulary",
              "spelling",
              "coherence",
            ],
          },
        },
        required: [
          "wrong",
          "correct",
          "explanation",
          "type",
        ],
      },
    },

    newWords: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          word: {
            type: Type.STRING,
          },
          meaning: {
            type: Type.STRING,
          },
          example: {
            type: Type.STRING,
          },
        },
        required: ["word", "meaning", "example"],
      },
    },

    grammarStructures: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
    },

    score: {
      type: Type.INTEGER,
      minimum: 0,
      maximum: 100,
    },

    activityCompleted: {
      type: Type.BOOLEAN,
    },

    nextSuggestion: {
      type: Type.STRING,
    },
  },

  required: [
    "assistantReply",
    "feedback",
    "corrections",
    "newWords",
    "grammarStructures",
    "score",
    "activityCompleted",
    "nextSuggestion",
  ],
};

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
      .filter(
        (message) =>
          message &&
          typeof message.content === "string" &&
          message.content.trim()
      )
      .map(
        (message) =>
          `${message.role === "assistant" ? "Tutor" : "Student"}: ${
            message.content
          }`
      )
      .join("\n");

    const prompt = `
Recent conversation:
${conversationHistory || "No previous messages."}

${context}

Respond according to the required structured format.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.3,
        responseMimeType: "application/json",
        responseSchema: tutorResponseSchema,
      },
    });

    if (!response.text) {
      throw new Error("Gemini returned an empty response.");
    }

    const parsedResponse = JSON.parse(response.text);

    if (!parsedResponse.assistantReply) {
      throw new Error(
        "Gemini response does not contain assistantReply."
      );
    }

    return parsedResponse;
  } catch (error) {
    console.error("========== GEMINI ERROR ==========");
    console.error("Error name:", error?.name);
    console.error("Error message:", error?.message);
    console.error("Status:", error?.status);
    console.error("Code:", error?.code);
    console.error("Full error:", error);
    console.error("==================================");

    throw error;
  }
}