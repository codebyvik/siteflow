import BlurPage from "@/components/global/Blur-page";
import InfoBar from "@/components/global/infobar";
import Sidebar from "@/components/sidebar";
import Unauthorized from "@/components/unauthorized";
import { getAuthUserDetails, verifyAndAcceptInvitation } from "@/lib/queries";
import { getNotificationAndUser } from "@/lib/queries/notification";
import { currentUser } from "@clerk/nextjs/server";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  children: React.ReactNode;
  params: { subaccountId: string };
};

const layout = async ({ children, params }: Props) => {
  const { subaccountId } = await params;
  const agencyId = await verifyAndAcceptInvitation();
  if (!agencyId) return <Unauthorized />;

  const user = await currentUser();
  if (!user) return redirect("/");

  if (!user.privateMetadata.role) return <Unauthorized />;

  const allPermissions = await getAuthUserDetails();
  const hasPermission = allPermissions?.Permissions.find(
    (perm) => perm.access && perm.subAccountId === subaccountId
  );

  if (!hasPermission) return <Unauthorized />;

  let notifications: any = [];
  const allNotification = await getNotificationAndUser(agencyId);

  const userCurrentRole = user.privateMetadata.role as Role;

  if (userCurrentRole === "AGENCY_ADMIN" || userCurrentRole === "AGENCY_OWNER") {
    notifications = allNotification;
  } else {
    const filteredNoti = allNotification?.filter((item) => item.subAccountId === subaccountId);
    if (filteredNoti) notifications = filteredNoti;
  }

  return (
    <div className="h-screen overflow-hidden">
      <Sidebar id={subaccountId} type="subaccount" />
      <div className="md:pl-[300px]">
        <InfoBar notifications={notifications} role={userCurrentRole} subaccountId={subaccountId} />
        <div className="relative">
          <BlurPage>{children}</BlurPage>
        </div>
      </div>
    </div>
  );
};

export default layout;
