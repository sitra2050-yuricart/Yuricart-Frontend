"use client";

import Link from "next/link";
import { LogOut, Mail, Phone, PackageSearch, UserRound } from "lucide-react";
import useAuth from "@/hooks/auth";
import { Skeleton } from "@/components/ui/skeleton";
import Orders from "./Orders";
import VerifyEmailNotice from "./VerifyEmailNotice";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase() || "?";
}

export default function ProfilePage() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <main className="bg-surface">
        <div className="mx-auto max-w-5xl space-y-6 px-5 py-8 sm:py-12">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="bg-surface">
        <div className="mx-auto max-w-md px-5 py-16 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-brand-soft text-primary">
            <UserRound className="size-7" aria-hidden />
          </span>
          <h1 className="mt-5 text-2xl font-bold text-gray-900">Log in to see your account</h1>
          <p className="mt-2 text-gray-700">Your orders and details are here once you are logged in.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/login?next=/profile"
              className="inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-white transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Log in
            </Link>
            <Link
              href="/register?next=/profile"
              className="inline-flex h-11 items-center rounded-full bg-white px-6 text-sm font-semibold text-gray-800 ring-1 ring-gray-900/15 transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Create account
            </Link>
          </div>
          <p className="mt-6 text-sm text-gray-700">
            Ordered as a guest?{" "}
            <Link href="/track" className="font-semibold text-primary hover:underline">
              Track your order
            </Link>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-surface">
      <div className="mx-auto max-w-5xl space-y-6 px-5 py-8 sm:py-12">
        <header className="flex flex-wrap items-center gap-4 rounded-2xl bg-white p-5 ring-1 ring-gray-900/5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_12px_32px_-18px_rgba(16,24,40,0.16)] sm:p-6">
          <span
            className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-white"
            aria-hidden
          >
            {initials(user.name || user.email)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <span className="h-6 w-1 rounded-full bg-cta" aria-hidden />
              <h1 className="break-words text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                {user.name || "Your account"}
              </h1>
            </div>
            <p className="mt-1 truncate text-sm text-gray-700">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={() => logout()}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-gray-800 ring-1 ring-gray-900/15 transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <LogOut className="size-4" aria-hidden />
            <span className="sr-only sm:not-sr-only">Log out</span>
          </button>
        </header>

        <VerifyEmailNotice user={user} />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)] lg:items-start">
          <aside className="space-y-4 lg:sticky lg:top-24">
            <section aria-labelledby="details" className="space-y-4 rounded-2xl bg-white p-5 ring-1 ring-gray-900/10">
              <h2 id="details" className="text-base font-bold text-gray-900">
                Your details
              </h2>
              <dl className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <UserRound className="mt-0.5 size-4 shrink-0 text-gray-500" aria-hidden />
                  <div className="min-w-0">
                    <dt className="text-xs text-gray-600">Name</dt>
                    <dd className="break-words font-medium text-gray-900">{user.name || "Not set"}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 size-4 shrink-0 text-gray-500" aria-hidden />
                  <div className="min-w-0">
                    <dt className="text-xs text-gray-600">Email</dt>
                    <dd className="break-all font-medium text-gray-900">{user.email}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="mt-0.5 size-4 shrink-0 text-gray-500" aria-hidden />
                  <div className="min-w-0">
                    <dt className="text-xs text-gray-600">Phone</dt>
                    <dd className="font-medium text-gray-900">{user.phone || "Not set"}</dd>
                  </div>
                </div>
              </dl>
              <p className="border-t border-gray-100 pt-3 text-xs text-gray-600">
                To change these details, message us on WhatsApp or use the contact page.
              </p>
            </section>

            <Link
              href="/track"
              className="flex items-center gap-3 rounded-2xl bg-white p-4 text-sm font-semibold text-gray-900 ring-1 ring-gray-900/10 transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <PackageSearch className="size-5 text-primary" aria-hidden />
              Track an order by number
            </Link>
          </aside>

          <Orders />
        </div>
      </div>
    </main>
  );
}
