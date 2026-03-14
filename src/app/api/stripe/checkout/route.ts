import { getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const user = await getOrCreateUser();

    const { priceId, plan } = await request.json();

    if (!process.env.STRIPE_SECRET_KEY) {
      return Response.json({ error: "Stripe not configured" }, { status: 500 });
    }

    const stripe = new (await import("stripe")).default(process.env.STRIPE_SECRET_KEY);

    // Get or create Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id, clerkId: user.clerkId },
      });
      customerId = customer.id;
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${request.headers.get("origin")}/app?upgraded=${plan}`,
      cancel_url: `${request.headers.get("origin")}/app?canceled=true`,
      metadata: { plan, userId: user.id },
    });

    return Response.json({ url: session.url });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    return Response.json(
      { error: err instanceof Error ? err.message : "Checkout failed" },
      { status: 500 }
    );
  }
}
