"use client";

import { useState } from "react";
import { Button, ButtonProps } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Product } from "@/lib/api/types";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api/client";

interface BackInStockNotificationButtonProps extends ButtonProps {
  product: Product | { _id?: string; name?: string; title?: string };
}

export default function BackInStockNotificationButton({
  product,
  ...props
}: BackInStockNotificationButtonProps) {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const productName =
    (product as Product).title || (product as { name?: string }).name || "this product";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast({ variant: "destructive", description: "Please enter your name." });
      return;
    }
    setSending(true);
    try {
      await apiRequest("/product-requests", {
        method: "POST",
        body: {
          customerName: name.trim(),
          customerEmail: email.trim() || undefined,
          productName,
        },
      });
      toast({ description: "We'll notify you when this product is back in stock!" });
      setShowForm(false);
      setName("");
      setEmail("");
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Something went wrong. Please try again later.",
      });
    } finally {
      setSending(false);
    }
  }

  if (showForm) {
    return (
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="notify-name">Your name</Label>
          <Input
            id="notify-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="notify-email">Email (optional)</Label>
          <Input
            id="notify-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={sending} className="flex-1">
            {sending ? "Sending..." : "Notify me"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowForm(false)}
          >
            Cancel
          </Button>
        </div>
      </form>
    );
  }

  return (
    <Button
      variant="secondary"
      {...props}
      onClick={() => setShowForm(true)}
    >
      Notify when available
    </Button>
  );
}
