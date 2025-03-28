"use client";
import { FileIcon, X } from "lucide-react";
import Image from "next/image";
import React from "react";
import { Button } from "../ui/button";
import { UploadDropzone } from "@uploadthing/react";
type Props = {
  apiEndpoint: "agencyLogo" | "avatar" | "subAccountLogo";
  onChange: (url?: string) => void;
  value?: string;
};

const FileUpload = ({ apiEndpoint, onChange, value }: Props) => {
  const type = value?.split(".").pop();

  if (value) {
    return (
      <div className="flex flex-col justify-center items-center">
        {type !== "pdf" ? (
          <div className="relative w-40 h-40">
            <Image src={value} alt="uploaded image" className="object-contain" fill />
          </div>
        ) : (
          <div className="flex relative items-center p-2 mt-2 rounded-md bg-background/10">
            <FileIcon />
            <a
              href={value}
              target="_blank"
              rel="noopener_noreferrer"
              className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline"
            >
              View PDF
            </a>
          </div>
        )}
        <Button onClick={() => onChange("")} variant={"ghost"} type="button">
          <X className="h-4 w-4" />
          Remove Logo
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full bg-muted/50 border border-dashed">
      {/* @ts-ignore */}
      <UploadDropzone
        endpoint={apiEndpoint}
        className="rounded-md mt-0"
        onClientUploadComplete={(res: any) => {
          onChange(res?.[0].url);
        }}
        onUploadError={(error: any) => {
          console.log(error);
        }}
      />
    </div>
  );
};

export default FileUpload;
