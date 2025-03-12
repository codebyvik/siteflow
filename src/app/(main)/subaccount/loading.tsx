import { Loader2 } from "lucide-react";
import React from "react";

type Props = {};

const LoadingAgencyPage = (props: Props) => {
  return (
    <div className="h-screen w-screen flex justify-center items-center">
      <Loader2 className="animate-spin" />
    </div>
  );
};

export default LoadingAgencyPage;
