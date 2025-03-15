"use server";

import { SubAccount } from "@prisma/client";
import { db } from "../db";
import { v4 as uuidv4 } from "uuid";
import { CreateMediaType } from "../types";

export const upsertSubAccount = async (subAccount: SubAccount) => {
  if (!subAccount.companyEmail) return null;

  const agencyOwner = await db.user.findFirst({
    where: {
      Agency: {
        id: subAccount.agencyId,
      },
      role: "AGENCY_OWNER",
    },
  });

  if (!agencyOwner) {
    throw new Error("🔴Error Could not create subaccount");
  }

  const permissionId = uuidv4();

  const response = await db.subAccount.upsert({
    where: {
      id: subAccount.id,
    },
    update: subAccount,
    create: {
      ...subAccount,
      permissions: {
        create: {
          id: permissionId,
          access: true,
          email: agencyOwner.email,
        },
        connect: {
          subAccountId: subAccount.id,
          id: permissionId,
        },
      },
      pipelines: {
        create: {
          name: "Lead Cycle",
        },
      },
      sidebarOptions: {
        create: [
          {
            name: "Launchpad",
            icon: "clipboardIcon",
            link: `/subaccount/${subAccount.id}/launchpad`,
          },
          {
            name: "Settings",
            icon: "settings",
            link: `/subaccount/${subAccount.id}/settings`,
          },
          {
            name: "Funnels",
            icon: "pipelines",
            link: `/subaccount/${subAccount.id}/funnels`,
          },
          {
            name: "Media",
            icon: "database",
            link: `/subaccount/${subAccount.id}/media`,
          },
          {
            name: "Automations",
            icon: "chip",
            link: `/subaccount/${subAccount.id}/automations`,
          },
          {
            name: "Pipelines",
            icon: "flag",
            link: `/subaccount/${subAccount.id}/pipelines`,
          },
          {
            name: "Contacts",
            icon: "person",
            link: `/subaccount/${subAccount.id}/contacts`,
          },
          {
            name: "Dashboard",
            icon: "category",
            link: `/subaccount/${subAccount.id}`,
          },
        ],
      },
    },
  });

  return response;
};

export const getSubaccountDetails = async (subaccountId: string) => {
  const response = await db.subAccount.findUnique({
    where: {
      id: subaccountId,
    },
  });
  return response;
};

export const deleteSubAccount = async (subaccountId: string) => {
  const response = await db.subAccount.delete({
    where: {
      id: subaccountId,
    },
  });

  return response;
};

export const getMedia = async (subAccountId: string) => {
  const mediaFiles = await db.subAccount.findUnique({
    where: { id: subAccountId },
    include: { media: true },
  });

  return mediaFiles;
};

export const createMedia = async (subaccountId: string, mediaFile: CreateMediaType) => {
  const response = await db.media.create({
    data: {
      link: mediaFile.link,
      name: mediaFile?.name,
      subAccountId: subaccountId,
    },
  });

  return response;
};

export const deleteMedia = async (id: string) => {
  const response = await db.media.delete({
    where: {
      id,
    },
  });

  return response;
};

export const getSubAccountTeamMembers = async (subaccountId: string) => {
  const subaccountUsersWithAccess = await db.user.findMany({
    where: {
      Agency: {
        subAccounts: {
          some: {
            id: subaccountId,
          },
        },
      },
      role: "SUBACCOUNT_USER",
      Permissions: {
        some: {
          subAccountId: subaccountId,
          access: true,
        },
      },
    },
  });

  return subaccountUsersWithAccess;
};
