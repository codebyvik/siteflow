import React from "react";

import { redirect } from "next/navigation";
import { type Plan, Role } from "@prisma/client";
import { currentUser } from "@clerk/nextjs/server";
import { getAuthUserDetails, verifyAndAcceptInvitation } from "@/lib/queries";
import Unauthorized from "@/components/unauthorized";
import AgencyDetails from "@/components/forms/agency-details";

// import { getAuthUserDetails } from "@/queries/auth";
// import { verifyInvintation } from "@/queries/invintations";

// import { constructMetadata } from "@/lib/utils";

interface AgencyPageProps {
  searchParams: {
    plan: Plan | undefined;
    state: string | undefined;
    code: string | undefined;
  };
}

const AgencyPage: React.FC<AgencyPageProps> = async ({ searchParams }) => {
  const authUser = await currentUser();

  const agencyId = await verifyAndAcceptInvitation();
  const user = await getAuthUserDetails();

  const isSubAccountUser =
    user?.role === Role.SUBACCOUNT_GUEST || user?.role === Role.SUBACCOUNT_USER;
  const isAgencyUser = user?.role === Role.AGENCY_OWNER || user?.role === Role.AGENCY_ADMIN;

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

    return <Unauthorized />;
  }

  return (
    <div className="flex justify-center items-center mt-4">
      <div className="max-w-[850px] flex flex-col gap-8">
        {/* <h1 className="text-4xl">Create An Agency</h1> */}
        <AgencyDetails data={{ companyEmail: authUser!.emailAddresses[0].emailAddress }} />
      </div>
    </div>
  );
};

export default AgencyPage;

// export const metadata = constructMetadata({
//   title: "Agency - Plura",
// });
