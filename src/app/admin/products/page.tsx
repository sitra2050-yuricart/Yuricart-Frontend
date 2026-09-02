"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Pencil, Trash2, ImageOff } from "lucide-react";
import AdminFilters from "@/components/admin/AdminFilters";
import AdminPagination from "@/components/admin/AdminPagination";
import DeleteConfirmDialog from "@/components/admin/DeleteConfirmDialog";
import EmptyState from "@/components/admin/EmptyState";
import PageHeader from "@/components/admin/PageHeader";
import StatusBadge from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { deleteAdminProduct, getAdminProducts } from "@/lib/admin/services";
import { Product } from "@/lib/admin/types";
import { formatCurrency } from "@/lib/utils";

const PAGE_SIZE = 10;

function getProductImage(product: Product): string {
  const images = product.images as unknown;
  if (images) {
    if (Array.isArray(images)) {
      const primary = images.find((img: any) => img.isPrimary) || images[0];
      if (primary?.url) return primary.url;
    } else if (typeof images === "object" && images !== null) {
      const obj = images as Record<string, unknown>;
      const primary = obj.primary as { url?: string } | undefined;
      if (primary?.url) return primary.url;
    }
  }

  return product.video?.thumbnailUrl || "";
}

function resolveName(
  ref: { name?: string } | string | undefined | null,
): string {
  if (!ref) return "-";
  return typeof ref === "string" ? ref : ref.name || "-";
}

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(searchParams.entries());
      const { data, meta } = await getAdminProducts({
        page: params.page || 1,
        limit: PAGE_SIZE,
        q: params.q,
        status: params.status,
        sort: params.sort,
        featured: params.featured,
      });
      setItems(data);
      setPage(meta?.page || 1);
      setTotalPages(meta?.totalPages || 1);
    } catch (error) {
      toast({
        title: "Failed to load products",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [searchParams, toast]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteAdminProduct(deleteId);
      toast({ title: "Product deleted" });
      setDeleteId(null);
      loadProducts();
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Products"
        description="Manage your product catalog"
        actionLabel="Add Product"
        actionHref="/admin/products/new"
      />

      <AdminFilters
        fields={[
          { name: "q", label: "Search", type: "text", placeholder: "Search products..." },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: [
              { value: "active", label: "Active" },
              { value: "draft", label: "Draft" },
              { value: "archived", label: "Archived" },
            ],
          },
          {
            name: "sort",
            label: "Sort",
            type: "select",
            options: [
              { value: "createdAt_desc", label: "Newest" },
              { value: "createdAt_asc", label: "Oldest" },
              { value: "price_asc", label: "Price: Low to High" },
              { value: "price_desc", label: "Price: High to Low" },
              { value: "title_asc", label: "Title A-Z" },
            ],
          },
        ]}
      />

      <div className="overflow-x-auto rounded-lg border bg-background">
        <table className="w-full min-w-[1000px] text-sm">
          <thead className="border-b bg-muted/50 text-left">
            <tr>
              <th className="w-12 px-4 py-3 text-center font-medium">#</th>
              <th className="w-14 px-4 py-3 font-medium">Image</th>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Sale Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Brand</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="w-20 px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b">
                  <td className="px-4 py-3" colSpan={10}>
                    <Skeleton className="h-6 w-full" />
                  </td>
                </tr>
              ))}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={10}>
                  <EmptyState title="No products found" description="Create your first product to get started." />
                </td>
              </tr>
            )}
            {!loading &&
              items.map((product, index) => (
                <tr key={product._id} className="border-b transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3 text-center text-muted-foreground">
                    {(page - 1) * PAGE_SIZE + index + 1}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex size-11 items-center justify-center overflow-hidden rounded-md border bg-muted">
                      {getProductImage(product) ? (
                        <img
                          src={getProductImage(product)}
                          alt={product.title}
                          className="size-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <ImageOff className="size-4 text-muted-foreground" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="max-w-[220px]">
                      <div className="truncate font-medium">{product.title}</div>
                      {product.sku && (
                        <div className="truncate text-xs text-muted-foreground">
                          SKU: {product.sku}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {formatCurrency(product.price, product.currency)}
                  </td>
                  <td className="px-4 py-3">
                    {product.salePrice ? (
                      formatCurrency(product.salePrice, product.currency)
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{product.stock}</td>
                  <td className="px-4 py-3">
                    <span className="line-clamp-1">{resolveName(product.category)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="line-clamp-1">{resolveName(product.brand)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={product.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" asChild>
                        <Link href={`/admin/products/${product._id}/edit`}>
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setDeleteId(product._id)}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <AdminPagination page={page} totalPages={totalPages} />

      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete product?"
        description="This action cannot be undone."
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading products...</div>}>
      <ProductsPageContent />
    </Suspense>
  );
}
