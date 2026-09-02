"use client";

import LoadingButton from "@/components/LoadingButton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { requiredString } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CustomerUser } from "@/lib/api/auth";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  loginEmail: requiredString,
  firstName: z.string(),
  lastName: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

interface MemberInfoFormProps {
  user: CustomerUser;
}

export default function MemberInfoForm({ user }: MemberInfoFormProps) {
  const { toast } = useToast();
  const nameParts = user.name?.split(" ") || [];
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      loginEmail: user.email || "",
      firstName,
      lastName,
    },
  });

  function onSubmit() {
    toast({
      description: "Profile updates will be available in a future release.",
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto max-w-xl space-y-5"
      >
        <FormField
          control={form.control}
          name="loginEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Login email</FormLabel>
              <FormControl>
                <Input
                  placeholder="Login email"
                  type="email"
                  disabled
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First name</FormLabel>
              <FormControl>
                <Input placeholder="First name" disabled {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last name</FormLabel>
              <FormControl>
                <Input placeholder="Last name" disabled {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <LoadingButton type="submit" loading={false}>
          Submit
        </LoadingButton>
      </form>
    </Form>
  );
}
