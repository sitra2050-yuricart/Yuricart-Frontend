"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  createAdminCoupon,
  deleteAdminCoupon,
  getAdminCoupons,
} from "@/lib/admin/services";
import { AdminCoupon } from "@/lib/admin/types";

export default function AdminCouponsPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<AdminCoupon[]>([]);
  const [code, setCode] = useState("");
  const [discountValue, setDiscountValue] = useState("10");

  async function loadCoupons() {
    const { data } = await getAdminCoupons({ page: 1, limit: 50 });
    setItems(data);
  }

  useEffect(() => {
    loadCoupons().catch(console.error);
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createAdminCoupon({
        code,
        discountType: "percentage",
        discountValue: Number(discountValue),
        status: "active",
      });
      toast({ title: "Coupon created" });
      setCode("");
      loadCoupons();
    } catch (error) {
      toast({
        title: "Failed to create coupon",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Coupons" description="Manage discount codes" />

      <form onSubmit={handleCreate} className="grid max-w-md gap-3 rounded-lg border p-4">
        <div className="space-y-1.5">
          <Label htmlFor="code">Code</Label>
          <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="discount">Discount %</Label>
          <Input
            id="discount"
            type="number"
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            required
          />
        </div>
        <Button type="submit">Create coupon</Button>
      </form>

      <ul className="space-y-2">
        {items.map((coupon) => (
          <li
            key={coupon._id}
            className="flex items-center justify-between rounded-lg border px-4 py-3"
          >
            <span className="font-medium">
              {coupon.code} — {coupon.discountValue}
              {coupon.discountType === "percentage" ? "%" : " KES"}
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={async () => {
                await deleteAdminCoupon(coupon._id);
                loadCoupons();
              }}
            >
              Delete
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
