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
      include: {
        session: {
          select: {
            summary: true,
            thoughtDepth: true,
            inputText: true,
            outputs: {
              select: {
                outputTypeSlug: true,
                outputTypeName: true,
                content: true,
              },
            },
          },
        },
      },
    });

    if (!shared) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Increment view count
    await prisma.sharedOutput.update({
      where: { id: shared.id },
      data: { viewCount: { increment: 1 } },
    });

    // Build sibling outputs (other formats from the same session)
    const siblingOutputs = shared.session.outputs
      .filter((o) => o.outputTypeSlug !== shared.outputSlug)
      .map((o) => ({
        name: o.outputTypeName,
        slug: o.outputTypeSlug,
        // Show a truncated preview, not the full content (tease value)
        preview: o.content.substring(0, 140) + (o.content.length > 140 ? "..." : ""),
      }));

    // Truncate the input text for context
    const inputPreview = shared.session.inputText
      ? shared.session.inputText.substring(0, 200) +
        (shared.session.inputText.length > 200 ? "..." : "")
      : null;

    return NextResponse.json({
      outputName: shared.outputName,
      outputSlug: shared.outputSlug,
      content: shared.content,
      createdAt: shared.createdAt.toISOString(),
      viewCount: shared.viewCount + 1,
      // New fields for viral share page
      sessionSummary: shared.session.summary,
      thoughtDepth: shared.session.thoughtDepth,
      inputPreview,
      siblingOutputs,
      totalOutputs: shared.session.outputs.length,
    });
  } catch (error) {
    console.error("Share fetch error:", error);
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}
