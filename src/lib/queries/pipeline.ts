"use server";
import { v4 } from "uuid";
import { db } from "../db";
import { Lane, Prisma, Tag, Ticket } from "@prisma/client";

export const getPipeLineDetails = async (pipelineId: string) => {
  const response = await db.pipeline.findUnique({
    where: {
      id: pipelineId,
    },
  });

  return response;
};

export const getLanesWithTicketAndTags = async (pipelineId: string) => {
  const response = await db.lane.findMany({
    where: {
      pipelineId,
    },
    orderBy: { order: "asc" },
    include: {
      tickets: {
        orderBy: { order: "asc" },
        include: {
          tags: true,
          assigned: true,
          customer: true,
        },
      },
    },
  });

  return response;
};

export const upsertPipeline = async (pipeline: Prisma.PipelineUncheckedCreateWithoutLanesInput) => {
  const response = await db.pipeline.upsert({
    where: {
      id: pipeline.id || v4(),
    },
    update: pipeline,
    create: pipeline,
  });

  return response;
};

export const deletePipeline = async (pipelineId: string) => {
  const response = await db.pipeline.delete({
    where: {
      id: pipelineId,
    },
  });

  return response;
};

export const updateLanesOrder = async (lanes: Lane[]) => {
  try {
    const updateTrans = lanes.map((lane) =>
      db.lane.update({
        where: { id: lane.id },
        data: {
          order: lane.order,
        },
      })
    );

    await db.$transaction(updateTrans);
  } catch (error) {
    console.log(error, "Error updating lanes order");
  }
};
export const updateTicketsOrder = async (tickets: Ticket[]) => {
  try {
    const updateTrans = tickets.map((ticket) =>
      db.ticket.update({
        where: { id: ticket.id },
        data: {
          order: ticket.order,
          laneId: ticket.laneId,
        },
      })
    );

    await db.$transaction(updateTrans);
  } catch (error) {
    console.log(error, "Error updating ticket order");
  }
};

export const upsertLane = async (lane: Prisma.LaneUncheckedCreateInput) => {
  let order: number;

  if (!lane.order) {
    const lanes = await db.lane.findMany({
      where: {
        pipelineId: lane.pipelineId,
      },
    });

    order = lanes.length;
  } else {
    order = lane.order;
  }

  const response = await db.lane.upsert({
    where: { id: lane.id || v4() },
    update: lane,
    create: { ...lane, order },
  });

  return response;
};

export const deleteLane = async (laneId: string) => {
  const resposne = await db.lane.delete({ where: { id: laneId } });
  return resposne;
};

export const getTicketsWithTags = async (pipelineId: string) => {
  const response = await db.ticket.findMany({
    where: {
      lane: {
        pipelineId,
      },
    },
    include: { tags: true, assigned: true, customer: true },
  });
  return response;
};
export const _getTicketsWithAllRelations = async (laneId: string) => {
  const response = await db.ticket.findMany({
    where: {
      laneId: laneId,
    },
    include: { tags: true, assigned: true, customer: true, lane: true },
  });
  return response;
};

export const searchContacts = async (searchTerms: string) => {
  const response = await db.contact.findMany({
    where: {
      name: {
        contains: searchTerms,
      },
    },
  });
  return response;
};

export const upsertTicket = async (ticket: Prisma.TicketUncheckedCreateInput, tags: Tag[]) => {
  let order: number;
  if (!ticket.order) {
    const tickets = await db.ticket.findMany({
      where: { laneId: ticket.laneId },
    });
    order = tickets.length;
  } else {
    order = ticket.order;
  }

  const response = await db.ticket.upsert({
    where: {
      id: ticket.id || v4(),
    },
    update: { ...ticket, tags: { set: tags } },
    create: { ...ticket, tags: { connect: tags }, order },
    include: {
      assigned: true,
      customer: true,
      tags: true,
      lane: true,
    },
  });

  return response;
};

export const deleteTicket = async (ticketId: string) => {
  const response = await db.ticket.delete({
    where: {
      id: ticketId,
    },
  });

  return response;
};

export const upsertTag = async (subaccountId: string, tag: Tag) => {
  const response = db.tag.upsert({
    where: {
      id: tag.id || v4(),
      subAccountId: subaccountId,
    },
    update: tag,
    create: { ...tag, subAccountId: subaccountId },
  });

  return response;
};

export const deleteTag = async (tagId: string) => {
  const response = await db.tag.delete({ where: { id: tagId } });
  return response;
};

export const getTagsForSubaccount = async (subaccountId: string) => {
  const response = await db.subAccount.findUnique({
    where: {
      id: subaccountId,
    },
    select: {
      tags: true,
    },
  });

  return response;
};
