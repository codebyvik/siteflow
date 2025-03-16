"use server";

import Stripe from "stripe";
import { db } from "../db";
import { stripe } from ".";

export const subscriptionCreated = async (
  subscription: Stripe.Subscription,
  customerId: string
) => {
  console.log({ subscription, customerId });

  try {
    const agency = await db.agency.findFirst({
      where: {
        customerId,
      },
      include: {
        subscriptions: true,
      },
    });

    if (!agency) {
      throw new Error("Could not find an agency to upsert the subscription");
    }

    const data = {
      active: subscription.status === "active",
      agencyId: agency.id,
      customerId,
      currentPeriodEndDate: new Date(subscription.current_period_end * 100),
      // @ts-ignore
      priceId: subscription.plan.id,
      subscriptionId: subscription.id,
      // @ts-ignore
      plan: subscription.plan.id,
    };

    const response = await db.subscription.upsert({
      where: {
        agencyId: agency.id,
      },
      update: data,
      // @ts-ignore
      create: data,
    });

    console.log({ response });

    return response;
  } catch (error) {
    console.error(error);
  }
};

export const getConnectAccountProducts = async (stripeAccount: string) => {
  const products = await stripe.products.list(
    {
      limit: 50,
      expand: ["data.default_price"],
    },
    {
      stripeAccount,
    }
  );

  return products.data;
};
