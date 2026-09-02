"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Upload, Image, Video } from "lucide-react";
import LoadingButton from "@/components/LoadingButton";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { getAllBrandsForSelect, getAllCategoriesForSelect } from "@/lib/admin/services";
import { Brand, Category, Product, ProductImageData, ProductVideo } from "@/lib/admin/types";
import {
  ALLOWED_IMAGE_ACCEPT,
  ALLOWED_VIDEO_ACCEPT,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_DURATION_SECONDS,
  MAX_VIDEO_SIZE,
  PRODUCT_IMAGE_RECOMMENDED_LABEL,
  formatBytes,
  getVideoDuration,
} from "@/lib/media-limits";
import { useToast } from "@/hooks/use-toast";

const productSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().optional(),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  seoTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(320).optional(),
  primaryImageAlt: z.string().max(200).optional(),
  price: z.coerce.number().min(0, "Price must be 0 or more"),
  salePrice: z.coerce.number().min(0).optional().or(z.literal("")),
  sku: z.string().optional(),
  stock: z.coerce.number().int().min(0),
  category: z.string().optional(),
  brand: z.string().optional(),
  tags: z.string().optional(),
  colors: z.string().optional(),
  sizes: z.string().optional(),
  status: z.enum(["draft", "active", "archived"]),
  ribbon: z.string().optional(),
  featured: z.boolean(),
  newArrival: z.boolean(),
  bestSeller: z.boolean(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: Product;
  loading?: boolean;
  onSubmit: (values: FormData) => Promise<void>;
  onCancel: () => void;
}

function splitCsv(value?: string) {
  return value
    ? value.split(",").map((item) => item.trim()).filter(Boolean)
    : [];
}

export default function ProductForm({
  initialData,
  loading,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  const [primaryFile, setPrimaryFile] = useState<File | null>(null);
  const [primaryPreview, setPrimaryPreview] = useState<string>("");
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [existingGallery, setExistingGallery] = useState<ProductImageData[]>([]);
  const [galleryAlts, setGalleryAlts] = useState<Record<string, string>>({});
  const [newGalleryAlts, setNewGalleryAlts] = useState<string[]>([]);
  const [removedGalleryIds, setRemovedGalleryIds] = useState<string[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>("");
  const [existingVideo, setExistingVideo] = useState<ProductVideo | null>(null);
  const [removeVideo, setRemoveVideo] = useState(false);
  const [videoError, setVideoError] = useState("");

  const primaryInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      shortDescription: initialData?.shortDescription || "",
      description: initialData?.description || "",
      seoTitle: initialData?.seoTitle || "",
      metaDescription: initialData?.metaDescription || "",
      primaryImageAlt: initialData?.images?.primary?.alt || "",
      price: initialData?.price || 0,
      salePrice: initialData?.salePrice || "",
      sku: initialData?.sku || "",
      stock: initialData?.stock ?? 0,
      category:
        typeof initialData?.category === "object"
          ? initialData.category._id
          : initialData?.category || "",
      brand:
        typeof initialData?.brand === "object"
          ? initialData.brand._id
          : initialData?.brand || "",
      tags: initialData?.tags?.join(", ") || "",
      colors: initialData?.colors?.join(", ") || "",
      sizes: initialData?.sizes?.join(", ") || "",
      status: initialData?.status || "draft",
      ribbon: initialData?.ribbon || "",
      featured: initialData?.featured || false,
      newArrival: initialData?.newArrival || false,
      bestSeller: initialData?.bestSeller || false,
    },
  });

  useEffect(() => {
    Promise.all([getAllCategoriesForSelect(), getAllBrandsForSelect()]).then(
      ([cats, brs]) => {
        setCategories(cats.data);
        setBrands(brs.data);
      },
    );
  }, []);

  useEffect(() => {
    if (initialData?.images) {
      const imgs = initialData.images;
      if (imgs.primary?.url) {
        setPrimaryPreview(imgs.primary.url);
      }
      if (imgs.gallery?.length) {
        setExistingGallery(imgs.gallery);
        const alts: Record<string, string> = {};
        for (const img of imgs.gallery) {
          if (img.publicId) alts[img.publicId] = img.alt || "";
        }
        setGalleryAlts(alts);
      }
    }
    if (initialData?.video?.url) {
      setExistingVideo(initialData.video);
      setVideoPreview(initialData.video.url);
    }
  }, [initialData]);

  function handlePrimaryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_IMAGE_SIZE) {
      toast({
        title: "Image too large",
        description: `Maximum size is ${formatBytes(MAX_IMAGE_SIZE)}.`,
        variant: "destructive",
      });
      e.target.value = "";
      return;
    }
    setPrimaryFile(file);
    setPrimaryPreview(URL.createObjectURL(file));
  }

  function removePrimary() {
    setPrimaryFile(null);
    setPrimaryPreview("");
    if (primaryInputRef.current) primaryInputRef.current.value = "";
  }

  function handleGalleryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const valid: File[] = [];
    for (const file of files) {
      if (file.size > MAX_IMAGE_SIZE) {
        toast({
          title: "Image too large",
          description: `"${file.name}" exceeds ${formatBytes(MAX_IMAGE_SIZE)}.`,
          variant: "destructive",
        });
        continue;
      }
      valid.push(file);
    }

    if (!valid.length) {
      e.target.value = "";
      return;
    }

    setGalleryFiles((prev) => [...prev, ...valid]);
    const previews = valid.map((f) => URL.createObjectURL(f));
    setGalleryPreviews((prev) => [...prev, ...previews]);
    setNewGalleryAlts((prev) => [...prev, ...valid.map(() => "")]);
    e.target.value = "";
  }

  function removeNewGallery(index: number) {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
    setNewGalleryAlts((prev) => prev.filter((_, i) => i !== index));
  }

  function removeExistingGallery(publicId: string) {
    setExistingGallery((prev) => prev.filter((img) => img.publicId !== publicId));
    setRemovedGalleryIds((prev) => [...prev, publicId]);
    setGalleryAlts((prev) => {
      const next = { ...prev };
      delete next[publicId];
      return next;
    });
  }

  async function handleVideoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setVideoError("");

    if (file.size > MAX_VIDEO_SIZE) {
      setVideoError(`Video too large. Maximum size is ${formatBytes(MAX_VIDEO_SIZE)}.`);
      e.target.value = "";
      return;
    }

    try {
      const duration = await getVideoDuration(file);
      if (duration > MAX_VIDEO_DURATION_SECONDS) {
        setVideoError(
          `Video is too long (${Math.round(duration)}s). Maximum duration is ${MAX_VIDEO_DURATION_SECONDS} seconds.`,
        );
        e.target.value = "";
        return;
      }
    } catch (err) {
      setVideoError(err instanceof Error ? err.message : "Could not read video.");
      e.target.value = "";
      return;
    }

    if (videoPreview && videoFile) {
      URL.revokeObjectURL(videoPreview);
    }

    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
    setExistingVideo(null);
    setRemoveVideo(false);
  }

  function clearVideo() {
    if (videoFile && videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoFile(null);
    setVideoPreview("");
    setExistingVideo(null);
    setRemoveVideo(true);
    setVideoError("");
    if (videoInputRef.current) videoInputRef.current.value = "";
  }

  async function handleSubmit(values: ProductFormValues) {
    const formData = new FormData();

    formData.append("title", values.title);
    if (values.slug) formData.append("slug", values.slug);
    if (values.shortDescription) formData.append("shortDescription", values.shortDescription);
    if (values.description) formData.append("description", values.description);
    formData.append("seoTitle", values.seoTitle || "");
    formData.append("metaDescription", values.metaDescription || "");
    formData.append("primaryImageAlt", values.primaryImageAlt || "");
    formData.append("galleryAlts", JSON.stringify(galleryAlts));
    if (newGalleryAlts.length) {
      formData.append("newGalleryAlts", JSON.stringify(newGalleryAlts));
    }
    formData.append("price", String(values.price));
    if (values.salePrice !== "" && values.salePrice !== undefined)
      formData.append("salePrice", String(values.salePrice));
    if (values.sku) formData.append("sku", values.sku);
    formData.append("stock", String(values.stock));
    if (values.category) formData.append("category", values.category);
    if (values.brand) formData.append("brand", values.brand);
    formData.append("status", values.status);
    if (values.ribbon) formData.append("ribbon", values.ribbon);
    formData.append("featured", String(values.featured));
    formData.append("newArrival", String(values.newArrival));
    formData.append("bestSeller", String(values.bestSeller));

    const tags = splitCsv(values.tags);
    tags.forEach((t) => formData.append("tags", t));
    const colors = splitCsv(values.colors);
    colors.forEach((c) => formData.append("colors", c));
    const sizes = splitCsv(values.sizes);
    sizes.forEach((s) => formData.append("sizes", s));

    if (primaryFile) {
      formData.append("primaryImage", primaryFile);
    }

    galleryFiles.forEach((file) => {
      formData.append("galleryImages", file);
    });

    if (videoFile) {
      formData.append("productVideo", videoFile);
    }

    if (initialData) {
      if (existingGallery.length) {
        formData.append("keepGallery", JSON.stringify(existingGallery));
      }
      if (removedGalleryIds.length) {
        formData.append("removedGalleryIds", JSON.stringify(removedGalleryIds));
      }
      if (removeVideo && !videoFile) {
        formData.append("removeVideo", "true");
      }
    }

    await onSubmit(formData);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Product title" />
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
                <FormLabel>Slug (optional)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="auto-generated if empty" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (KES)</FormLabel>
                <FormControl>
                  <Input type="number" min={0} step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="salePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sale Price</FormLabel>
                <FormControl>
                  <Input type="number" min={0} step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock</FormLabel>
                <FormControl>
                  <Input type="number" min={0} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select value={field.value || "none"} onValueChange={(v) => field.onChange(v === "none" ? "" : v)}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand</FormLabel>
                <Select value={field.value || "none"} onValueChange={(v) => field.onChange(v === "none" ? "" : v)}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {brands.map((brand) => (
                      <SelectItem key={brand._id} value={brand._id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
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
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="ribbon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ribbon</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. New, Sale" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Image Upload Section */}
        <div className="space-y-4 rounded-lg border p-4">
          <h3 className="text-sm font-medium">Product Images</h3>

          {/* Primary Image */}
          <div className="space-y-2">
            <FormLabel>Primary Image</FormLabel>
            <div className="flex items-start gap-4">
              <div className="relative flex aspect-[4/5] w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                {primaryPreview ? (
                  <>
                    <img
                      src={primaryPreview}
                      alt="Primary preview"
                      className="size-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={removePrimary}
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
                  ref={primaryInputRef}
                  type="file"
                  accept={ALLOWED_IMAGE_ACCEPT}
                  onChange={handlePrimaryChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => primaryInputRef.current?.click()}
                >
                  <Upload className="mr-2 size-4" />
                  {primaryPreview ? "Change Image" : "Upload Image"}
                </Button>
                <p className="mt-1 text-xs text-muted-foreground">
                  JPG, PNG or WebP. Recommended: {PRODUCT_IMAGE_RECOMMENDED_LABEL}. Max{" "}
                  {formatBytes(MAX_IMAGE_SIZE)}. Rename files with keywords before upload
                  (e.g. hp-laserjet-m236sdw-printer.jpg).
                </p>
              </div>
            </div>
            <FormField
              control={form.control}
              name="primaryImageAlt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Image Alt Text</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g. HP LaserJet M236SDW Wireless All-in-One Printer"
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Describe the image using the main keyword.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Gallery Images */}
          <div className="space-y-2">
            <FormLabel>Gallery Images</FormLabel>
            <div className="flex flex-wrap gap-3">
              {existingGallery.map((img) => (
                <div
                  key={img.publicId || img.url}
                  className="w-40 space-y-1"
                >
                  <div className="relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-lg border bg-muted">
                    <img
                      src={img.url}
                      alt={img.alt || "Gallery"}
                      className="size-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingGallery(img.publicId || "")}
                      className="absolute right-0.5 top-0.5 flex size-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                  <Input
                    value={galleryAlts[img.publicId || ""] || ""}
                    onChange={(e) =>
                      setGalleryAlts((prev) => ({
                        ...prev,
                        [img.publicId || ""]: e.target.value,
                      }))
                    }
                    placeholder="Alt text"
                    className="h-8 text-xs"
                  />
                </div>
              ))}
              {galleryPreviews.map((preview, index) => (
                <div key={`new-${index}`} className="w-40 space-y-1">
                  <div className="relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-lg border bg-muted">
                    <img
                      src={preview}
                      alt="Gallery preview"
                      className="size-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewGallery(index)}
                      className="absolute right-0.5 top-0.5 flex size-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                  <Input
                    value={newGalleryAlts[index] || ""}
                    onChange={(e) =>
                      setNewGalleryAlts((prev) => {
                        const next = [...prev];
                        next[index] = e.target.value;
                        return next;
                      })
                    }
                    placeholder="Alt text"
                    className="h-8 text-xs"
                  />
                </div>
              ))}
              <input
                ref={galleryInputRef}
                type="file"
                accept={ALLOWED_IMAGE_ACCEPT}
                multiple
                onChange={handleGalleryChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="flex aspect-[4/5] w-16 items-center justify-center rounded-lg border border-dashed bg-muted/50 text-muted-foreground transition-colors hover:bg-muted"
              >
                <Upload className="size-6" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              JPG, PNG or WebP. Recommended: {PRODUCT_IMAGE_RECOMMENDED_LABEL}. Max{" "}
              {formatBytes(MAX_IMAGE_SIZE)} each. Add up to 10 gallery images.
            </p>
          </div>

          {/* Product Video */}
          <div className="space-y-2 border-t pt-4">
            <FormLabel>Product Video</FormLabel>
            <div className="flex items-start gap-4">
              <div className="relative flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                {videoPreview ? (
                  <>
                    <video
                      src={videoPreview}
                      className="size-full object-cover"
                      muted
                      playsInline
                      preload="metadata"
                    />
                    <button
                      type="button"
                      onClick={clearVideo}
                      className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow"
                    >
                      <X className="size-3" />
                    </button>
                  </>
                ) : (
                  <Video className="size-8 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <input
                  ref={videoInputRef}
                  type="file"
                  accept={ALLOWED_VIDEO_ACCEPT}
                  onChange={handleVideoChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => videoInputRef.current?.click()}
                >
                  <Upload className="mr-2 size-4" />
                  {videoPreview ? "Change Video" : "Upload Video"}
                </Button>
                <p className="mt-1 text-xs text-muted-foreground">
                  MP4, WebM or MOV. Max {formatBytes(MAX_VIDEO_SIZE)}, up to{" "}
                  {MAX_VIDEO_DURATION_SECONDS}s (recommended for product pages).
                </p>
                {(existingVideo?.duration || videoFile) && !videoError && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {existingVideo?.duration
                      ? `Current duration: ${Math.round(existingVideo.duration)}s`
                      : null}
                  </p>
                )}
                {videoError ? (
                  <p className="mt-1 text-xs text-destructive">{videoError}</p>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <FormField
          control={form.control}
          name="shortDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Short Description</FormLabel>
              <FormControl>
                <Textarea rows={2} {...field} />
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
                <Textarea rows={5} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4 rounded-lg border p-4">
          <div>
            <h3 className="text-sm font-medium">SEO</h3>
            <p className="text-xs text-muted-foreground">
              Leave blank to auto-generate from title and short description on the storefront.
            </p>
          </div>
          <FormField
            control={form.control}
            name="seoTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SEO Title</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Keyword first · 50–60 characters"
                    maxLength={70}
                  />
                </FormControl>
                <p
                  className={`text-xs ${(field.value?.length || 0) > 60 ? "text-amber-600" : "text-muted-foreground"}`}
                >
                  {(field.value?.length || 0)}/60 recommended (max 70). Example: HP LaserJet
                  M236SDW Wireless Printer | Yuricart Kenya
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
                  <Textarea
                    rows={3}
                    {...field}
                    placeholder="Include the main keyword once · 150–160 characters"
                    maxLength={320}
                  />
                </FormControl>
                <p
                  className={`text-xs ${(field.value?.length || 0) > 160 ? "text-amber-600" : "text-muted-foreground"}`}
                >
                  {(field.value?.length || 0)}/160 recommended (max 320)
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags (comma separated)</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="colors"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Colors (comma separated)</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sizes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sizes (comma separated)</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-wrap gap-6">
          <FormField
            control={form.control}
            name="featured"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="!mt-0">Featured</FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="newArrival"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="!mt-0">New Arrival</FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bestSeller"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="!mt-0">Best Seller</FormLabel>
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-3">
          <LoadingButton type="submit" loading={!!loading}>
            Save Product
          </LoadingButton>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
