export async function POST(request: Request) {
  try {
    const { apiKey, pageId, content, title } = await request.json();

    if (!apiKey || !content) {
      return Response.json(
        { error: "apiKey and content are required" },
        { status: 400 }
      );
    }

    // Parse content into Notion blocks
    const lines = content.split("\n").filter((l: string) => l.trim());
    const children = lines.map((line: string) => {
      const trimmed = line.trim();

      // Checkbox items (action items)
      if (trimmed.startsWith("- [ ]") || trimmed.startsWith("- [x]")) {
        const checked = trimmed.startsWith("- [x]");
        const text = trimmed.replace(/^- \[.\]\s*/, "");
        return {
          object: "block",
          type: "to_do",
          to_do: {
            rich_text: [{ type: "text", text: { content: text } }],
            checked,
          },
        };
      }

      // Bullet items
      if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
        return {
          object: "block",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [
              { type: "text", text: { content: trimmed.replace(/^[-•]\s*/, "") } },
            ],
          },
        };
      }

      // Regular paragraph
      return {
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [{ type: "text", text: { content: trimmed } }],
        },
      };
    });

    if (pageId) {
      // Append blocks to existing page
      const res = await fetch(
        `https://api.notion.com/v1/blocks/${pageId}/children`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "Notion-Version": "2022-06-28",
          },
          body: JSON.stringify({ children }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        return Response.json(
          { error: data.message || "Notion API error" },
          { status: 502 }
        );
      }

      return Response.json({ success: true, pageId });
    } else {
      // Create a new page in the user's workspace
      const res = await fetch("https://api.notion.com/v1/pages", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Notion-Version": "2022-06-28",
        },
        body: JSON.stringify({
          parent: { type: "workspace", workspace: true },
          properties: {
            title: {
              title: [{ type: "text", text: { content: title || "Crisp Output" } }],
            },
          },
          children,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        return Response.json(
          { error: data.message || "Notion API error" },
          { status: 502 }
        );
      }

      const data = await res.json();
      return Response.json({ success: true, pageId: data.id, url: data.url });
    }
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Failed to push to Notion" },
      { status: 500 }
    );
  }
}
