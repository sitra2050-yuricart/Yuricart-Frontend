"use client";

import useAuth from "@/hooks/auth";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Orders from "./Orders";
import MemberInfoForm from "./MemberInfoForm";

export default function ProfilePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl space-y-10 px-5 py-10">
        <Skeleton className="mx-auto h-10 w-48" />
        <Skeleton className="h-40 w-full" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-md px-5 py-16 text-center">
        <h1 className="text-3xl font-bold">Your profile</h1>
        <p className="mt-4 text-muted-foreground">
          Please log in to view your profile.
        </p>
        <Button className="mt-6" asChild>
          <Link href="/login">Login</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl space-y-10 px-5 py-10">
      <h1 className="text-center text-3xl font-bold md:text-4xl">
        Your profile
      </h1>
      <MemberInfoForm user={user} />
      <Orders />
    </main>
  );
}
