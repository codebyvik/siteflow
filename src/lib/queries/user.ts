"use server";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { db } from "../db";
import { User } from "@prisma/client";

export const initUser = async (newUser: Partial<User>) => {
  const user = await currentUser();

  if (!user) return;

  const userData = await db.user.upsert({
    where: { email: user.emailAddresses[0].emailAddress },
    update: newUser,
    create: {
      id: user.id,
      avatarUrl: user.imageUrl,
      email: user.emailAddresses[0].emailAddress,
      name: `${user.firstName} ${user?.lastName}`,
      role: newUser.role || "SUBACCOUNT_USER",
    },
  });

  const clerk = await clerkClient();

  await clerk.users.updateUserMetadata(user?.id, {
    privateMetadata: {
      role: newUser.role || "SUBACCOUNT_USER",
    },
  });

  return userData;
};
