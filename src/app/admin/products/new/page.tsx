"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import PageHeader from "@/components/admin/PageHeader";
import ProductForm from "@/components/admin/ProductForm";
import { useToast } from "@/hooks/use-toast";
import { createAdminProduct } from "@/lib/admin/services";

export default function NewProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      await createAdminProduct(formData);
      toast({ title: "Product created" });
      router.push("/admin/products");
    } catch (error) {
      toast({
        title: "Create failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader title="Add Product" description="Create a new product" />
      <div className="rounded-xl border bg-background p-6">
        <ProductForm
          loading={loading}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/admin/products")}
        />
      </div>
    </div>
  );
}
