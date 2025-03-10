import { getAuthUserDetails } from "@/lib/queries";
import React from "react";
import MenuOptions from "./menu-options";

type Props = {
  id: string;
  type: "agency" | "subaccount";
};

const Sidebar = async ({ id, type }: Props) => {
  const user = await getAuthUserDetails();

  if (!user) return null;

  if (!user?.Agency) return;

  const details =
    type === "agency"
      ? user?.Agency
      : user?.Agency.subAccounts.find((subaccount) => subaccount.id === id);

  const isWhitelabelledAgency = user?.Agency.whiteLabel;
  if (!details) {
    return;
  }

  let sideBarLogo = user.Agency.agencyLogo || "/assets/plura-logo.svg";

  if (!isWhitelabelledAgency) {
    if (type === "subaccount") {
      sideBarLogo =
        user?.Agency.subAccounts.find((subaccount) => subaccount.id === id)?.subAccountLogo ||
        user.Agency.agencyLogo;
    }
  }

  const sideBarOpt =
    type === "agency"
      ? user?.Agency.sidebarOptions || []
      : user?.Agency.subAccounts.find((subaccount) => subaccount.id === id)?.sidebarOptions || [];

  const subAccounts = user.Agency.subAccounts.filter((subaccount) =>
    user.Permissions.find(
      (permission) => permission.subAccountId === subaccount.id && permission.access
    )
  );

  return (
    <>
      <MenuOptions
        defaultOpen={true}
        details={details}
        id={id}
        sidebarLogo={sideBarLogo}
        sideBarOpt={sideBarOpt}
        user={user}
        subAccounts={subAccounts}
      />
      <MenuOptions
        details={details}
        id={id}
        sidebarLogo={sideBarLogo}
        sideBarOpt={sideBarOpt}
        user={user}
        subAccounts={subAccounts}
      />
    </>
  );
};

export default Sidebar;
