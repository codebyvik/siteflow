"use client";
import React from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { User } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../../../../../components/ui/alert-dialog";
import { Button } from "../../../../../../components/ui/button";
import { AlertDescription } from "../../../../../../components/ui/alert";
import { useRouter } from "next/navigation";
import { deleteSubAccount, getSubaccountDetails } from "@/lib/queries/subaccount";
import { saveActivityLogsNotification } from "@/lib/queries";

type Props = {
  user: any;
};

const SearchAccount = ({ user }: Props) => {
  const router = useRouter();

  return (
    <Command className="rounded-lg bg-transparent">
      <CommandInput placeholder="Search Account..." />
      <CommandList>
        <CommandEmpty>No results found .</CommandEmpty>
        <CommandGroup heading="Sub Accountd">
          {!!user?.Agency?.subAccounts?.length ? (
            user?.Agency?.subAccounts?.map((subaccount: any) => (
              <CommandItem
                key={subaccount?.id}
                className="h-32 !bg-background my-2 text-primary border-[1px] border-border p-4 rounded-lg hover:!bg-background cursor-pointer transition-all"
              >
                <Link href={`/subaccount/${subaccount?.id}`} className="flex gap-4 w-full h-full">
                  <div className="relative w-32">
                    <Image
                      src={subaccount?.subAccountLogo}
                      alt="sub account logo"
                      // width={}
                      className="rounded-md object-contain bg-muted/50 p-4"
                      fill
                    />
                  </div>
                  <div className="flex flex-col justify-between">
                    <div className="text-black dark:text-white flex flex-col">
                      {subaccount.name}
                      <span className="text-muted-foreground text-xs">{subaccount.address}</span>
                    </div>
                  </div>
                </Link>
                <AlertDialogTrigger asChild>
                  <Button
                    size={"sm"}
                    variant={"destructive"}
                    className=" w-20 hover:bg-red-600 hover:text-white"
                  >
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-left">
                      Are you abolutely sure
                    </AlertDialogTitle>
                    <AlertDescription className="text-left">
                      This action cannot be undone. This will delete the subaccount and all data
                      related to the subaccount
                    </AlertDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex items-center">
                    <AlertDialogCancel className="mb-2">cancel</AlertDialogCancel>
                    <AlertDialogAction className="bg-destructive hover:bg-destructive">
                      <div
                        onClick={async () => {
                          const response = await getSubaccountDetails(subaccount?.id);
                          await saveActivityLogsNotification({
                            agencyId: undefined,
                            description: `Deleted a subaccount | ${response?.name}`,
                            subaccountId: subaccount?.id,
                          });

                          await deleteSubAccount(subaccount?.id);
                        }}
                      >
                        Delete Sub Account
                      </div>
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </CommandItem>
            ))
          ) : (
            <div className="text-muted-foreground text-center p-4">No Sub Accounts</div>
          )}
        </CommandGroup>
      </CommandList>
    </Command>
  );
};

export default SearchAccount;
