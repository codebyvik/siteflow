"use client";
import LaneForm from "@/components/forms/lane-form";
import CustomModal from "@/components/global/custom-modal";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal";
import { LaneDetail, PipelineDetailsWithLanesCardsTagsTickets, TicketAndTags } from "@/lib/types";
import { Lane, Ticket } from "@prisma/client";
import { Flag, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import PipelineLane from "./Pipeline-lane";
type Props = {
  lanes: LaneDetail[];
  pipelineId: string;
  subaccountId: string;
  pipelineDetails: PipelineDetailsWithLanesCardsTagsTickets;
  updateLanesOrder: (lanes: Lane[]) => Promise<void>;
  updateTicketsOrder: (tickets: Ticket[]) => Promise<void>;
};

const PipelineView = ({
  lanes,
  pipelineDetails,
  pipelineId,
  subaccountId,
  updateLanesOrder,
  updateTicketsOrder,
}: Props) => {
  const { setOpen } = useModal();
  const router = useRouter();

  const [allLanes, setAllLanes] = useState<LaneDetail[]>([]);

  useEffect(() => {
    setAllLanes(lanes);
  }, [lanes]);

  const ticketsFromAllLanes: TicketAndTags[] = [];
  lanes.forEach((item) => {
    item.tickets.forEach((i) => {
      ticketsFromAllLanes.push(i);
    });
  });

  const [allTickets, setAllTickets] = useState(ticketsFromAllLanes);

  const handleAddlane = () => {
    setOpen(
      <CustomModal title="Create A Lane" subHeading="Lane allows you to group tickets">
        <LaneForm pipelineId={pipelineId} />
      </CustomModal>
    );
  };

  const onDragEnd = async (dropResult: DropResult) => {
    const { destination, source, type } = dropResult;

    //Same position

    if (
      !destination ||
      (destination.droppableId === source.droppableId && destination.index === source.index)
    ) {
      return;
    }

    switch (type) {
      //
      //DRAGGING LANES
      //
      case "lane": {
        //create new local state
        const newLanes = [...allLanes]
          .toSpliced(source.index, 1)
          .toSpliced(destination.index, 0, allLanes[source.index])
          .map((lane, idx) => {
            return { ...lane, order: idx };
          });

        setAllLanes(newLanes);
        updateLanesOrder(newLanes);
      }

      //
      //DRAGGING TICKETS
      //
      case "ticket": {
        let newLanes = [...allLanes];

        const originLane = newLanes.find((lane) => lane.id === source.droppableId);

        const destinationLane = newLanes.find((lane) => lane.id === destination.droppableId);

        if (!originLane || !destinationLane) return;

        if (source.droppableId === destination.droppableId) {
          const newOrderedTickets = [...originLane.tickets]
            .toSpliced(source.index, 1)
            .toSpliced(destination.index, 0, originLane.tickets[source.index])
            .map((item, idx) => {
              return { ...item, order: idx };
            });

          originLane.tickets = newOrderedTickets;

          setAllLanes(newLanes);
          updateTicketsOrder(newOrderedTickets);
          updateLanesOrder(newLanes);
          router.refresh();
        } else {
          const [currentTicket] = originLane.tickets.splice(source.index, 1);

          originLane.tickets.forEach((ticket, idx) => {
            ticket.order = idx;
          });

          destinationLane.tickets.splice(destination.index, 0, {
            ...currentTicket,
            laneId: destination.droppableId,
          });

          destinationLane.tickets.forEach((ticket, idx) => {
            ticket.order = idx;
          });

          setAllLanes(newLanes);

          updateTicketsOrder([...destinationLane.tickets, ...originLane.tickets]);

          router.refresh();
        }
      }
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="bg-white/60 dark:bg-background/60 rounded-xl p-4 use-automation-zoom-in">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl">{pipelineDetails?.name}</h1>
          <Button className="flex items-center gap-4" onClick={handleAddlane}>
            <Plus size={15} />
            Create Lane
          </Button>
        </div>
        <Droppable droppableId="lanes" type="lane" direction="horizontal" key="lanes">
          {(provided) => (
            <div
              className="flex item-center gap-x-2 overflow-scroll"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              <div className="flex mt-4">
                {allLanes.map((lane, index) => (
                  <PipelineLane
                    allTickets={allTickets}
                    setAllTickets={setAllTickets}
                    subaccountId={subaccountId}
                    pipelineId={pipelineId}
                    tickets={lane.tickets}
                    laneDetails={lane}
                    index={index}
                    key={lane.id}
                  />
                ))}
                {provided.placeholder}
              </div>
            </div>
          )}
        </Droppable>
        {allLanes.length == 0 && (
          <div className="flex items-center justify-center w-full flex-col">
            <div className="opacity-100">
              <Flag width="100%" height="100%" className="text-muted-foreground" />
            </div>
          </div>
        )}
      </div>
    </DragDropContext>
  );
};

export default PipelineView;
