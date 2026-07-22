import {
  GoogleGenAI,
  Type,
} from "@google/genai";

import { buildTutorPrompt } from "./prompts/tutorPrompt";

const GEMINI_MODEL =
  "gemini-2.5-flash";

const apiKey =
  process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error(
    "GEMINI_API_KEY is not configured"
  );
}

const ai = new GoogleGenAI({
  apiKey,
});

/* =========================================================
   ESQUEMA ESTRUCTURADO DE RESPUESTA
========================================================= */

const tutorResponseSchema = {
  type: Type.OBJECT,

  properties: {
    assistantReply: {
      type: Type.STRING,

      description:
        "Friendly and concise response from the English tutor to the A1 student.",
    },

    feedback: {
      type: Type.OBJECT,

      properties: {
        overall: {
          type: Type.STRING,

          description:
            "Brief pedagogical feedback about the student's latest response.",
        },

        strengths: {
          type: Type.ARRAY,

          items: {
            type: Type.STRING,
          },

          description:
            "Specific strengths detected in the student's latest response.",
        },

        improvements: {
          type: Type.ARRAY,

          items: {
            type: Type.STRING,
          },

          description:
            "Specific aspects the student can improve.",
        },
      },

      required: [
        "overall",
        "strengths",
        "improvements",
      ],
    },

    corrections: {
      type: Type.ARRAY,

      items: {
        type: Type.OBJECT,

        properties: {
          wrong: {
            type: Type.STRING,

            description:
              "Incorrect fragment written by the student.",
          },

          correct: {
            type: Type.STRING,

            description:
              "Corrected version of the fragment.",
          },

          explanation: {
            type: Type.STRING,

            description:
              "Short A1-friendly explanation of the correction.",
          },

          type: {
            type: Type.STRING,

            enum: [
              "grammar",
              "vocabulary",
              "spelling",
              "capitalization",
              "coherence",
              "word_order",
              "other",
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

        required: [
          "word",
          "meaning",
          "example",
        ],
      },
    },

    grammarStructures: {
      type: Type.ARRAY,

      items: {
        type: Type.OBJECT,

        properties: {
          structure: {
            type: Type.STRING,
          },

          explanation: {
            type: Type.STRING,
          },

          example: {
            type: Type.STRING,
          },
        },

        required: [
          "structure",
          "explanation",
          "example",
        ],
      },
    },

    /*
     * Puntuación parcial de la intervención más reciente.
     * No representa la nota definitiva de la práctica.
     */
    score: {
      type: Type.INTEGER,
      minimum: 0,
      maximum: 100,

      description:
        "Score for the student's latest response only, from 0 to 100.",
    },

    performance: {
      type: Type.OBJECT,

      properties: {
        accuracy: {
          type: Type.INTEGER,
          minimum: 0,
          maximum: 100,

          description:
            "Overall linguistic accuracy of the latest student response, considering whether it communicates the intended meaning correctly.",
        },

        grammar: {
          type: Type.INTEGER,
          minimum: 0,
          maximum: 100,

          description:
            "Correct use of the grammar expected for the current unit, topic, and activity.",
        },

        vocabulary: {
          type: Type.INTEGER,
          minimum: 0,
          maximum: 100,

          description:
            "Appropriateness, variety, and correct use of vocabulary for the current A1 activity.",
        },

        interaction: {
          type: Type.INTEGER,
          minimum: 0,
          maximum: 100,

          description:
            "How well the student responds to the tutor, follows the task, and keeps the interaction moving.",
        },
      },

      required: [
        "accuracy",
        "grammar",
        "vocabulary",
        "interaction",
      ],
    },

    activityCompleted: {
      type: Type.BOOLEAN,

      description:
        "True only when the model believes the pedagogical objective has enough evidence. This is a suggestion and does not close the practice.",
    },

    nextSuggestion: {
      type: Type.STRING,

      description:
        "Short suggestion for the student's next response or practice step.",
    },
  },

  required: [
    "assistantReply",
    "feedback",
    "corrections",
    "newWords",
    "grammarStructures",
    "score",
    "performance",
    "activityCompleted",
    "nextSuggestion",
  ],
};

/* =========================================================
   FUNCIONES AUXILIARES
========================================================= */

const normalizeMetric = (value) => {
  const numericValue =
    Number(value);

  if (
    !Number.isFinite(
      numericValue
    )
  ) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(
      0,
      Math.round(numericValue)
    )
  );
};

const normalizeString = (
  value
) => {
  return typeof value === "string"
    ? value.trim()
    : "";
};

const normalizeStringArray = (
  value
) => {
  return Array.isArray(value)
    ? value
        .map(normalizeString)
        .filter(Boolean)
    : [];
};

const normalizeTutorResponse = (
  response
) => {
  const feedback =
    response?.feedback &&
    typeof response.feedback ===
      "object"
      ? response.feedback
      : {};

  const performance =
    response?.performance &&
    typeof response.performance ===
      "object"
      ? response.performance
      : {};

  return {
    assistantReply:
      normalizeString(
        response?.assistantReply
      ) ||
      "Let's continue practicing. Could you try one more sentence?",

    feedback: {
      overall:
        normalizeString(
          feedback.overall
        ),

      strengths:
        normalizeStringArray(
          feedback.strengths
        ),

      improvements:
        normalizeStringArray(
          feedback.improvements
        ),
    },

    corrections: Array.isArray(
      response?.corrections
    )
      ? response.corrections
          .map(
            (correction) => ({
              wrong:
                normalizeString(
                  correction?.wrong
                ),

              correct:
                normalizeString(
                  correction?.correct
                ),

              explanation:
                normalizeString(
                  correction
                    ?.explanation
                ),

              type:
                normalizeString(
                  correction?.type
                ) ||
                "grammar",
            })
          )
          .filter(
            (correction) =>
              correction.wrong ||
              correction.correct
          )
      : [],

    newWords: Array.isArray(
      response?.newWords
    )
      ? response.newWords
          .map((word) => ({
            word:
              normalizeString(
                word?.word
              ),

            meaning:
              normalizeString(
                word?.meaning
              ),

            example:
              normalizeString(
                word?.example
              ),
          }))
          .filter(
            (word) => word.word
          )
      : [],

    grammarStructures:
      Array.isArray(
        response
          ?.grammarStructures
      )
        ? response.grammarStructures
            .map(
              (structure) => ({
                structure:
                  normalizeString(
                    structure
                      ?.structure
                  ),

                explanation:
                  normalizeString(
                    structure
                      ?.explanation
                  ),

                example:
                  normalizeString(
                    structure
                      ?.example
                  ),
              })
            )
            .filter(
              (structure) =>
                structure.structure
            )
        : [],

    score: normalizeMetric(
      response?.score
    ),

    performance: {
      accuracy:
        normalizeMetric(
          performance.accuracy
        ),

      grammar:
        normalizeMetric(
          performance.grammar
        ),

      vocabulary:
        normalizeMetric(
          performance.vocabulary
        ),

      interaction:
        normalizeMetric(
          performance.interaction
        ),
    },

    activityCompleted:
      Boolean(
        response
          ?.activityCompleted
      ),

    nextSuggestion:
      normalizeString(
        response?.nextSuggestion
      ),
  };
};

/* =========================================================
   GENERAR RESPUESTA PEDAGÓGICA
========================================================= */

export const generateTutorResponse =
  async ({
    context = {},
    messages = [],
    latestMessage = "",
  }) => {
    const normalizedLatestMessage =
      normalizeString(
        latestMessage
      );

    if (!normalizedLatestMessage) {
      throw new Error(
        "latest-message-required"
      );
    }

    const prompt =
      buildTutorPrompt({
        context,
        messages,
        latestMessage:
          normalizedLatestMessage,
      });

    try {
      const result =
        await ai.models.generateContent({
          model: GEMINI_MODEL,

          contents: prompt,

          config: {
            responseMimeType:
              "application/json",

            responseSchema:
              tutorResponseSchema,
          },
        });

      const responseText =
        result?.text;

      if (!responseText) {
        throw new Error(
          "empty-gemini-response"
        );
      }

      let parsedResponse;

      try {
        parsedResponse =
          JSON.parse(responseText);
      } catch {
        throw new Error(
          "invalid-gemini-json-response"
        );
      }

      return normalizeTutorResponse(
        parsedResponse
      );
    } catch (error) {
      console.error(
        "Error generating tutor response:",
        error
      );

      /*
       * Conserva el error original para que /api/chat
       * pueda identificar errores 429 u otros problemas.
       */
      throw error;
    }
  };