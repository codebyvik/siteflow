"use client";
import { useModal } from "@/hooks/use-modal";
import { Plan } from "@prisma/client";
import { StripeElementsOptions } from "@stripe/stripe-js";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { pricingCards } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Elements } from "@stripe/react-stripe-js";
import SubscriptionForm from ".";
import { getStripe } from "@/lib/stripe/stripe-client";
import { Loader2 } from "lucide-react";

type Props = {
  customerId: string;
  planExists: boolean;
};

const SubscriptionFormWrapper = ({ customerId, planExists }: Props) => {
  const { data, setClose } = useModal();
  const router = useRouter();
  const [selectedPriceId, setSelectedPriceId] = useState<Plan | "">(
    data?.plans?.defaultPriceId || ""
  );
  const [subscription, setSubscription] = useState<{
    subscriptionId: string;
    clientSecret: string;
  }>({ subscriptionId: "", clientSecret: "" });

  const options: StripeElementsOptions = useMemo(
    () => ({
      clientSecret: subscription?.clientSecret,
      appearance: {
        theme: "night",
      },
    }),
    [subscription]
  );

  useEffect(() => {
    if (!selectedPriceId) return;
    const createSecret = async () => {
      const subscriptionResponse = await fetch("/api/stripe/create-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId,
          priceId: selectedPriceId,
        }),
      });
      const subscriptionResponseData = await subscriptionResponse.json();
      setSubscription({
        clientSecret: subscriptionResponseData.clientSecret,
        subscriptionId: subscriptionResponseData.subscriptionId,
      });
      if (planExists) {
        toast.success("Success", {
          description: "Your plan has been successfully upgraded!",
        });
        setClose();
        router.refresh();
      }
    };
    createSecret();
  }, [data, selectedPriceId, customerId]);

  return (
    <div className="border-none transition-all">
      <div className="flex flex-col gap-4">
        {data.plans?.plans.map((price) => (
          <Card
            onClick={() => setSelectedPriceId(price.id as Plan)}
            key={price.id}
            className={cn("relative cursor-pointer transition-all", {
              "border-primary": selectedPriceId === price.id,
            })}
          >
            <CardHeader>
              <CardTitle>
                ${price.unit_amount ? price.unit_amount / 100 : "0"}
                <p className="text-sm text-muted-foreground">{price.nickname}</p>
                <p className="text-sm text-muted-foreground">
                  {pricingCards.find((p) => p.priceId === price.id)?.description}
                </p>
              </CardTitle>
            </CardHeader>
            {selectedPriceId === price.id && (
              <div className="w-2 h-2 bg-emerald-500 rounded-full absolute top-4 right-4" />
            )}
          </Card>
        ))}

        {options.clientSecret && !planExists && (
          <>
            <h1 className="text-xl">Payment Method</h1>
            <Elements stripe={getStripe()} options={options}>
              <SubscriptionForm selectedPriceId={selectedPriceId} />
            </Elements>
          </>
        )}

        {!options.clientSecret && selectedPriceId && (
          <div className="flex items-center justify-center w-full h-40">
            <Loader2 className="animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionFormWrapper;
