"use client";
import { Lane } from "@prisma/client";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { saveActivityLogsNotification } from "@/lib/queries";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useModal } from "@/hooks/use-modal";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getPipeLineDetails, upsertLane } from "@/lib/queries/pipeline";

type Props = {
  defaultData?: Lane;
  pipelineId: string;
};

export const FormSchema = z.object({
  name: z.string().min(1),
});

const LaneForm = ({ defaultData, pipelineId }: Props) => {
  const { setClose } = useModal();
  const router = useRouter();

  const form = useForm<z.infer<typeof FormSchema>>({
    mode: "onChange",
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: defaultData?.name || "",
    },
  });
  const isLoading = form.formState.isSubmitting;

  useEffect(() => {
    if (defaultData) {
      form.reset({
        name: defaultData.name || "",
      });
    }
  }, [defaultData]);

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    if (!pipelineId) return;

    try {
      const response = await upsertLane({
        ...values,
        id: defaultData?.id,
        pipelineId: pipelineId,
        order: defaultData?.order,
        color: "",
      });

      const currentDetails = await getPipeLineDetails(pipelineId);
      if (!currentDetails) return;

      await saveActivityLogsNotification({
        description: `Updated a lane ${response.name}`,
        subaccountId: currentDetails.subAccountId,
      });

      toast.success("Success", {
        description: "Saved pipeline details",
      });

      router.refresh();
    } catch (error) {
      toast.error("Failed", {
        description: "Could not save pipeline details",
      });
    } finally {
      setClose();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Lane Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              disabled={isLoading}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lane Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter lane's name" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button className="w-20 mt-4" disabled={isLoading} type="submit">
              {isLoading ? <Loader2 className="animate-spin" /> : "Save"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default LaneForm;
