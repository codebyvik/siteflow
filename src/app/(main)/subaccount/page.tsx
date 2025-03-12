import Unauthorized from "@/components/unauthorized";
import { getAuthUserDetails, verifyAndAcceptInvitation } from "@/lib/queries";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  searchParams: { state: string; code: string };
};

const Page = async ({ searchParams }: Props) => {
  const { state, code } = await searchParams;
  const agencyId = await verifyAndAcceptInvitation();
  if (!agencyId) return <Unauthorized />;

  const user = await getAuthUserDetails();
  if (!user) return;

  const getFirstSubAccountWithAccess = user.Permissions.find(
    (permission) => permission.access === true
  );

  console.log({ state, getFirstSubAccountWithAccess });

  if (state) {
    const statePath = state.split("___")[0];
    const stateSubAccountId = state.split("___")[1];
    if (!stateSubAccountId) return <Unauthorized />;

    return redirect(`/subaccount/${stateSubAccountId}/${statePath}?code=${code}`);
  }

  if (getFirstSubAccountWithAccess) {
    return redirect(`/subaccount/${getFirstSubAccountWithAccess.subAccountId}`);
  }

  return <Unauthorized />;
};

export default Page;
