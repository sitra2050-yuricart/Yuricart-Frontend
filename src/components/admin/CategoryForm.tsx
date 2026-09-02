"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Image, Upload, X } from "lucide-react";
import LoadingButton from "@/components/LoadingButton";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Category, getImageUrl } from "@/lib/admin/types";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  description: z.string().optional(),
  seoTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(320).optional(),
  imageAlt: z.string().max(200).optional(),
  status: z.enum(["active", "inactive"]),
  sortOrder: z.coerce.number().int(),
});

type FormValues = z.infer<typeof schema>;

interface CategoryFormDialogProps {
  initialData?: Category;
  loading?: boolean;
  onSubmit: (values: FormData) => Promise<void>;
  onCancel: () => void;
}

function getImageAlt(category?: Category) {
  if (!category?.image || typeof category.image === "string") return "";
  return category.image.alt || "";
}

export default function CategoryForm({
  initialData,
  loading,
  onSubmit,
  onCancel,
}: CategoryFormDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(
    initialData
      ? getImageUrl(initialData as { image?: Category["image"] })
      : "",
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      seoTitle: initialData?.seoTitle || "",
      metaDescription: initialData?.metaDescription || "",
      imageAlt: getImageAlt(initialData),
      status: initialData?.status || "active",
      sortOrder: initialData?.sortOrder ?? 0,
    },
  });

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function removeFile() {
    setFile(null);
    setPreview(initialData ? getImageUrl(initialData) : "");
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleSubmit(values: FormValues) {
    const formData = new FormData();
    formData.append("name", values.name);
    if (values.slug) formData.append("slug", values.slug);
    formData.append("description", values.description || "");
    formData.append("seoTitle", values.seoTitle || "");
    formData.append("metaDescription", values.metaDescription || "");
    formData.append("imageAlt", values.imageAlt || "");
    formData.append("status", values.status);
    formData.append("sortOrder", String(values.sortOrder));
    if (file) {
      formData.append("image", file);
    }
    if (initialData && !file && !preview) {
      formData.append("image", "");
    }
    await onSubmit(formData);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex max-h-[70vh] flex-col gap-4 overflow-hidden"
      >
        <div className="thin-scrollbar space-y-4 overflow-y-auto p-1">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="auto-generated" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <FormLabel>Image</FormLabel>
            <div className="flex items-start gap-4">
              <div className="relative flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                {preview ? (
                  <>
                    <img
                      src={preview}
                      alt="Preview"
                      className="size-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeFile}
                      className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow"
                    >
                      <X className="size-3" />
                    </button>
                  </>
                ) : (
                  <Image className="size-8 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => inputRef.current?.click()}
                >
                  <Upload className="mr-2 size-4" />
                  {preview ? "Change Image" : "Upload Image"}
                </Button>
                <p className="mt-1 text-xs text-muted-foreground">
                  JPG, PNG or WebP. Max 5MB. Prefer keyword file names before
                  upload.
                </p>
              </div>
            </div>
          </div>

          <FormField
            control={form.control}
            name="imageAlt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image Alt Text</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. Laptops category" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea rows={3} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="text-sm font-medium">SEO</h3>
            <FormField
              control={form.control}
              name="seoTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SEO Title</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="50–60 characters"
                      maxLength={70}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    {field.value?.length || 0}/60 recommended
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="metaDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Description</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} maxLength={320} />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    {field.value?.length || 0}/160 recommended
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sortOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sort Order</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex shrink-0 gap-2 border-t pt-4">
          <LoadingButton type="submit" loading={!!loading}>
            Save
          </LoadingButton>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
