import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

// Public endpoint — no auth required
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const prisma = getPrisma();

    const shared = await prisma.sharedOutput.findUnique({
      where: { shareToken: token },
    });

    if (!shared) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Increment view count
    await prisma.sharedOutput.update({
      where: { id: shared.id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json({
      outputName: shared.outputName,
      content: shared.content,
      createdAt: shared.createdAt.toISOString(),
      viewCount: shared.viewCount + 1,
    });
  } catch (error) {
    console.error("Share fetch error:", error);
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}
