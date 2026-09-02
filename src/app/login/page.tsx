"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LoadingButton from "@/components/LoadingButton";
import useAuth from "@/hooks/auth";
import { trackCompleteRegistration } from "@/lib/metaPixel";

export default function LoginPage() {
  const { login, register, isLoggedIn } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  if (isLoggedIn) {
    return (
      <main className="mx-auto max-w-md px-5 py-16 text-center">
        <p>You are already logged in.</p>
        <Button className="mt-4" asChild>
          <Link href="/profile">Go to profile</Link>
        </Button>
      </main>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      if (mode === "login") {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password, form.phone);
        trackCompleteRegistration({ status: true });
      }
      window.location.href = "/profile";
    } catch {
      // toast handled in hook
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="mx-auto max-w-md space-y-6 px-5 py-16">
      <h1 className="text-3xl font-bold">
        {mode === "login" ? "Login" : "Create account"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "register" && (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <LoadingButton type="submit" loading={pending} className="w-full">
          {mode === "login" ? "Login" : "Register"}
        </LoadingButton>
      </form>

      <button
        type="button"
        className="text-sm text-primary hover:underline"
        onClick={() => setMode(mode === "login" ? "register" : "login")}
      >
        {mode === "login"
          ? "Need an account? Register"
          : "Already have an account? Login"}
      </button>
    </main>
  );
}
