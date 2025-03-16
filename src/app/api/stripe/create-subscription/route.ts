import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { customerId, priceId } = await req.json();

  if (!customerId || !priceId)
    return new NextResponse("Customer Id or Price Id is missing", {
      status: 400,
    });

  const subscriptionExists = await db.agency.findFirst({
    where: { customerId },
    include: { subscriptions: true },
  });

  try {
    if (
      subscriptionExists?.subscriptions?.subscriptionId &&
      subscriptionExists.subscriptions.active
    ) {
      // Update the subscription
      if (!subscriptionExists.subscriptions.subscriptionId) {
        throw new Error("Could not find the subscription Id to update the subscription");
      }

      const currentSubscriptionDetails = await stripe.subscriptions.retrieve(
        subscriptionExists.subscriptions.subscriptionId
      );

      const subscription = await stripe.subscriptions.update(
        subscriptionExists.subscriptions.subscriptionId,
        {
          items: [
            {
              id: currentSubscriptionDetails.items.data[0].id,
              deleted: true,
            },
            { price: priceId },
          ],
          expand: ["latest_invoice.payment_intent"],
        }
      );

      return NextResponse.json({
        subscriptionId: subscription.id,
        // @ts-ignore
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      });
    } else {
      console.log("Creating a subscription");

      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [
          {
            price: priceId,
          },
        ],
        payment_behavior: "default_incomplete",
        payment_settings: { save_default_payment_method: "on_subscription" },
        expand: ["latest_invoice.payment_intent"],
      });

      return NextResponse.json({
        subscriptionId: subscription.id,
        // @ts-ignore
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      });
    }
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal server error", {
      status: 500,
    });
  }
}
