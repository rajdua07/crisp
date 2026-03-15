import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

// Create a share link
export async function POST(req: NextRequest) {
  try {
    const user = await getOrCreateUser();
    const prisma = getPrisma();
    const { sessionId, outputSlug, outputName, content } = await req.json();

    if (!sessionId || !outputSlug || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check session belongs to user
    const session = await prisma.session.findFirst({
      where: { id: sessionId, userId: user.id },
    });
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Create or find existing share
    const existing = await prisma.sharedOutput.findFirst({
      where: { userId: user.id, sessionId, outputSlug },
    });

    if (existing) {
      // Update content if changed
      const updated = await prisma.sharedOutput.update({
        where: { id: existing.id },
        data: { content },
      });
      return NextResponse.json({ shareToken: updated.shareToken });
    }

    const shared = await prisma.sharedOutput.create({
      data: {
        userId: user.id,
        sessionId,
        outputSlug,
        outputName,
        content,
      },
    });

    return NextResponse.json({ shareToken: shared.shareToken });
  } catch (error) {
    console.error("Share error:", error);
    return NextResponse.json({ error: "Failed to create share link" }, { status: 500 });
  }
}
