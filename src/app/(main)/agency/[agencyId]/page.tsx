import React from "react";

const Page = async ({ params }: { params: { agencyId: string } }) => {
  const { agencyId } = await params;

  return <div>Agency ID Page {agencyId} </div>;
};

export default Page;
