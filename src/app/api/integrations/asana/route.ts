export async function POST(request: Request) {
  try {
    const { accessToken, projectId, content, title } = await request.json();

    if (!accessToken || !content) {
      return Response.json(
        { error: "accessToken and content are required" },
        { status: 400 }
      );
    }

    // Parse action items into individual tasks
    const lines = content.split("\n").filter((l: string) => l.trim());
    const tasks = lines
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

    // If no bullet items found, create a single task with all content
    if (tasks.length === 0) {
      tasks.push(content);
    }

    const results = [];
    for (const taskName of tasks) {
      const body: Record<string, unknown> = {
        data: {
          name: taskName,
          notes: `Created by Crisp from: ${title || "AI output"}`,
          ...(projectId ? { projects: [projectId] } : {}),
        },
      };

      const res = await fetch("https://app.asana.com/api/1.0/tasks", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        return Response.json(
          { error: data.errors?.[0]?.message || "Asana API error" },
          { status: 502 }
        );
      }

      const data = await res.json();
      results.push({ id: data.data.gid, name: data.data.name });
    }

    return Response.json({
      success: true,
      tasksCreated: results.length,
      tasks: results,
    });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Failed to push to Asana" },
      { status: 500 }
    );
  }
}
