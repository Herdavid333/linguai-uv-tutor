import { buildTutorSystemPrompt } from "../prompts/tutorPrompt";
import { buildContext } from "./buildContext";

export function buildChatMessages({
  unit,
  topic,
  activity,
  difficulty,
  recentMessages = [],
  userMessage,
}) {
  const systemPrompt = buildTutorSystemPrompt();

  const contextMessage = buildContext({
    unit,
    topic,
    activity,
    difficulty,
    userMessage,
  });

  const formattedRecentMessages = recentMessages.map((message) => ({
    role: message.role,
    content: message.content,
  }));

  return [
    {
      role: "system",
      content: systemPrompt,
    },
    ...formattedRecentMessages,
    {
      role: "user",
      content: contextMessage,
    },
  ];
}