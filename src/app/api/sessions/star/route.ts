import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const user = await getOrCreateUser();
    const prisma = getPrisma();
    const { sessionId, starred } = await req.json();

    const updated = await prisma.session.updateMany({
      where: { id: sessionId, userId: user.id },
      data: { starred: !!starred },
    });

    if (updated.count === 0) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Star error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
