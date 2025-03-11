import { Notification, Prisma, Role } from "@prisma/client";
import { getUserPermissions } from "./queries/user";
import { getAuthUserDetails } from "./queries";

export type NotificationWithUser =
  | (Notification & {
      User: {
        id: string;
        name: string;
        avatarUrl: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        role: Role;
        agencyId: string | null;
      };
    })
  | undefined;

export type UserWithPermissionsAndSubAccounts = Prisma.PromiseReturnType<typeof getUserPermissions>;

export type AuthUserWithAgencySigebarOptionsSubAccounts = Prisma.PromiseReturnType<
  typeof getAuthUserDetails
>;
