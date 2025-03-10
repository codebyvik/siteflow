import React from "react";

const Page = async ({ params }: { params: { agencyId: string } }) => {
  // let agencyID = await params.agencyId;

  return <div>Agency ID Page {params.agencyId} </div>;
};

export default Page;
