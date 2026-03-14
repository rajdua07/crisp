export async function POST(request: Request) {
  try {
    const { apiKey, boardId, content, title } = await request.json();

    if (!apiKey || !boardId || !content) {
      return Response.json(
        { error: "apiKey, boardId, and content are required" },
        { status: 400 }
      );
    }

    // Parse action items into individual items
    const lines = content.split("\n").filter((l: string) => l.trim());
    const items = lines
      .map((line: string) => {
        const trimmed = line.trim();
        if (
          trimmed.startsWith("- ") ||
          trimmed.startsWith("• ") ||
          trimmed.startsWith("- [ ]")
        ) {
          return trimmed.replace(/^[-•]\s*(\[.\]\s*)?/, "");
        }
        return null;
      })
      .filter(Boolean);

    if (items.length === 0) {
      items.push(title || "Crisp Action Item");
    }

    const results = [];
    for (const itemName of items) {
      const query = `mutation {
        create_item (
          board_id: ${boardId},
          item_name: "${(itemName as string).replace(/"/g, '\\"')}"
        ) {
          id
          name
        }
      }`;

      const res = await fetch("https://api.monday.com/v2", {
        method: "POST",
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      if (!res.ok) {
        const text = await res.text();
        return Response.json(
          { error: `Monday.com error: ${text}` },
          { status: 502 }
        );
      }

      const data = await res.json();
      if (data.errors) {
        return Response.json(
          { error: data.errors[0]?.message || "Monday.com API error" },
          { status: 502 }
        );
      }

      results.push(data.data.create_item);
    }

    return Response.json({
      success: true,
      itemsCreated: results.length,
      items: results,
    });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Failed to push to Monday" },
      { status: 500 }
    );
  }
}
