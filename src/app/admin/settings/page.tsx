"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getAdminSettings, updateAdminSettings } from "@/lib/admin/services";

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [storeName, setStoreName] = useState("Yuricart");
  const [whatsappNumber, setWhatsappNumber] = useState("254768054542");
  const [shippingRate, setShippingRate] = useState("500");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminSettings("general")
      .then(({ data }) => {
        if (typeof data.storeName === "string") setStoreName(data.storeName);
        if (typeof data.whatsappNumber === "string") setWhatsappNumber(data.whatsappNumber);
        if (typeof data.shippingRate === "string") setShippingRate(data.shippingRate);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      await updateAdminSettings({
        group: "general",
        settings: {
          storeName,
          whatsappNumber,
          shippingRate,
        },
      });
      toast({ title: "Settings saved" });
    } catch (error) {
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  }

  if (loading) return null;

  return (
    <div>
      <PageHeader title="Settings" description="Store configuration" />
      <form onSubmit={handleSave} className="max-w-md space-y-4 rounded-lg border p-5">
        <div className="space-y-1.5">
          <Label htmlFor="storeName">Store name</Label>
          <Input id="storeName" value={storeName} onChange={(e) => setStoreName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="whatsapp">WhatsApp number</Label>
          <Input
            id="whatsapp"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="shipping">Default shipping rate (KES)</Label>
          <Input
            id="shipping"
            value={shippingRate}
            onChange={(e) => setShippingRate(e.target.value)}
          />
        </div>
        <Button type="submit">Save settings</Button>
      </form>
    </div>
  );
}
