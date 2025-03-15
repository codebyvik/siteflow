import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/lib/db";
import {
  getLanesWithTicketAndTags,
  getPipeLineDetails,
  updateLanesOrder,
  updateTicketsOrder,
} from "@/lib/queries/pipeline";
import { LaneDetail } from "@/lib/types";
import { redirect } from "next/navigation";
import React from "react";
import PipeLineInfoBar from "../_components/PipeLineInfoBar";
import PipelineSettings from "../_components/Pipeline-settings";
import PipelineView from "../_components/Pipeline-view";

type Props = {
  params: { subaccountId: string; pipelineid: string };
};

const Page = async ({ params }: Props) => {
  const { subaccountId, pipelineid } = await params;
  const pipeLineDetails = await getPipeLineDetails(pipelineid);

  if (!pipeLineDetails) {
    return redirect(`/subaccount/${subaccountId}/pipelines`);
  }

  const pipelines = await db.pipeline.findMany({
    where: { subAccountId: subaccountId },
  });

  const lanes = (await getLanesWithTicketAndTags(pipelineid)) as LaneDetail[];

  return (
    <Tabs defaultValue="view" className="w-full">
      <TabsList className="bg-transparent border-b-2 h-16 w-full justify-between mb-4">
        <PipeLineInfoBar
          pipelineId={pipelineid}
          subAccountId={subaccountId}
          pipelines={pipelines}
        />
        <div>
          <TabsTrigger value="view">Pipeline View</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </div>
      </TabsList>
      <TabsContent value="view">
        <PipelineView
          lanes={lanes}
          pipelineDetails={pipeLineDetails}
          pipelineId={pipelineid}
          subaccountId={subaccountId}
          updateLanesOrder={updateLanesOrder}
          updateTicketsOrder={updateTicketsOrder}
        />
      </TabsContent>
      <TabsContent value="settings">
        <PipelineSettings
          pipelineId={pipelineid}
          subaccountId={subaccountId}
          pipelines={pipelines}
        />
      </TabsContent>
    </Tabs>
  );
};

export default Page;
