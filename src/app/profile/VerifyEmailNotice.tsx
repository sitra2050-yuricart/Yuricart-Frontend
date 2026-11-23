"use client";

import { useState } from "react";
import { resendVerification, type CustomerUser } from "@/lib/api/auth";

/** Orders placed as a guest only appear after the account email is confirmed. */
export default function VerifyEmailNotice({ user }: { user: CustomerUser }) {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  if (user.emailVerified) return null;

  async function resend() {
    setPending(true);
    setMessage("");
    try {
      setMessage(await resendVerification());
    } catch {
      setMessage("We couldn't send that. Try again in a moment.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div role="status" className="space-y-2 rounded-xl bg-amber-50 p-4 text-sm text-amber-950 ring-1 ring-amber-200">
      <p className="font-semibold">Confirm your email to see earlier orders</p>
      <p>
        We sent a link to {user.email}. Orders you placed before signing up show here once you confirm it.
      </p>
      <button
        type="button"
        onClick={resend}
        disabled={pending}
        className="font-semibold text-primary underline-offset-2 hover:underline disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send the link again"}
      </button>
      {message ? <p>{message}</p> : null}
    </div>
  );
}
