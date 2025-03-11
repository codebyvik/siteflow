import { db } from "@/lib/db";
import { getAuthUserDetails } from "@/lib/queries";
import React from "react";
import DataTable from "./data-table";
import { Plus } from "lucide-react";
import { currentUser } from "@clerk/nextjs/server";
import { columns } from "./columns";
import SendInvitation from "@/components/forms/send-invitation";

type Props = {
  params: { agencyId: string };
};

const Page = async ({ params }: Props) => {
  const { agencyId } = await params;
  const authUser = await currentUser();
  const teamMembers = await await db.user.findMany({
    where: {
      Agency: {
        id: agencyId,
      },
    },
    include: {
      Agency: { include: { subAccounts: true } },
      Permissions: { include: { subAccount: true } },
    },
  });

  if (!authUser) return null;

  const agencyDetails = await db.agency.findUnique({
    where: { id: agencyId },
    include: { subAccounts: true },
  });

  if (!agencyDetails) return null;

  return (
    <DataTable
      actionButtonText={
        <>
          <Plus size={15} />
          Add
        </>
      }
      modalChildren={<SendInvitation agencyId={agencyId} />}
      filterValue="name"
      columns={columns}
      data={teamMembers}
    ></DataTable>
  );
};

export default Page;
