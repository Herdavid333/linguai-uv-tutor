const ACTIVITY_STRATEGIES = {
  conversation: {
    instruction:
      "Continue the conversation with a short, friendly question related to the topic.",
    fallbackQuestion: "Can you tell me one more idea about this topic?",
  },
  vocabulary: {
    instruction:
      "Help the student use vocabulary in context. Ask them to create or improve a short sentence.",
    fallbackQuestion: "Can you write one sentence using a word from this topic?",
  },
  grammar: {
    instruction:
      "Guide the student to notice and improve grammar without giving a long explanation.",
    fallbackQuestion:
      "Can you try writing that sentence again with the correct structure?",
  },
  listening: {
    instruction:
      "Guide the student with a listening-style comprehension question.",
    fallbackQuestion:
      "What word or idea did you understand from the activity?",
  },
  speaking: {
    instruction:
      "Encourage the student to answer aloud or write a short spoken-style response.",
    fallbackQuestion:
      "Can you say or write a short answer using simple English?",
  },
};

const SPANISH_PATTERN =
  /\b(hola|gracias|quiero|puedo|como|cómo|estoy|soy|me llamo|no entiendo)\b/i;

export function generatePedagogicalResponse({ context, latestMessage }) {
  const studentText = latestMessage.content.trim();
  const activityType = context.activityType?.toLowerCase();
  const strategy = ACTIVITY_STRATEGIES[activityType];

  if (!strategy) {
    return buildDefaultResponse({ context });
  }

  if (SPANISH_PATTERN.test(studentText)) {
    return `Good try. Let's practice in simple English. For "${context.topicTitle}", you can start with a short sentence. ${strategy.fallbackQuestion}`;
  }

  if (studentText.length < 4) {
    return `Good start. Try to write a little more about "${context.topicTitle}". ${strategy.fallbackQuestion}`;
  }

  return [
    "Good job.",
    `We are practicing "${context.topicTitle}" through "${context.activityName}".`,
    strategy.instruction,
    strategy.fallbackQuestion,
  ].join(" ");
}

function buildDefaultResponse({ context }) {
  return `Good job. We are practicing "${context.topicTitle}". Can you continue with one short sentence in English?`;
}