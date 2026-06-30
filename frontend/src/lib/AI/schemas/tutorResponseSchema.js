export const tutorResponseSchema = {
  assistantReply: "",

  feedback: {
    overall: "",
    strengths: [],
    improvements: [],
  },

  corrections: [
    {
      wrong: "",
      correct: "",
      explanation: "",
      type: "grammar",
    },
  ],

  newWords: [
    {
      word: "",
      meaning: "",
      example: "",
    },
  ],

  grammarStructures: [],

  score: 0,

  activityCompleted: false,

  nextSuggestion: "",
};