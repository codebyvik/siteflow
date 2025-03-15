import { db } from "@/lib/db";
import { redirect } from "next/navigation";

type Props = {
  params: { subaccountId: string };
};

const Page = async ({ params }: Props) => {
  const { subaccountId } = await params;

  const pipelineExists = await db.pipeline.findFirst({
    where: { subAccountId: subaccountId },
  });

  if (pipelineExists) {
    return redirect(`/subaccount/${subaccountId}/pipelines/${pipelineExists.id}`);
  }

  try {
    const response = await db.pipeline.create({
      data: {
        name: "First Pipeline",
        subAccountId: subaccountId,
      },
    });
    return redirect(`/subaccount/${subaccountId}/pipelines/${response.id}`);
  } catch (error) {
    console.log(error);
  }
};

export default Page;
