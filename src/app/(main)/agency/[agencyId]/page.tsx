import React from "react";

const Page = ({ params }: { params: { agencyId: string } }) => {
  return <div>Agency ID Page {params?.agencyId} </div>;
};

export default Page;
