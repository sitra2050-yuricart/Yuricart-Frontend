"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PageHeader from "@/components/admin/PageHeader";
import ProductForm from "@/components/admin/ProductForm";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { getAdminProduct, updateAdminProduct } from "@/lib/admin/services";
import { Product } from "@/lib/admin/types";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAdminProduct(params.id)
      .then(({ data }) => setProduct(data))
      .catch((error) => {
        toast({
          title: "Failed to load product",
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive",
        });
        router.push("/admin/products");
      })
      .finally(() => setLoading(false));
  }, [params.id, router, toast]);

  async function handleSubmit(formData: FormData) {
    setSaving(true);
    try {
      await updateAdminProduct(params.id, formData);
      toast({ title: "Product updated" });
      router.push("/admin/products");
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!product) return null;

  return (
    <div>
      <PageHeader title="Edit Product" description={product.title} />
      <div className="rounded-xl border bg-background p-6">
        <ProductForm
          initialData={product}
          loading={saving}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/admin/products")}
        />
      </div>
    </div>
  );
}
