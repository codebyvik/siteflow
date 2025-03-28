import AgencyDetails from "@/components/forms/agency-details";
import UserDetails from "@/components/forms/user-details";
import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import React from "react";

type Props = {
  params: { agencyId: string };
};

const Page = async ({ params }: Props) => {
  const authUser = await currentUser();
  const { agencyId } = await params;

  if (!authUser) return null;

  const userDetails = await db.user.findUnique({
    where: {
      email: authUser.emailAddresses[0].emailAddress,
    },
  });

  if (!userDetails) return null;

  const agencyDetails = await db.agency.findUnique({
    where: { id: agencyId },
    include: { subAccounts: true },
  });

  if (!agencyDetails) return null;

  const subAccounts = agencyDetails.subAccounts;

  return (
    <div className="flex lg:!flex-row flex-col gap-4">
      <AgencyDetails data={agencyDetails} />
      <UserDetails type="agency" id={agencyId} subAccounts={subAccounts} userData={userDetails} />
    </div>
  );
};

export default Page;
