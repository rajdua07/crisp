export async function POST(request: Request) {
  try {
    const { accessToken, content, title } = await request.json();

    if (!accessToken || !content) {
      return Response.json(
        { error: "accessToken and content are required" },
        { status: 400 }
      );
    }

    // 1. Create a new Google Doc
    const createRes = await fetch("https://docs.googleapis.com/v1/documents", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: title || "Crisp One-Pager",
      }),
    });

    if (!createRes.ok) {
      const err = await createRes.json();
      return Response.json(
        { error: err.error?.message || "Failed to create document" },
        { status: 502 }
      );
    }

    const doc = await createRes.json();
    const documentId = doc.documentId;

    // 2. Insert content into the document
    const requests = [
      {
        insertText: {
          location: { index: 1 },
          text: content,
        },
      },
    ];

    const batchRes = await fetch(
      `https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`,
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
        { error: err.error?.message || "Failed to update document" },
        { status: 502 }
      );
    }

    return Response.json({
      success: true,
      documentId,
      url: `https://docs.google.com/document/d/${documentId}/edit`,
    });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Failed to create document" },
      { status: 500 }
    );
  }
}
