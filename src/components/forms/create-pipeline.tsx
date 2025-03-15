"use client";
import React, { useEffect } from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { Funnel, Pipeline } from "@prisma/client";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { saveActivityLogsNotification } from "@/lib/queries";
import { v4 } from "uuid";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useModal } from "@/hooks/use-modal";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { upsertPipeline } from "@/lib/queries/pipeline";

export const CreatePipelineFormSchema = z.object({
  name: z.string().min(1),
});
interface CreatePipelineFormProps {
  defaultData?: Pipeline;
  subaccountId: string;
}

const CreatePipelineForm: React.FC<CreatePipelineFormProps> = ({ defaultData, subaccountId }) => {
  const { data, isOpen, setOpen, setClose } = useModal();
  const router = useRouter();
  const form = useForm<z.infer<typeof CreatePipelineFormSchema>>({
    mode: "onChange",
    resolver: zodResolver(CreatePipelineFormSchema),
    defaultValues: {
      name: defaultData?.name || "",
    },
  });

  useEffect(() => {
    if (defaultData) {
      form.reset({
        name: defaultData.name || "",
      });
    }
  }, [defaultData]);

  const isLoading = form.formState.isLoading;

  const onSubmit = async (values: z.infer<typeof CreatePipelineFormSchema>) => {
    if (!subaccountId) return;
    try {
      const response = await upsertPipeline({
        ...values,
        id: defaultData?.id,
        subAccountId: subaccountId,
      });

      await saveActivityLogsNotification({
        description: `Updates a pipeline | ${response?.name}`,
        subaccountId: subaccountId,
      });

      toast.success("Success", {
        description: "Saved pipeline details",
      });
      router.refresh();
    } catch (error) {
      toast.error("ooops!!", {
        description: "Could not save pipeline details",
      });
    }

    setClose();
  };
  return (
    <Card className="w-full ">
      <CardHeader>
        <CardTitle>Pipeline Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <FormField
              disabled={isLoading}
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pipeline Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button className="w-20 mt-4" disabled={isLoading} type="submit">
              {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : "Save "}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CreatePipelineForm;
