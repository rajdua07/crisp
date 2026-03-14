export async function POST(request: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      return Response.json({ error: "Stripe not configured" }, { status: 500 });
    }

    const stripe = new (await import("stripe")).default(process.env.STRIPE_SECRET_KEY);
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return Response.json({ error: "No signature" }, { status: 400 });
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        // In production: update user's plan in DB based on session.metadata.plan
        console.log("Checkout completed:", session.metadata?.plan);
        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        console.log("Subscription updated:", subscription.status);
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        console.log("Subscription canceled:", subscription.id);
        // In production: downgrade user to free plan
        break;
      }
    }

    return Response.json({ received: true });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Webhook failed" },
      { status: 500 }
    );
  }
}
