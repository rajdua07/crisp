import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

// Increment usage count when template is applied
export async function POST(req: NextRequest) {
  try {
    const user = await getOrCreateUser();
    const prisma = getPrisma();
    const { id } = await req.json();

    await prisma.template.updateMany({
      where: { id, userId: user.id },
      data: { usageCount: { increment: 1 } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Template use error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
