"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import { FormError, PasswordField, SubmitButton } from "@/components/auth/Field";
import { resetPassword } from "@/lib/api/auth";
import { StorefrontApiError } from "@/lib/api/client";

function ResetForm() {
  const token = useSearchParams().get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [mismatch, setMismatch] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <AuthShell
        title="This link is not valid"
        subtitle="The reset link is missing or incomplete."
        footer={<Link href="/forgot-password" className="font-semibold text-[#003B73] hover:underline">Request a new link</Link>}
      >
        <p className="text-sm text-gray-700">Open the link from your email again, or ask for a new one.</p>
      </AuthShell>
    );
  }

  if (done) {
    return (
      <AuthShell title="Password changed">
        <div role="status" className="flex items-start gap-3 rounded-xl bg-green-50 p-4 text-sm text-green-900 ring-1 ring-green-200">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0" aria-hidden />
          <p>Your password has been changed. You can now log in with it.</p>
        </div>
        <Link
          href="/login"
          className="inline-flex h-11 w-full items-center justify-center rounded-full bg-[#003B73] px-6 text-sm font-semibold text-white transition hover:bg-[#002f5d]"
        >
          Log in
        </Link>
      </AuthShell>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setMismatch("The two passwords do not match.");
      return;
    }
    setMismatch("");
    setPending(true);
    try {
      await resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(
        err instanceof StorefrontApiError
          ? err.message
          : "We couldn't change your password. Check your connection and try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthShell
      title="Choose a new password"
      footer={<Link href="/forgot-password" className="font-semibold text-[#003B73] hover:underline">Need a new link?</Link>}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormError message={error} />
        <PasswordField
          label="New password"
          name="password"
          autoComplete="new-password"
          required
          minLength={8}
          hint="At least 8 characters."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <PasswordField
          label="Confirm new password"
          name="confirm"
          autoComplete="new-password"
          required
          minLength={8}
          error={mismatch}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        <SubmitButton pending={pending}>Change password</SubmitButton>
      </form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}
