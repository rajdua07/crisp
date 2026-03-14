import { prisma } from "@/lib/prisma";
import { Plan } from "@/generated/prisma/client";

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
        const plan = (session.metadata?.plan || "pro").toUpperCase() as Plan;
        const customerId =
          typeof session.customer === "string" ? session.customer : session.customer?.id;
        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;

        if (customerId) {
          await prisma.user.update({
            where: { stripeCustomerId: customerId },
            data: {
              plan,
              stripeSubscriptionId: subscriptionId || undefined,
            },
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer?.id;

        if (customerId && subscription.status === "active") {
          // Subscription renewed or updated — keep plan active
          await prisma.user.updateMany({
            where: { stripeCustomerId: customerId },
            data: { stripeSubscriptionId: subscription.id },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer?.id;

        if (customerId) {
          // Downgrade to free
          await prisma.user.updateMany({
            where: { stripeCustomerId: customerId },
            data: {
              plan: "FREE",
              stripeSubscriptionId: null,
            },
          });
        }
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
