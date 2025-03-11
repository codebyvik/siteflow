"use client";
import { useModal } from "@/hooks/use-modal";
import { getAuthUserDetails, saveActivityLogsNotification } from "@/lib/queries";
import { changeUserPermission, getUserPermissions, updateUser } from "@/lib/queries/user";
import {
  AuthUserWithAgencySigebarOptionsSubAccounts,
  UserWithPermissionsAndSubAccounts,
} from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubAccount, User } from "@prisma/client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import FileUpload from "../global/file-upload";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";
import { v4 } from "uuid";
type Props = {
  id: string | null;
  type: "agency" | "subaccount";
  userData?: Partial<User>;
  subAccounts?: SubAccount[];
};

const UserDetails = ({ id, type, userData, subAccounts }: Props) => {
  const [subAccountPermissions, setSubAccountPermissions] =
    useState<UserWithPermissionsAndSubAccounts | null>(null);

  const { data, setClose } = useModal();
  const [roleState, setRoleState] = useState("");
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [authUserdata, setAuthUserdata] =
    useState<AuthUserWithAgencySigebarOptionsSubAccounts | null>(null);
  const router = useRouter();

  //   Get authUser details

  useEffect(() => {
    if (data.user) {
      const fetchDetails = async () => {
        const response = await getAuthUserDetails();

        if (response) setAuthUserdata(response);
      };

      fetchDetails();
    }
  }, [data]);

  const UserDataSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    avatarUrl: z.string(),
    role: z.enum(["AGENCY_OWNER", "AGENCY_ADMIN", "SUBACCOUNT_USER", "SUBACCOUNT_GUEST"]),
  });

  const form = useForm<z.infer<typeof UserDataSchema>>({
    resolver: zodResolver(UserDataSchema),
    mode: "onChange",
    defaultValues: {
      name: userData?.name ? userData.name : data?.user?.name ? data?.user?.name : "",
      email: userData ? userData.email : data?.user?.email,
      avatarUrl: userData ? userData.avatarUrl : data?.user?.avatarUrl,
      role: userData ? userData.role : data?.user?.role,
    },
  });

  const isLoading = form.formState.isSubmitting;

  useEffect(() => {
    if (!data.user) return;
    const getPermissions = async () => {
      if (!data.user) return;
      const permission = await getUserPermissions(data.user.id);
      setSubAccountPermissions(permission);
    };
    getPermissions();
  }, [data, form]);

  //reset form
  useEffect(() => {
    if (data?.user) {
      // @ts-ignore
      form.reset(data.user);
    }

    if (userData) {
      // @ts-ignore
      form.reset(userData);
    }
  }, [data, userData]);

  console.log({ role: authUserdata?.role, authUserdata });

  //form handling
  const onSubmit = async (values: z.infer<typeof UserDataSchema>) => {
    if (!id) return;
    if (userData || data?.user) {
      const updatedUser = await updateUser(values);

      authUserdata?.Agency?.subAccounts
        .filter((subacc) =>
          authUserdata.Permissions.find((p) => p.subAccountId === subacc.id && p.access)
        )
        .forEach(async (subaccount) => {
          await saveActivityLogsNotification({
            description: `Updated ${userData?.name} information`,
            subaccountId: subaccount.id,
          });
        });

      //successfully updated user
      if (updatedUser) {
        toast.success("Success", {
          description: "Updated user information.",
        });

        setClose();
        router.refresh();
      } else {
        toast.error("Failed", {
          description: "Could not update user information.",
        });
      }
    } else {
      console.log("Error could not submit");
    }
  };

  const onChangePermission = async (
    subAccountId: string,
    val: boolean,
    permissionId: string | undefined
  ) => {
    if (!data.user?.email) return;

    setLoadingPermissions(true);

    const response = await changeUserPermission(
      permissionId ? permissionId : v4(),
      data.user.email,
      subAccountId,
      val
    );

    if (type === "agency") {
      await saveActivityLogsNotification({
        agencyId: authUserdata?.Agency?.id,
        description: `Gave ${userData?.name} access to | ${
          subAccountPermissions?.Permissions.find((p) => p.subAccountId === subAccountId)
            ?.subAccount.name
        }`,

        subaccountId: subAccountPermissions?.Permissions.find(
          (p) => p.subAccountId === subAccountId
        )?.subAccount.id,
      });
    }

    if (response) {
      toast.success("Success", {
        description: "The request was successful",
      });

      if (subAccountPermissions) {
        subAccountPermissions.Permissions.find((per) => {
          if (per.subAccountId === subAccountId) {
            return { ...per, access: !per.access };
          }
          return per;
        });
      }
    } else {
      toast.error("Failed", {
        description: "Could not update permissions",
      });
    }

    router.refresh();
    setLoadingPermissions(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>User Details</CardTitle>
        <CardDescription>Add or update your information</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              disabled={isLoading}
              control={form.control}
              name="avatarUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile picture</FormLabel>
                  <FormControl>
                    <FileUpload
                      apiEndpoint="avatar"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              disabled={isLoading}
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>User full name</FormLabel>
                  <FormControl>
                    <Input required placeholder="Full Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={isLoading}
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      readOnly={userData?.role === "AGENCY_OWNER" || isLoading}
                      placeholder="Email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              disabled={isLoading}
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>User Role</FormLabel>
                  <Select
                    disabled={field.value === "AGENCY_OWNER"}
                    onValueChange={(value) => {
                      if (value === "SUBACCOUNT_USER" || value === "SUBACCOUNT_GUEST") {
                        setRoleState(
                          "You need to have subaccounts to assign Subaccount access to team member"
                        );
                      } else {
                        setRoleState("");
                      }
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select user role..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="AGENCY_ADMIN">Agency Admin</SelectItem>
                      {(data?.user?.role === "AGENCY_OWNER" ||
                        userData?.role === "AGENCY_OWNER") && (
                        <SelectItem value="AGENCY_OWNER">Agency Owner</SelectItem>
                      )}
                      <SelectItem value="SUBACCOUNT_USER">Sub Account User</SelectItem>
                      <SelectItem value="SUBACCOUNT_GUEST">Sub Account Guest</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-muted-foreground">{roleState}</p>
                </FormItem>
              )}
            />

            {/* ACCESS CONTROL */}
            <Button disabled={isLoading} type="submit">
              {isLoading ? <Loader2 className="animate-spin" /> : "Save User Details"}
            </Button>

            {/* Changing permissions section */}

            {authUserdata?.role === "AGENCY_OWNER" && (
              <div>
                <Separator className="my-4" />
                <FormLabel>User permissions</FormLabel>
                <FormDescription className="mb-4">
                  You can give Sub Account access to team member by turning on access control for
                  each Sub Account. This is only visible to agency owners.
                </FormDescription>
                <div className="flex flex-col gap-4">
                  {subAccounts?.map((subAccount) => {
                    const subAccountPermissionsDetails = subAccountPermissions?.Permissions.find(
                      (p) => p.subAccountId === subAccount.id
                    );
                    return (
                      <div
                        key={subAccount.id}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div>
                          <p>{subAccount.name}</p>
                        </div>
                        <Switch
                          disabled={loadingPermissions}
                          checked={subAccountPermissionsDetails?.access}
                          onCheckedChange={(permission) => {
                            onChangePermission(
                              subAccount.id,
                              permission,
                              subAccountPermissionsDetails?.id
                            );
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default UserDetails;
