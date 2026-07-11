import { generateTutorResponse } from "../../../lib/AI/tutorService";

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      unit,
      topic,
      activity,
      difficulty,
      recentMessages = [],
      userMessage,
    } = body;

    console.log("BODY /api/chat:", body);

    if (!unit || !topic || !activity || !userMessage) {
      return Response.json(
        { error: "Missing unit, topic, activity, or user message." },
        { status: 400 }
      );
    }

    const aiResponse = await generateTutorResponse({
      unit,
      topic,
      activity,
      difficulty,
      recentMessages,
      userMessage,
    });

    return Response.json(aiResponse);
  } catch (error) {
    console.error("Chat API error:", error);

    return Response.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}