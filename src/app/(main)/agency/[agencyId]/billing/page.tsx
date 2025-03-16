import { Separator } from "@/components/ui/separator";
import { addOnProducts, pricingCards } from "@/lib/constants";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import React from "react";
import PricingCard from "./_components/pricing-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import clsx from "clsx";

type Props = {
  params: { agencyId: string };
};

const Page = async ({ params }: Props) => {
  const { agencyId } = await params;

  const addOns = await stripe.products.list({
    ids: addOnProducts.map((product) => product.id),
    expand: ["data.default_price"],
  });

  const agencySubscription = await db.agency.findUnique({
    where: {
      id: agencyId,
    },
    select: {
      customerId: true,
      subscriptions: true,
    },
  });

  const prices = await stripe.prices.list({
    product: process.env.NEXT_SITEFLOW_PRODUCT_ID,
    active: true,
  });

  const currentPlanDetails = pricingCards.find(
    (c) => c.priceId === agencySubscription?.subscriptions?.priceId
  );

  const charges = await stripe.charges.list({
    limit: 50,
    customer: agencySubscription?.customerId,
  });

  console.log({ prices, currentPlanDetails, agencySubscription });

  const allCharges = [
    ...charges.data.map((charge) => ({
      description: charge.description,
      id: charge.id,
      date: `${new Date(charge.created * 1000).toLocaleTimeString()} ${new Date(
        charge.created * 1000
      ).toLocaleDateString()}`,
      status: "Paid",
      amount: `$${charge.amount / 100}`,
    })),
  ];

  return (
    <>
      <h1 className="text-4xl p-4">Billing</h1>
      <Separator className=" mb-6" />
      <h2 className="text-2xl p-4">Current Plan</h2>
      <div className="flex flex-col lg:!flex-row justify-between gap-8">
        <PricingCard
          planExists={agencySubscription?.subscriptions?.active === true}
          prices={prices.data.filter(
            (item) => item.product === process.env.NEXT_SITEFLOW_PRODUCT_ID
          )}
          customerId={agencySubscription?.customerId || ""}
          amt={
            agencySubscription?.subscriptions?.active === true
              ? currentPlanDetails?.price || "$0"
              : "$0"
          }
          buttonCta={
            agencySubscription?.subscriptions?.active === true ? "Change Plan" : "Get Started"
          }
          highlightDescription="Want to modify your plan? You can do this here. If you have
          further question contact support"
          highlightTitle="Plan Options"
          description={
            agencySubscription?.subscriptions?.active === true
              ? currentPlanDetails?.description || "Lets get started"
              : "Lets get started! Pick a plan that works best for you."
          }
          duration="/ month"
          features={
            agencySubscription?.subscriptions?.active === true
              ? currentPlanDetails?.features || []
              : currentPlanDetails?.features ||
                pricingCards.find((pricing) => pricing.title === "Starter")?.features ||
                []
          }
          title={
            agencySubscription?.subscriptions?.active === true
              ? currentPlanDetails?.title || "Starter"
              : "Starter"
          }
        />

        {addOns.data.map((addOn) => (
          <PricingCard
            planExists={agencySubscription?.subscriptions?.active === true}
            customerId={agencySubscription?.customerId || ""}
            key={addOn.id}
            prices={prices.data.filter(
              (item) => item.product !== process.env.NEXT_SITEFLOW_PRODUCT_ID
            )}
            amt={
              //@ts-ignore
              addOn.default_price?.unit_amount
                ? //@ts-ignore
                  `$${addOn.default_price.unit_amount / 100}`
                : "$0"
            }
            buttonCta="Subscribe"
            description="Dedicated support line & teams channel for support"
            duration="/ month"
            features={[]}
            title="24/7 priority support"
            highlightTitle="Get support now!"
            highlightDescription="Get priority support and skip the long long with the click of a button."
          />
        ))}
      </div>
      <h2 className="text-2xl p-4">Payment History</h2>

      <Table className="bg-card border-[1px] border-border rounded-md">
        <TableHeader className="rounded-md">
          <TableRow>
            <TableHead className="w-[200px]">Description</TableHead>
            <TableHead className="w-[200px]">Invoice Id</TableHead>
            <TableHead className="w-[300px]">Date</TableHead>
            <TableHead className="w-[200px]">Paid</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="font-medium truncate">
          {allCharges.map((charge) => (
            <TableRow key={charge.id}>
              <TableCell>{charge.description}</TableCell>
              <TableCell className="text-muted-foreground">{charge.id}</TableCell>
              <TableCell>{charge.date}</TableCell>
              <TableCell>
                <p
                  className={clsx("", {
                    "text-emerald-500": charge.status.toLowerCase() === "paid",
                    "text-orange-600": charge.status.toLowerCase() === "pending",
                    "text-red-600": charge.status.toLowerCase() === "failed",
                  })}
                >
                  {charge.status.toUpperCase()}
                </p>
              </TableCell>
              <TableCell className="text-right">{charge.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};

export default Page;
