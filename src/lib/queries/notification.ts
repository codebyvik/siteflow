"use server";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Agency, Plan, User } from "@prisma/client";
import { db } from "../db";

export const saveActivityLogsNotification = async ({
  agencyId,
  description,
  subaccountId,
}: {
  agencyId?: string;
  description: string;
  subaccountId?: string;
}) => {
  const authUser = await currentUser();
  let userdata;
  if (!authUser) {
    const response = await db.user.findFirst({
      where: { Agency: { subAccounts: { some: { id: subaccountId } } } },
    });

    if (response) {
      userdata = response;
    }
  } else {
    userdata = await db.user.findUnique({
      where: { email: authUser?.emailAddresses[0]?.emailAddress },
    });
  }

  if (!userdata) {
    console.log("Could not find a user");
    return;
  }
  let foundAgencyId = agencyId;
  if (!foundAgencyId) {
    if (!subaccountId) {
      throw new Error("You need to provide atleast an agency Id or subaccount Id");
    }
    const response = await db.subAccount.findUnique({
      where: { id: subaccountId },
    });

    if (response) {
      foundAgencyId = response.agencyId;
    }
  }

  if (subaccountId) {
    await db.notification.create({
      data: {
        notification: `${userdata.name} | ${description}`,
        user: {
          connect: {
            id: userdata.id,
          },
        },
        agency: {
          connect: {
            id: foundAgencyId,
          },
        },
        subAccount: {
          connect: {
            id: subaccountId,
          },
        },
      },
    });
  } else {
    await db.notification.create({
      data: {
        notification: `${userdata.name} | ${description}`,
        user: {
          connect: {
            id: userdata.id,
          },
        },
        agency: {
          connect: { id: foundAgencyId },
        },
      },
    });
  }
};
