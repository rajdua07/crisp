export async function POST(request: Request) {
  try {
    const { webhookUrl, content, channelName } = await request.json();

    if (!webhookUrl || !content) {
      return Response.json(
        { error: "webhookUrl and content are required" },
        { status: 400 }
      );
    }

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: content,
        ...(channelName ? { channel: channelName } : {}),
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return Response.json(
        { error: `Slack error: ${text}` },
        { status: 502 }
      );
    }

    return Response.json({ success: true });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Failed to send to Slack" },
      { status: 500 }
    );
  }
}
