"use client";
import React from "react";
import * as z from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { createMedia } from "@/lib/queries/subaccount";
import { saveActivityLogsNotification } from "@/lib/queries";
import { Input } from "../ui/input";
import FileUpload from "../global/file-upload";
import { Button } from "../ui/button";
type Props = {
  subaccountId: string;
};

const formSchema = z.object({
  link: z.string().min(1, { message: "Media file is required" }),
  name: z.string().min(1, { message: "Name is required" }),
});

const UploadMediaForm = ({ subaccountId }: Props) => {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      link: "",
      name: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await createMedia(subaccountId, values);
      await saveActivityLogsNotification({
        agencyId: undefined,
        description: `Uploaded a media file | ${response.name}`,
        subaccountId,
      });
      toast.success("Success", {
        description: "Uploaded media",
      });
      router.refresh();
    } catch (error) {
      console.log("error uploading file", error);
      toast.error("Error", {
        description: "Error Uploading media",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Media Information</CardTitle>
        <CardDescription>Please enter the details for your file</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>File Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your File Name" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="link"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Media file</FormLabel>
                  <FormControl>
                    <FileUpload
                      apiEndpoint="subAccountLogo"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" className="mt-4">
              Upload Media
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default UploadMediaForm;
