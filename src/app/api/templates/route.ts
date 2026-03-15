import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

// List templates
export async function GET() {
  try {
    const user = await getOrCreateUser();
    const prisma = getPrisma();

    const templates = await prisma.template.findMany({
      where: { userId: user.id },
      orderBy: { usageCount: "desc" },
    });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Templates error:", error);
    return NextResponse.json({ error: "Failed to load templates" }, { status: 500 });
  }
}

// Create template
export async function POST(req: NextRequest) {
  try {
    const user = await getOrCreateUser();
    const prisma = getPrisma();
    const { name, outputTypes, audienceId, toneFormality, icon } = await req.json();

    if (!name || !outputTypes?.length) {
      return NextResponse.json({ error: "Name and output types required" }, { status: 400 });
    }

    const template = await prisma.template.create({
      data: {
        userId: user.id,
        name,
        outputTypes,
        audienceId: audienceId || null,
        toneFormality: toneFormality ?? 0.5,
        icon: icon || "sparkles",
      },
    });

    return NextResponse.json({ template });
  } catch (error) {
    console.error("Template create error:", error);
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 });
  }
}

// Delete template
export async function DELETE(req: NextRequest) {
  try {
    const user = await getOrCreateUser();
    const prisma = getPrisma();
    const { id } = await req.json();

    await prisma.template.deleteMany({
      where: { id, userId: user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Template delete error:", error);
    return NextResponse.json({ error: "Failed to delete template" }, { status: 500 });
  }
}
