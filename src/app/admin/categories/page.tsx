"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ImageIcon, Pencil, Trash2 } from "lucide-react";
import AdminFilters from "@/components/admin/AdminFilters";
import AdminPagination from "@/components/admin/AdminPagination";
import CategoryForm from "@/components/admin/CategoryForm";
import DeleteConfirmDialog from "@/components/admin/DeleteConfirmDialog";
import EmptyState from "@/components/admin/EmptyState";
import PageHeader from "@/components/admin/PageHeader";
import StatusBadge from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  createAdminCategory,
  deleteAdminCategory,
  getAdminCategories,
  updateAdminCategory,
} from "@/lib/admin/services";
import { Category, getImageUrl } from "@/lib/admin/types";

function CategoriesPageContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(searchParams.entries());
      const { data, meta } = await getAdminCategories({
        page: params.page || 1,
        limit: 10,
        q: params.q,
        status: params.status,
        sort: params.sort || "sortOrder_asc",
      });
      setItems(data);
      setPage(meta?.page || 1);
      setTotalPages(meta?.totalPages || 1);
    } catch (error) {
      toast({
        title: "Failed to load categories",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [searchParams, toast]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(item: Category) {
    setEditing(item);
    setDialogOpen(true);
  }

  async function handleSubmit(formData: FormData) {
    setSaving(true);
    try {
      if (editing) {
        await updateAdminCategory(editing._id, formData);
        toast({ title: "Category updated" });
      } else {
        await createAdminCategory(formData);
        toast({ title: "Category created" });
      }
      setDialogOpen(false);
      loadItems();
    } catch (error) {
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteAdminCategory(deleteId);
      toast({ title: "Category deleted" });
      setDeleteId(null);
      loadItems();
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
        title="Categories"
        description="Manage product categories"
        actionLabel="Add Category"
        onAction={openCreate}
      />

      <AdminFilters
        fields={[
          { name: "q", label: "Search", type: "text", placeholder: "Search categories..." },
          {
            name: "status",
            label: "Status",
            type: "select",
            options: [
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ],
          },
        ]}
      />

      <div className="overflow-x-auto rounded-lg border bg-background">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50 text-left">
            <tr>
              <th className="px-4 py-3 w-12">#</th>
              <th className="px-4 py-3 w-16">Image</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Sort</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}><td colSpan={7} className="px-4 py-3"><Skeleton className="h-6 w-full" /></td></tr>
              ))}
            {!loading && items.length === 0 && (
              <tr><td colSpan={7}><EmptyState title="No categories found" /></td></tr>
            )}
            {!loading && items.map((item, idx) => (
              <tr key={item._id} className="border-b">
                <td className="px-4 py-3 text-muted-foreground">{(page - 1) * 10 + idx + 1}</td>
                <td className="px-4 py-3">
                  <div className="flex size-11 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                    {(() => {
                      const url = getImageUrl(item as { image?: Category["image"] });
                      return url ? (
                        <img src={url} alt={item.name} className="size-full object-cover" />
                      ) : (
                        <ImageIcon className="size-5 text-muted-foreground" />
                      );
                    })()}
                  </div>
                </td>
                <td className="px-4 py-3 font-medium">{item.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{item.slug}</td>
                <td className="px-4 py-3">{item.sortOrder}</td>
                <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => openEdit(item)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setDeleteId(item._id)}>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Category" : "Add Category"}</DialogTitle>
          </DialogHeader>
          <CategoryForm
            key={editing?._id || "new"}
            initialData={editing || undefined}
            loading={saving}
            onSubmit={handleSubmit}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete category?"
        description="This action cannot be undone."
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default function AdminCategoriesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CategoriesPageContent />
    </Suspense>
  );
}
