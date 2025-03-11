"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { db } from "../db";
import { Role, User } from "@prisma/client";

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

export const deleteUser = async (userId: string) => {
  const clerk = await clerkClient();
  await clerk.users.updateUserMetadata(userId, {
    privateMetadata: {
      role: undefined,
    },
  });
  const deletedUser = await db.user.delete({ where: { id: userId } });

  return deletedUser;
};

export const getUser = async (id: string) => {
  const user = await db.user.findUnique({
    where: {
      id,
    },
  });

  return user;
};

export const sendInvitation = async (role: Role, email: string, agencyId: string) => {
  const response = await db.invitation.create({
    data: { email, agencyId, role },
  });

  try {
    if (!email || !email.includes("@")) {
      throw new Error("Invalid email address provided");
    }

    console.log("Redirect URL:", process.env.NEXT_PUBLIC_URL);

    const clerk = await clerkClient();
    await clerk.invitations.createInvitation({
      emailAddress: email,
      redirectUrl: process.env.NEXT_PUBLIC_URL,
      publicMetadata: {
        throughInvitation: true,
        role,
      },
    });

    // const clerk = await clerkClient();
    // await clerk.invitations.createInvitation({
    //   emailAddress: email,
    //   redirectUrl: process.env.NEXT_PUBLIC_URL,
    //   publicMetadata: {
    //     throughInvitation: true,
    //     role,
    //   },
    // });
  } catch (error) {
    console.log(error);
    throw error;
  }

  return response;
};
