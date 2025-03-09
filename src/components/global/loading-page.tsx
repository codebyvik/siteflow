import { Loader2 } from "lucide-react";
import React from "react";

const LoadingPage = () => {
  return (
    <div className="h-full w-full justify-center items-center">
      <Loader2 className="animate-spin" />
    </div>
  );
};

export default LoadingPage;
