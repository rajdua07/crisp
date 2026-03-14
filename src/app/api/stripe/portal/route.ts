import { getOrCreateUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await getOrCreateUser();

    if (!process.env.STRIPE_SECRET_KEY) {
      return Response.json({ error: "Stripe not configured" }, { status: 500 });
    }

    if (!user.stripeCustomerId) {
      return Response.json({ error: "No billing account found" }, { status: 400 });
    }

    const stripe = new (await import("stripe")).default(process.env.STRIPE_SECRET_KEY);

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${request.headers.get("origin")}/app/settings`,
    });

    return Response.json({ url: session.url });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    return Response.json(
      { error: err instanceof Error ? err.message : "Portal failed" },
      { status: 500 }
    );
  }
}
