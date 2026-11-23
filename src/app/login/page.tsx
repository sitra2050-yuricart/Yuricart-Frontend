"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import { Field, FormError, PasswordField, SubmitButton } from "@/components/auth/Field";
import useAuth from "@/hooks/auth";
import { loginCustomer } from "@/lib/api/auth";
import { StorefrontApiError } from "@/lib/api/client";
import { safeNextPath } from "@/lib/safe-redirect";

function LoginForm() {
  const { isLoggedIn } = useAuth();
  const params = useSearchParams();
  const next = safeNextPath(params.get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  if (isLoggedIn) {
    return (
      <AuthShell title="You are already logged in">
        <Link
          href={next}
          className="inline-flex h-11 w-full items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-white transition hover:bg-primary/90"
        >
          Continue
        </Link>
      </AuthShell>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      await loginCustomer({ email, password });
      window.location.href = next;
    } catch (err) {
      setError(
        err instanceof StorefrontApiError
          ? err.message
          : "We couldn't log you in. Check your connection and try again.",
      );
      setPending(false);
    }
  }

  return (
    <AuthShell
      title="Log in"
      subtitle="Track your orders and check out faster."
      footer={
        <>
          New to Yuricart?{" "}
          <Link
            href={next === "/profile" ? "/register" : `/register?next=${encodeURIComponent(next)}`}
            className="font-semibold text-primary hover:underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate={false}>
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
        <PasswordField
          label="Password"
          name="password"
          autoComplete="current-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <SubmitButton pending={pending}>Log in</SubmitButton>
      </form>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
