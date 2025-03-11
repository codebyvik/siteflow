import { AlertDialog } from "@/components/ui/alert-dialog";
import { getAuthUserDetails } from "@/lib/queries";
import React from "react";
import SearchAccount from "./_components/searchAccount";
import CreateSubaccountButton from "./_components/create-subaccount-button";

type Props = {
  params: { agencyId: string };
};

const Page: React.FC<Props> = async ({ params }) => {
  const user = await getAuthUserDetails();
  const { agencyId } = await params;
  if (!user) return <></>;

  // const user = await getAuthUserDetails();

  // if (!user) return null;

  return (
    <AlertDialog>
      <div className="flex flex-col">
        <CreateSubaccountButton user={user} className="w-[200px] self-end m-6" id={agencyId} />
        <SearchAccount user={user} />
      </div>
    </AlertDialog>
  );
};

export default Page;
