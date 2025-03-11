"use client";
import { Agency, AgencySidebarOption, SubAccount, SubAccountSidebarOption } from "@prisma/client";
import React, { useEffect, useMemo, useState } from "react";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { ChevronsUpDown, Compass, Menu, PlusCircleIcon } from "lucide-react";
import clsx from "clsx";
import { AspectRatio } from "../ui/aspect-ratio";
import Image from "next/image";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import Link from "next/link";
import { useModal } from "@/hooks/use-modal";
import CustomModal from "../global/custom-modal";
import SubAccountDetails from "../forms/subaccount-details";
import { Separator } from "../ui/separator";
import { icons } from "../icons";

type Props = {
  defaultOpen?: boolean;
  subAccounts: SubAccount[];
  sideBarOpt: AgencySidebarOption[] | SubAccountSidebarOption[];
  sidebarLogo: string;
  details: any;
  user: any;
  id: string;
};

const MenuOptions = ({
  defaultOpen,
  subAccounts,
  sideBarOpt,
  sidebarLogo,
  details,
  user,
  id,
}: Props) => {
  const [isMounted, setIsMounted] = useState(false);
  const { setOpen } = useModal();
  const openState = useMemo(() => (defaultOpen ? { open: true } : {}), [defaultOpen]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return;
  }

  return (
    <Sheet modal={false} {...openState}>
      <SheetTrigger asChild className="absolute left-4 top-4 z-[100] md:!hidden flex">
        <Button variant={"outline"} size={"icon"}>
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent
        showX={!defaultOpen}
        side={"left"}
        className={clsx("bg-background/80 backdrop-blur-xl fixed top-0 border-r-[1px] p-6", {
          "hidden md:inline-block z-0 w-[300px]": defaultOpen,
          "inline-block md:hidden z-[100] w-full": !defaultOpen,
        })}
      >
        <div>
          <AspectRatio ratio={16 / 5}>
            <Image
              src={sidebarLogo}
              alt="side-bar logo"
              fill
              className="rounded-md object-contain"
            />
          </AspectRatio>
          <Popover>
            <PopoverTrigger asChild>
              <div
                className="h-10 sm:h-9 lg:h-11 gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 w-full my-4 flex items-center justify-between py-8 hover:bg-accent hover:text-accent-foreground cursor-pointer"
                // variant={"ghost"}
              >
                <div className="flex flex-2 w-[90%] items-center text-left gap-2">
                  <Compass />
                  <div className="flex flex-col w-[90%] overflow-x-hidden  text-ellipsis">
                    {details.name}{" "}
                    <span className="text-muted-foreground overflow-x-hidden text-ellipsis">
                      {details.address}
                    </span>{" "}
                  </div>
                </div>
                <div className="flex-1">
                  <ChevronsUpDown size={16} className="text-muted-foreground" />
                </div>
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-80 h-80 mt-4 z-[200]">
              <Command className="rounded-lg">
                <CommandInput placeholder="Search Accounts..." />
                <CommandList className="pb-16 ">
                  <CommandEmpty>No results found</CommandEmpty>
                  {(user?.role === "AGENCY_OWNER" || user?.role === "AGENCY_ADMIN") &&
                    user?.Agency && (
                      <CommandGroup heading="Agency">
                        <CommandItem
                          className="!bg-transparent my-2 text-primary border-[1px] border-border p-2 
                        hover:!bg-muted cursor-pointer transition-all
                        "
                        >
                          {defaultOpen ? (
                            <Link
                              href={`/agency/${user?.Agency?.id}`}
                              className="flex gap-4 w-full h-full"
                            >
                              <div className="relative w-16">
                                <Image
                                  src={user?.Agency?.agencyLogo}
                                  alt="agency-logo"
                                  fill
                                  className="rounded-md object-contain"
                                />
                              </div>
                              <div className="flex flex-col flex-1 text-black dark:text-white">
                                {user?.Agency?.name}
                                <span className="text-muted-foreground">
                                  {user?.Agency?.address}
                                </span>
                              </div>
                            </Link>
                          ) : (
                            <SheetClose asChild>
                              <Link
                                href={`/agency/${user?.Agency?.id}`}
                                className="flex gap-4 w-full h-full"
                              >
                                <div className="relative w-16">
                                  <Image
                                    src={user?.Agency?.agencyLogo}
                                    alt="agency-logo"
                                    fill
                                    className="rounded-md object-contain"
                                  />
                                </div>
                                <div className="flex flex-col flex-1">
                                  {user?.Agency?.name}
                                  <span className="text-muted-foreground">
                                    {user?.Agency?.address}
                                  </span>
                                </div>
                              </Link>
                            </SheetClose>
                          )}
                        </CommandItem>
                      </CommandGroup>
                    )}
                  <CommandGroup heading="Accounts">
                    {!!subAccounts
                      ? subAccounts?.map((subAccount) => (
                          <CommandItem key={subAccount.id}>
                            {defaultOpen ? (
                              <Link
                                href={`/subaccount/${user?.Agency?.id}`}
                                className="flex gap-4 w-full h-full"
                              >
                                <div className="relative w-16">
                                  <Image
                                    src={subAccount?.subAccountLogo}
                                    alt="subaccount-logo"
                                    fill
                                    className="rounded-md object-contain"
                                  />
                                </div>
                                <div className="flex flex-col flex-1">
                                  {subAccount?.name}
                                  <span className="text-muted-foreground">
                                    {subAccount?.address}
                                  </span>
                                </div>
                              </Link>
                            ) : (
                              <SheetClose asChild>
                                <Link
                                  href={`/subaccount/${subAccount?.id}`}
                                  className="flex gap-4 w-full h-full"
                                >
                                  <div className="relative w-16">
                                    <Image
                                      src={subAccount?.subAccountLogo}
                                      alt="agency-logo"
                                      fill
                                      className="rounded-md object-contain"
                                    />
                                  </div>
                                  <div className="flex flex-col flex-1">
                                    {subAccount?.name}
                                    <span className="text-muted-foreground">
                                      {subAccount?.address}
                                    </span>
                                  </div>
                                </Link>
                              </SheetClose>
                            )}
                          </CommandItem>
                        ))
                      : "No Accounts"}
                  </CommandGroup>
                </CommandList>
                {(user?.role === "AGENCY_OWNER" || user?.role === "AGENCY_ADMIN") && (
                  <SheetClose>
                    <Button
                      className="w-full flex gap-2"
                      onClick={() =>
                        setOpen(
                          <CustomModal
                            title="Create a SubAccount"
                            subHeading="You can switch between your agency and subaccounts from the sidebar"
                          >
                            <SubAccountDetails
                              agencyDetails={user?.Agency as Agency}
                              userId={user?.id as string}
                              userName={user?.name}
                            />
                          </CustomModal>
                        )
                      }
                    >
                      <PlusCircleIcon size={15} />
                      Create Sub Account
                    </Button>
                  </SheetClose>
                )}
              </Command>
            </PopoverContent>
          </Popover>
          <p className="text-muted-foreground text-xs mb-2">MENU LINKS</p>
          <Separator className="mb-4" />
          <nav className="relative">
            <Command className="rounded-lg overflow-visible bg-transparent">
              <CommandInput placeholder="Search..." />
              <CommandList className="pb-16 overflow-visible py-4">
                <CommandEmpty>No results found</CommandEmpty>
                <CommandGroup className="overflow-visible">
                  {sideBarOpt.map((sideBarOption) => {
                    let val;
                    const result = icons.find((icon) => icon.value === sideBarOption.icon);
                    if (result) {
                      val = <result.path />;
                    }

                    return (
                      <CommandItem key={sideBarOption.id} className="md:w-[320px] w-full">
                        <Link
                          href={sideBarOption.link}
                          className="flex items-center gap-2 hover:bg-transparent rounded-md transition-all
                          md:w-full w-[320px]
                          "
                        >
                          {val}
                          <span>{sideBarOption.name}</span>
                        </Link>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </nav>
        </div>
      </SheetContent>
      MenuOptions
    </Sheet>
  );
};

export default MenuOptions;
