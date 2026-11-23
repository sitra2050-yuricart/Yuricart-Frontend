"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import { Field, FormError, PasswordField, SubmitButton } from "@/components/auth/Field";
import { registerCustomer } from "@/lib/api/auth";
import { StorefrontApiError } from "@/lib/api/client";
import { trackCompleteRegistration } from "@/lib/metaPixel";
import { isValidKenyanPhone } from "@/lib/phone";
import { safeNextPath } from "@/lib/safe-redirect";

function RegisterForm() {
  const params = useSearchParams();
  const next = safeNextPath(params.get("next"));
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [phoneError, setPhoneError] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.phone && !isValidKenyanPhone(form.phone)) {
      setPhoneError("Enter a Kenyan mobile number, like 0712 345 678.");
      return;
    }
    setPhoneError("");

    setPending(true);
    try {
      await registerCustomer({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim() || undefined,
      });
      trackCompleteRegistration({ status: true });
      window.location.href = next;
    } catch (err) {
      setError(
        err instanceof StorefrontApiError
          ? err.message
          : "We couldn't create your account. Check your connection and try again.",
      );
      setPending(false);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Save your details, track orders and check out faster."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href={next === "/profile" ? "/login" : `/login?next=${encodeURIComponent(next)}`}
            className="font-semibold text-[#003B73] hover:underline"
          >
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormError message={error} />
        <Field
          label="Full name"
          name="name"
          autoComplete="name"
          required
          value={form.name}
          onChange={set("name")}
        />
        <Field
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={set("email")}
        />
        <Field
          label="Phone (optional)"
          type="tel"
          name="phone"
          autoComplete="tel"
          inputMode="tel"
          placeholder="0712 345 678"
          hint="Used for delivery and WhatsApp updates."
          error={phoneError}
          value={form.phone}
          onChange={set("phone")}
        />
        <PasswordField
          label="Password"
          name="password"
          autoComplete="new-password"
          required
          minLength={8}
          hint="At least 8 characters."
          value={form.password}
          onChange={set("password")}
        />
        <SubmitButton pending={pending}>Create account</SubmitButton>
      </form>
    </AuthShell>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
