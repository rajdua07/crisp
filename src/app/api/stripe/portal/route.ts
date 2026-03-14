export async function POST(request: Request) {
  try {
    const { customerId } = await request.json();

    if (!process.env.STRIPE_SECRET_KEY) {
      return Response.json({ error: "Stripe not configured" }, { status: 500 });
    }

    const stripe = new (await import("stripe")).default(process.env.STRIPE_SECRET_KEY);

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${request.headers.get("origin")}/app/settings`,
    });

    return Response.json({ url: session.url });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Portal failed" },
      { status: 500 }
    );
  }
}
