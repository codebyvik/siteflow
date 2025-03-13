import BlurPage from "@/components/global/Blur-page";
import MediaComponent from "@/components/media";
import { getMedia } from "@/lib/queries/subaccount";
import React from "react";

type Props = {
  searchParams: {
    state: string;
    code: string;
  };
  params: { subaccountId: string };
};

const Page = async ({ searchParams, params }: Props) => {
  const { subaccountId } = await params;
  const data = await getMedia(subaccountId);

  return (
    <BlurPage>
      <MediaComponent data={data} subaccountId={subaccountId} />
    </BlurPage>
  );
};

export default Page;
