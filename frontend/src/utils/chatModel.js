export const CHAT_STORAGE_KEY = "linguai_chat";

export const MESSAGE_ROLES = {
  USER: "user",
  ASSISTANT: "assistant",
  SYSTEM: "system",
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
      activityDescription:
        context.activityDescription || "",
    },

    // NUEVO
    practiceHistoryId: null,

    // NUEVO
    learningSummary: {
      corrections: [],
      newWords: [],
      grammarStructures: [],
    },

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
  sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(conversation));
};

export const getConversation = () => {
  const data = sessionStorage.getItem(CHAT_STORAGE_KEY);
  return data ? JSON.parse(data) : null;
};

export const clearConversation = () => {
  sessionStorage.removeItem(CHAT_STORAGE_KEY);
};