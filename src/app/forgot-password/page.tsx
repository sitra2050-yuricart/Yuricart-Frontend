"use client";

import { useState } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import { Field, FormError, SubmitButton } from "@/components/auth/Field";
import { requestPasswordReset } from "@/lib/api/auth";
import { StorefrontApiError } from "@/lib/api/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [sentTo, setSentTo] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      await requestPasswordReset(email.trim());
      setSentTo(email.trim());
    } catch (err) {
      setError(
        err instanceof StorefrontApiError
          ? err.message
          : "We couldn't send the email. Check your connection and try again.",
      );
    } finally {
      setPending(false);
    }
  }

  if (sentTo) {
    return (
      <AuthShell
        title="Check your email"
        footer={<Link href="/login" className="font-semibold text-primary hover:underline">Back to log in</Link>}
      >
        <div role="status" className="flex items-start gap-3 rounded-xl bg-brand-soft p-4 text-sm text-gray-800">
          <MailCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
          <p>
            If an account exists for <strong>{sentTo}</strong>, we have sent a link to reset the
            password. It works once and expires in 1 hour. Check your spam folder if it does not
            arrive.
          </p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="Enter your email and we will send you a link to choose a new one."
      footer={<Link href="/login" className="font-semibold text-primary hover:underline">Back to log in</Link>}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormError message={error} />
        <Field
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <SubmitButton pending={pending}>Send reset link</SubmitButton>
      </form>
    </AuthShell>
  );
}
