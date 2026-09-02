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
import { Banner, getImageUrl } from "@/lib/admin/types";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
  slug: z.string().optional(),
  link: z.string().optional(),
  status: z.enum(["active", "inactive"]),
  sortOrder: z.coerce.number().int(),
  placement: z.enum(["hero", "promo"]),
});

type FormValues = z.infer<typeof schema>;

interface BannerFormProps {
  initialData?: Banner;
  loading?: boolean;
  onSubmit: (values: FormData) => Promise<void>;
  onCancel: () => void;
}

export default function BannerForm({ initialData, loading, onSubmit, onCancel }: BannerFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(
    initialData ? getImageUrl(initialData) : "",
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initialData?.title || "",
      subtitle: initialData?.subtitle || "",
      slug: initialData?.slug || "",
      link: initialData?.link || "",
      status: initialData?.status || "active",
      sortOrder: initialData?.sortOrder ?? 0,
      placement: initialData?.placement || "hero",
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
    setPreview(
      initialData ? getImageUrl(initialData) : "",
    );
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleSubmit(values: FormValues) {
    const formData = new FormData();
    formData.append("title", values.title);
    if (values.subtitle) formData.append("subtitle", values.subtitle);
    if (values.slug) formData.append("slug", values.slug);
    if (values.link) formData.append("link", values.link);
    formData.append("status", values.status);
    formData.append("sortOrder", String(values.sortOrder));
    formData.append("placement", values.placement);
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
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="subtitle" render={({ field }) => (
          <FormItem><FormLabel>Subtitle</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="slug" render={({ field }) => (
          <FormItem><FormLabel>Slug</FormLabel><FormControl><Input {...field} placeholder="auto-generated" /></FormControl><FormMessage /></FormItem>
        )} />

        <div className="space-y-2">
          <FormLabel>Image</FormLabel>
          <div className="flex items-start gap-4">
            <div className="relative flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
              {preview ? (
                <>
                  <img src={preview} alt="Preview" className="size-full object-cover" />
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
                JPG, PNG or WebP. Max 5MB.
              </p>
            </div>
          </div>
        </div>

        <FormField control={form.control} name="link" render={({ field }) => (
          <FormItem><FormLabel>Link URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="placement" render={({ field }) => (
            <FormItem><FormLabel>Placement</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="hero">Hero</SelectItem>
                  <SelectItem value="promo">Promo</SelectItem>
                </SelectContent>
              </Select><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="status" render={({ field }) => (
            <FormItem><FormLabel>Status</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select><FormMessage /></FormItem>
          )} />
        </div>
        <FormField control={form.control} name="sortOrder" render={({ field }) => (
          <FormItem><FormLabel>Sort Order</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <div className="flex gap-2">
          <LoadingButton type="submit" loading={!!loading}>Save</LoadingButton>
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </form>
    </Form>
  );
}
