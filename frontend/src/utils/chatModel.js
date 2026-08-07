export const CHAT_STORAGE_KEY = "linguai_chat";

export const MESSAGE_ROLES = {
  USER: "user",
  ASSISTANT: "assistant",
  SYSTEM: "system",
};

export const createEmptyLearningSummary =
  () => {
    return {
      corrections: [],
      newWords: [],
      grammarStructures: [],

      feedback: {
        overall: "",
        strengths: [],
        improvements: [],
      },

      nextSuggestion: "",
      latestScore: null,
    };
  };

export const createNewConversation = (context) => {
  return {
    id: crypto.randomUUID(),

    context: {
      unitId: context.unitId,
      unitTitle: context.unitTitle,
      topicId: context.topicId,
      topicTitle: context.topicTitle,
      activityType: context.activityType,
      activityName: context.activityName,
      activityDescription: context.activityDescription || "",
    },

    practiceHistoryId: null,

    learningSummary: createEmptyLearningSummary(),

    messages: [],

    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
};

export const createMessage = ({ role, content }) => {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    timestamp: Date.now(),
  };
};

export const addMessageToConversation = (conversation, message) => {
  return {
    ...conversation,
    messages: [...conversation.messages, message],
    updatedAt: Date.now(),
  };
};

export const saveConversation = (conversation) => {
  if (!conversation) return;

  sessionStorage.setItem(
    CHAT_STORAGE_KEY,
    JSON.stringify(conversation)
  );
};

export const getConversation = () => {
  const data = sessionStorage.getItem(CHAT_STORAGE_KEY);

  if (!data) return null;

  try {
    const parsedConversation = JSON.parse(data);

    /*
      Migración para conversaciones creadas antes del refactor.
      Si no tenían practiceHistoryId o learningSummary,
      se agregan automáticamente.
    */
    return {
      ...parsedConversation,

      practiceHistoryId:
        parsedConversation.practiceHistoryId || null,

      learningSummary: {
        corrections:
          parsedConversation.learningSummary?.corrections || [],

        newWords:
          parsedConversation.learningSummary?.newWords || [],

        grammarStructures:
          parsedConversation.learningSummary
            ?.grammarStructures || [],
      },
    };
  } catch (error) {
    console.error("Error reading saved conversation:", error);
    clearConversation();
    return null;
  }
};

export const clearConversation = () => {
  sessionStorage.removeItem(CHAT_STORAGE_KEY);
};