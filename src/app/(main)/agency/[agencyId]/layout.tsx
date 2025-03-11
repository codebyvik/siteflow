import BlurPage from "@/components/global/Blur-page";
import InfoBar from "@/components/global/infobar";
import Sidebar from "@/components/sidebar";
import Unauthorized from "@/components/unauthorized";
import { verifyAndAcceptInvitation } from "@/lib/queries";
import { getNotificationAndUser } from "@/lib/queries/notification";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  children: React.ReactNode;
  params: { agencyId: string };
};

const layout = async ({ children, params }: Props) => {
  const AgencyId = await verifyAndAcceptInvitation();
  const user = await currentUser();

  const { agencyId } = await params;

  if (!user) {
    return redirect("/");
  }

  if (!AgencyId) return redirect("/agency");

  if (user.privateMetadata.role !== "AGENCY_OWNER" && user.privateMetadata.role !== "AGENCY_ADMIN")
    return <Unauthorized />;

  let allNoti: any = [];
  const notifications = await getNotificationAndUser(AgencyId);

  if (notifications) allNoti = notifications;

  return (
    <div className="h-screen overflow-hidden">
      <Sidebar id={agencyId} type="agency" />

      <div className="md:pl-[300px]">
        <InfoBar notifications={allNoti} role={allNoti?.user?.role} />
        <div className="relative">
          <BlurPage>{children}</BlurPage>
        </div>
      </div>
    </div>
  );
};

export default layout;
