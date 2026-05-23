const ACTIVITY_STRATEGIES = {
  conversation: {
    fallbackQuestion: "Can you tell me one more idea about this topic?",
  },
  vocabulary: {
    fallbackQuestion: "Can you write one sentence using a word from this topic?",
  },
  grammar: {
    fallbackQuestion:
      "Can you try writing that sentence again with the correct structure?",
  },
  listening: {
    fallbackQuestion:
      "What word or idea did you understand from the activity?",
  },
  speaking: {
    fallbackQuestion:
      "Can you say or write a short answer using simple English?",
  },
};

const SPANISH_PATTERN =
  /\b(hola|gracias|quiero|puedo|como|cómo|estoy|soy|me llamo|no entiendo)\b/i;

export function generatePedagogicalResponse({ context, latestMessage }) {
  const studentText = latestMessage.content.trim();
  const normalizedText = studentText.toLowerCase();
  const activityType = context.activityType?.toLowerCase();
  const strategy = ACTIVITY_STRATEGIES[activityType];

  if (!strategy) {
    return buildDefaultResponse({ context });
  }

  if (SPANISH_PATTERN.test(studentText)) {
    return `Good try. Let's practice in English. You can say: "My name is..." ${strategy.fallbackQuestion}`;
  }

  if (studentText.length < 4) {
    return `Good start. Please write a little more. ${strategy.fallbackQuestion}`;
  }

  const intentResponse = getIntentResponse({
    normalizedText,
    studentText,
    context,
  });

  if (intentResponse) {
    return intentResponse;
  }

  return buildActivityResponse({ context, strategy });
}

function getIntentResponse({ normalizedText, studentText, context }) {
  const nameMatch = normalizedText.match(/\bmy name is ([a-záéíóúñ\s]+)/i);

  if (nameMatch) {
    const name = capitalizeFirst(nameMatch[1].trim());

    return `Nice to meet you, ${name}. Can you tell me where you are from?`;
  }

  const ageMatch = normalizedText.match(/\bi am (\d{1,2})\b/);

  if (ageMatch) {
    return `Good job. A better sentence is: "I am ${ageMatch[1]} years old." What do you like to do?`;
  }

  const likeMatch = normalizedText.match(/\bi like (.+)/);

  if (likeMatch) {
    return `Good sentence. You said: "I like ${likeMatch[1]}." What else do you like?`;
  }

  if (/\b(hi|hello|hey)\b/i.test(studentText)) {
    return `Hello. Nice to talk to you. What is your name?`;
  }

  if (/\b(i am|i'm) fine\b/i.test(studentText)) {
    return `Good answer. You can also say: "I'm fine, thank you." What is your name?`;
  }

  if (context.topicTitle.toLowerCase().includes("introducing")) {
    return `Good job. Try to introduce yourself with a short sentence, for example: "My name is..."`;
  }

  if (context.topicTitle.toLowerCase().includes("hobbies")) {
    return `Good job. Tell me about one hobby using: "I like..."`;
  }
 
  const physicalDescriptionMatch = normalizedText.match(
    /\b(i am|i'm)\s(tall|short|fat|thin|strong|beautiful|ugly|young|old)\b/i
  );

  if (physicalDescriptionMatch) {
    const adjective = physicalDescriptionMatch[2];

    return `Good description. You said: "I am ${adjective}." Can you describe your hair or eyes?`;
  }

  const hairMatch = normalizedText.match(
    /\b(i have)\s(.+)\s(hair|eyes)\b/i
  );

  if (hairMatch) {
    return `Very good. Can you describe another physical characteristic?`;
  }

  return null;
}

function buildActivityResponse({ context, strategy }) {
  return [
    "Good job.",
    `We are practicing "${context.topicTitle}".`,
    strategy.fallbackQuestion,
  ].join(" ");
}

function buildDefaultResponse({ context }) {
  return `Good job. We are practicing "${context.topicTitle}". Can you continue with one short sentence in English?`;
}

function capitalizeFirst(text) {
  if (!text) return "";

  return text
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}