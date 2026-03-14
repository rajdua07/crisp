import { getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const user = await getOrCreateUser();
    const { sessionOutputId, rating, tweakedContent } = await request.json();

    if (!sessionOutputId || !rating) {
      return Response.json(
        { error: "sessionOutputId and rating are required" },
        { status: 400 }
      );
    }

    if (!["up", "down"].includes(rating)) {
      return Response.json({ error: "rating must be 'up' or 'down'" }, { status: 400 });
    }

    // Upsert feedback (one rating per user per output)
    const feedback = await prisma.outputFeedback.upsert({
      where: {
        userId_sessionOutputId: {
          userId: user.id,
          sessionOutputId,
        },
      },
      update: {
        rating,
        tweakedContent: tweakedContent || null,
      },
      create: {
        userId: user.id,
        sessionOutputId,
        rating,
        tweakedContent: tweakedContent || null,
      },
    });

    return Response.json({ id: feedback.id, rating: feedback.rating });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    return Response.json(
      { error: err instanceof Error ? err.message : "Feedback failed" },
      { status: 500 }
    );
  }
}
