"use client";
import React from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { GetMediaFiles } from "@/lib/types";
import MediaCard from "./media-card";
import { FolderSearch } from "lucide-react";

type Props = {
  data: GetMediaFiles;
  subaccountId: string;
};

const ShowMedia = ({ data }: Props) => {
  return (
    <Command className="bg-transparent">
      <CommandInput placeholder="Search for file name..." />
      <CommandList className="pb-40 max-h-full">
        <CommandEmpty>No Media files</CommandEmpty>
        <CommandGroup>
          <div className="flex flex-wrap gap-4 pt-4">
            {data?.media?.map((file) => (
              <CommandItem
                key={file.id}
                className="p-0 max-w-[300px] w-full rounded-lg !bg-transparent !font-medium !text-white"
              >
                <MediaCard file={file} />
              </CommandItem>
            ))}

            {!data?.media?.length && (
              <div className="flex gap-2 items-center justify-center w-full">
                <FolderSearch size={150} className="dark:text-muted-foreground text-slate-300" />
              </div>
            )}
          </div>
        </CommandGroup>
      </CommandList>
    </Command>
  );
};

export default ShowMedia;
