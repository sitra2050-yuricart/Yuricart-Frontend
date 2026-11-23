"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import { verifyEmail } from "@/lib/api/auth";
import { StorefrontApiError } from "@/lib/api/client";

type State = { kind: "working" } | { kind: "done" } | { kind: "failed"; message: string };

function Verify() {
  const token = useSearchParams().get("token") ?? "";
  const [state, setState] = useState<State>(
    token ? { kind: "working" } : { kind: "failed", message: "The confirmation link is missing or incomplete." },
  );

  useEffect(() => {
    if (!token) return;
    verifyEmail(token)
      .then(() => setState({ kind: "done" }))
      .catch((err) =>
        setState({
          kind: "failed",
          message:
            err instanceof StorefrontApiError
              ? err.message
              : "We couldn't confirm your email. Check your connection and try again.",
        }),
      );
  }, [token]);

  if (state.kind === "done") {
    return (
      <AuthShell title="Email confirmed">
        <div role="status" className="flex items-start gap-3 rounded-xl bg-green-50 p-4 text-sm text-green-900 ring-1 ring-green-200">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0" aria-hidden />
          <p>Thanks. Orders you placed with this email now show in your account.</p>
        </div>
        <Link
          href="/profile"
          className="inline-flex h-11 w-full items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-white transition hover:bg-primary/90"
        >
          View your orders
        </Link>
      </AuthShell>
    );
  }

  if (state.kind === "failed") {
    return (
      <AuthShell
        title="This link is not valid"
        footer={<Link href="/profile" className="font-semibold text-primary hover:underline">Log in to get a new link</Link>}
      >
        <p role="alert" className="text-sm text-gray-700">{state.message}</p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Confirming your email">
      <p role="status" className="text-sm text-gray-700">One moment…</p>
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <Verify />
    </Suspense>
  );
}
