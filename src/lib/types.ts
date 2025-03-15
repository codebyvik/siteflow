import {
  Contact,
  Lane,
  Notification,
  Prisma,
  Role,
  SubAccount,
  Tag,
  Ticket,
  User,
} from "@prisma/client";
import { getUserPermissions } from "./queries/user";
import { getAuthUserDetails } from "./queries";
import { db } from "./db";
import { getMedia } from "./queries/subaccount";
import {
  _getTicketsWithAllRelations,
  getPipeLineDetails,
  getTicketsWithTags,
} from "./queries/pipeline";

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

const __getUsersWithAgencySubAccountPermissionsSidebarOptions = async (agencyId: string) => {
  return await db.user.findFirst({
    where: { Agency: { id: agencyId } },
    include: {
      Agency: { include: { subAccounts: true } },
      Permissions: { include: { subAccount: true } },
    },
  });
};

export type UsersWithAgencySubAccountPermissionsSidebarOptions = Prisma.PromiseReturnType<
  typeof __getUsersWithAgencySubAccountPermissionsSidebarOptions
>;

export type GetMediaFiles = Prisma.PromiseReturnType<typeof getMedia>;
export type CreateMediaType = Prisma.MediaCreateWithoutSubAccountInput;

export type TicketAndTags = Ticket & {
  tags: Tag[];
  assigned: User | null;
  customer: Contact | null;
};

export type LaneDetail = Lane & {
  tickets: TicketAndTags[];
};

export type PipelineDetailsWithLanesCardsTagsTickets = Prisma.PromiseReturnType<
  typeof getPipeLineDetails
>;

export type TicketWithTags = Prisma.PromiseReturnType<typeof getTicketsWithTags>;

export type TicketDetails = Prisma.PromiseReturnType<typeof _getTicketsWithAllRelations>;

export type SubAccountWithContacts = SubAccount & {
  contacts: (Contact & { tickets: Ticket[] })[];
};
