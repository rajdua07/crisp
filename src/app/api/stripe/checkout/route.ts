export async function POST(request: Request) {
  try {
    const { priceId, plan } = await request.json();

    if (!process.env.STRIPE_SECRET_KEY) {
      return Response.json({ error: "Stripe not configured" }, { status: 500 });
    }

    // Dynamic import to avoid issues when Stripe is not installed
    const stripe = new (await import("stripe")).default(process.env.STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${request.headers.get("origin")}/app?upgraded=${plan}`,
      cancel_url: `${request.headers.get("origin")}/app?canceled=true`,
      metadata: { plan },
    });

    return Response.json({ url: session.url });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Checkout failed" },
      { status: 500 }
    );
  }
}
