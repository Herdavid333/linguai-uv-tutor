import { generatePedagogicalResponse } from "../../../utils/pedagogicalResponse";

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

    const responseText = generatePedagogicalResponse({
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