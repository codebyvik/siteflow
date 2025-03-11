"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { db } from "../db";
import { User } from "@prisma/client";

export const getUserPermissions = async (userId: string) => {
  const response = await db.user.findUnique({
    where: {
      id: userId,
    },
    select: { Permissions: { include: { subAccount: true } } },
  });
  return response;
};

export const updateUser = async (user: Partial<User>) => {
  const updatedUser = await db.user.update({
    where: {
      email: user.email,
    },
    data: { ...user },
  });

  const clerk = await clerkClient();

  await clerk.users.updateUserMetadata(updatedUser.id, {
    privateMetadata: {
      role: user.role || "SUBACCOUNT_USER",
    },
  });

  return updatedUser;
};

export const changeUserPermission = async (
  permissionId: string | undefined,
  userEmail: string,
  subAccountId: string,
  permission: boolean
) => {
  try {
    const response = await db.permissions.upsert({
      where: { id: permissionId },
      update: { access: permission },
      create: {
        access: permission,
        email: userEmail,
        subAccountId: subAccountId,
      },
    });

    return response;
  } catch (error) {
    console.log("🔴 Could not change permission", error);
    return null;
  }
};
