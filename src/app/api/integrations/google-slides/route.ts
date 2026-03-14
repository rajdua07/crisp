export async function POST(request: Request) {
  try {
    const { accessToken, content, title } = await request.json();

    if (!accessToken || !content) {
      return Response.json(
        { error: "accessToken and content are required" },
        { status: 400 }
      );
    }

    // Parse slide deck content into slides
    const slideBlocks = content.split(/SLIDE \d+:/).filter((s: string) => s.trim());

    // 1. Create a new presentation
    const createRes = await fetch(
      "https://slides.googleapis.com/v1/presentations",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title || "Crisp Slide Deck",
        }),
      }
    );

    if (!createRes.ok) {
      const err = await createRes.json();
      return Response.json(
        { error: err.error?.message || "Failed to create presentation" },
        { status: 502 }
      );
    }

    const presentation = await createRes.json();
    const presentationId = presentation.presentationId;

    // 2. Build batch update requests to add slides with content
    const requests: Record<string, unknown>[] = [];

    // Delete the default blank slide
    if (presentation.slides?.length > 0) {
      requests.push({
        deleteObject: { objectId: presentation.slides[0].objectId },
      });
    }

    slideBlocks.forEach((block: string, i: number) => {
      const lines = block.trim().split("\n").filter((l: string) => l.trim());
      if (lines.length === 0) return;

      const slideId = `slide_${i}`;
      const titleId = `title_${i}`;
      const bodyId = `body_${i}`;

      // Extract slide header (first line, may contain [Title Slide] etc.)
      const headerLine = lines[0].replace(/\[.*?\]\s*/, "").trim();
      const bodyLines = lines.slice(1).join("\n").trim();

      // Create slide
      requests.push({
        createSlide: {
          objectId: slideId,
          insertionIndex: i,
          slideLayoutReference: {
            predefinedLayout: i === 0 ? "TITLE" : "TITLE_AND_BODY",
          },
          placeholderIdMappings: [
            {
              layoutPlaceholder: { type: "TITLE", index: 0 },
              objectId: titleId,
            },
            ...(i > 0
              ? [
                  {
                    layoutPlaceholder: { type: "BODY", index: 0 },
                    objectId: bodyId,
                  },
                ]
              : []),
          ],
        },
      });

      // Insert title text
      requests.push({
        insertText: {
          objectId: titleId,
          text: headerLine,
          insertionIndex: 0,
        },
      });

      // Insert body text
      if (bodyLines && i > 0) {
        requests.push({
          insertText: {
            objectId: bodyId,
            text: bodyLines,
            insertionIndex: 0,
          },
        });
      }
    });

    if (requests.length > 0) {
      const batchRes = await fetch(
        `https://slides.googleapis.com/v1/presentations/${presentationId}:batchUpdate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ requests }),
        }
      );

      if (!batchRes.ok) {
        const err = await batchRes.json();
        return Response.json(
          { error: err.error?.message || "Failed to update slides" },
          { status: 502 }
        );
      }
    }

    return Response.json({
      success: true,
      presentationId,
      url: `https://docs.google.com/presentation/d/${presentationId}/edit`,
    });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Failed to create slides" },
      { status: 500 }
    );
  }
}
