"use client";
import SubAccountDetails from "@/components/forms/subaccount-details";
import CustomModal from "@/components/global/custom-modal";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal";
import { Agency, AgencySidebarOption, SubAccount, User } from "@prisma/client";
import { PlusCircleIcon } from "lucide-react";
import React from "react";
import { twMerge } from "tailwind-merge";

type Props = {
  user: User & {
    Agency:
      | (
          | Agency
          | (null & {
              subAccounts: SubAccount[];
              SideBarOption: AgencySidebarOption[];
            })
        )
      | null;
  };

  id: string;
  className: string;
};

const CreateSubaccountButton = ({ user, id, className }: Props) => {
  const { setOpen } = useModal();

  const agencyDetails = user.Agency;

  if (!agencyDetails) return;

  return (
    <Button
      className={twMerge("w-full gap-4", className)}
      onClick={() => {
        setOpen(
          <CustomModal title="Create a Subaccount" subHeading="Let's create a new Sub Account">
            <SubAccountDetails
              agencyDetails={agencyDetails}
              userId={user?.id}
              userName={user?.name ? user?.name : ""}
            />
          </CustomModal>
        );
      }}
    >
      <PlusCircleIcon size={15} />
      Create Sub Account
    </Button>
  );
};

export default CreateSubaccountButton;
