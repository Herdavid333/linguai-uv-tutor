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
      context: {
        unit,
        topic,
        activity,
        difficulty,

        unitTitle: unit?.title || "",
        topicTitle: topic?.title || "",
        activityName: activity?.name || "",
        activityType: activity?.type || "conversation",
        activityInstructions:
          activity?.instructions || "",
      },

      messages: recentMessages,

      latestMessage: userMessage,
    });

    return Response.json(aiResponse);
  } catch (error) {
    console.error("========== API CHAT ERROR ==========");
    console.error(error);

    return Response.json(
      {
        error: "Gemini request failed.",
        details: error?.message || "Unknown Gemini error.",
        status: error?.status || null,
        code: error?.code || null,
      },
      {
        status:
          typeof error?.status === "number"
            ? error.status
            : 500,
      }
    );
  }
}