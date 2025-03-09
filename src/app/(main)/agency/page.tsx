import AgencyDetails from "@/components/forms/agency-details";
import { getAuthUserDetails, verifyAndAcceptInvitation } from "@/lib/queries";
import { currentUser } from "@clerk/nextjs/server";
import { Plan } from "@prisma/client";
import { redirect } from "next/navigation";
import React from "react";

const Page = async ({
  searchParams,
}: {
  searchParams: { plan: Plan; state: string; code: string };
}) => {
  const agencyId = await verifyAndAcceptInvitation();
  const authUser = await currentUser();
  console.log({ agencyId });

  //   Get User details
  const user = await getAuthUserDetails();

  const isSubAccountUser = user?.role === "SUBACCOUNT_GUEST" || user?.role === "SUBACCOUNT_USER";
  const isAgencyUser = user?.role === "AGENCY_OWNER" || user?.role === "AGENCY_ADMIN";

  if (agencyId) {
    if (isSubAccountUser) {
      redirect("/subaccount");
    } else if (isAgencyUser) {
      if (searchParams.plan) {
        redirect(`/agency/${agencyId}/billing?plan=${searchParams.plan}`);
      }

      if (searchParams.state) {
        const statePath = searchParams.state.split("___")[0];
        const stateAgencyId = searchParams.state.split("___")[1];

        if (!stateAgencyId) return <div>Not authorized.</div>;

        redirect(`/agency/${stateAgencyId}/${statePath}?code=${searchParams.code}`);
      }

      redirect(`/agency/${agencyId}`);
    }
  }

  return (
    <div className="flex justify-center items-center mt-4">
      <div className="max-w[850px] border-[1px] p-4 rounded-xl">
        <h1 className="text-4xl">Create an Agency</h1>
        <AgencyDetails data={{ companyEmail: authUser?.emailAddresses[0].emailAddress }} />
      </div>
    </div>
  );
};

export default Page;
