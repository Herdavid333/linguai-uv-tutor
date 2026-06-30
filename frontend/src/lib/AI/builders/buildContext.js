export function buildContext({
  unit,
  topic,
  activity,
  difficulty = "Beginner",
  userMessage,
}) {
  return `
Current learning context:

Unit:
${unit?.title || "Not specified"}

Topic:
${topic?.title || "Not specified"}

Activity:
${activity?.name || "Not specified"}

Activity type:
${activity?.type || "Not specified"}

Difficulty:
${difficulty}

Current student message:
${userMessage}
`;
}