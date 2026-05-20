export const buildChatPayload = (conversation, latestMessage) => {
  return {
    conversationId: conversation.id,
    context: conversation.context,
    messages: conversation.messages.slice(-10),
    latestMessage,
  };
};