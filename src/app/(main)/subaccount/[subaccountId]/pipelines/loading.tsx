import { Loader2 } from "lucide-react";
import React from "react";

const Loading = () => {
  return (
    <div className="-mt-8 h-screen">
      <Loader2 className="animate-spin" />
    </div>
  );
};

export default Loading;
