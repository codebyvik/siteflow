import BlurPage from "@/components/global/Blur-page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { updateSubAccountConnectedId } from "@/lib/queries/subaccount";
import { stripe } from "@/lib/stripe";
import { getStripeOAuthLink } from "@/lib/utils";
import { CheckCircleIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

type Props = {
  searchParams: {
    state: string;
    code: string;
  };
  params: { subaccountId: string };
};

const Page = async ({ params, searchParams }: Props) => {
  const { state, code } = await searchParams;
  const { subaccountId } = await params;

  const subAccountDetails = await db.subAccount.findUnique({
    where: { id: subaccountId },
  });

  if (!subAccountDetails) return;

  const allDetailsExist =
    subAccountDetails.address &&
    subAccountDetails.subAccountLogo &&
    subAccountDetails.city &&
    subAccountDetails.companyEmail &&
    subAccountDetails.companyPhone &&
    subAccountDetails.country &&
    subAccountDetails.name &&
    subAccountDetails.state &&
    subAccountDetails.zipCode;

  const stripeOAuthLink = getStripeOAuthLink("subaccount", `launchpad___${subAccountDetails.id}`);
  let connectedStripeAccount: boolean = false;
  if (code) {
    if (!subAccountDetails.connectAccountId) {
      try {
        // connect stripe account
        const response = await stripe.oauth.token({
          grant_type: "authorization_code",
          code,
        });

        if (response?.stripe_user_id) {
          await updateSubAccountConnectedId(subaccountId, response?.stripe_user_id);
        }

        connectedStripeAccount = true;
      } catch (error) {
        console.log("Could not connect stripe account", error);
      }
    }
  }

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="w-full h-full max-w-[800px]">
        <Card className="border-none ">
          <CardHeader>
            <CardTitle>Lets get started!</CardTitle>
            <CardDescription>
              Follow the steps below to get your account setup correctly.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex justify-between items-center w-full h-20 border p-4 rounded-lg ">
              <div className="flex items-center gap-4">
                <Image
                  src="/appstore.png"
                  alt="App logo"
                  height={80}
                  width={80}
                  className="rounded-md object-contain"
                />
                <p>Save the website as a shortcut on your mobile devide</p>
              </div>
              <Button>Start</Button>
            </div>
            <div className="flex justify-between items-center w-full h-20 border p-4 rounded-lg">
              <div className="flex items-center gap-4">
                <Image
                  src="/stripelogo.png"
                  alt="App logo"
                  height={80}
                  width={80}
                  className="rounded-md object-contain "
                />
                <p>
                  Connect your stripe account to accept payments. Stripe is used to run payouts.
                </p>
                {subAccountDetails?.connectAccountId || connectedStripeAccount ? (
                  <CheckCircleIcon size={50} className="text-primary p-2 flex-shrink-0" />
                ) : (
                  <Link
                    className="bg-primary py-2 px-4 rounded-md text-white"
                    href={stripeOAuthLink}
                  >
                    Start
                  </Link>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center w-full h-20 border p-4 rounded-lg">
              <div className="flex items-center gap-4">
                <Image
                  src={subAccountDetails.subAccountLogo}
                  alt="App logo"
                  height={80}
                  width={80}
                  className="rounded-md object-contain p-4"
                />
                <p>Fill in all your business details.</p>
              </div>
              {allDetailsExist ? (
                <CheckCircleIcon size={50} className=" text-primary p-2 flex-shrink-0" />
              ) : (
                <Link
                  className="bg-primary py-2 px-4 rounded-md text-white"
                  href={`/subaccount/${subAccountDetails.id}/settings`}
                >
                  Start
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Page;
