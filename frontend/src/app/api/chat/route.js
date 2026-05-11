export async function POST(request) {
  try {
    const body = await request.json();

    const { context, messages, latestMessage } = body;

    if (!context || !latestMessage) {
      return Response.json(
        { error: "Missing conversation context or latest message." },
        { status: 400 }
      );
    }

    const responseText = generateMockTutorResponse({
      context,
      messages,
      latestMessage,
    });

    return Response.json({
      role: "assistant",
      content: responseText,
      receivedContext: context,
    });
  } catch (error) {
    console.error("Chat API error:", error);

    return Response.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

function generateMockTutorResponse({ context, latestMessage }) {
  return `Good job! We are practicing "${context.topicTitle}" in the activity "${context.activityName}". You said: "${latestMessage.content}". Try to continue using simple English.`;
}