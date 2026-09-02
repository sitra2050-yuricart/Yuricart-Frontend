"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ArrowDown,
  ArrowUp,
  ImageIcon,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import DeleteConfirmDialog from "@/components/admin/DeleteConfirmDialog";
import LoadingButton from "@/components/LoadingButton";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  createAdminHeroSlide,
  deleteAdminHeroSlide,
  getAdminHomepage,
  getAllCategoriesForSelect,
  reorderAdminHeroSlides,
  updateAdminFeaturedSections,
  updateAdminHeroSlide,
  upsertAdminHomepageBanner,
} from "@/lib/admin/services";
import {
  Category,
  FeaturedSectionConfig,
  HomepageBannerSlot,
} from "@/lib/admin/types";

const SLOT_LABELS: Record<string, string> = {
  "1": "Card 1",
  "2": "Card 2",
  "3": "Card 3",
  left1: "Left Banner 1",
  left2: "Left Banner 2",
  left3: "Left Banner 3",
  left4: "Left Banner 4",
};

type PendingSaver = {
  isDirty: () => boolean;
  save: () => Promise<void>;
};

type PendingSaveApi = {
  register: (id: string, saver: PendingSaver) => void;
  unregister: (id: string) => void;
  saveAllPending: () => Promise<void>;
};

const PendingSaveContext = createContext<PendingSaveApi | null>(null);

function usePendingSave() {
  const ctx = useContext(PendingSaveContext);
  if (!ctx) throw new Error("usePendingSave must be used within provider");
  return ctx;
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border bg-card p-5 shadow-sm">
      <div className="mb-4 border-b pb-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

function SlotEditor({
  item,
  section,
  label,
  saving,
}: {
  item: HomepageBannerSlot;
  section: string;
  label: string;
  saving: boolean;
}) {
  const { register, unregister, saveAllPending } = usePendingSave();
  const [link, setLink] = useState(item.link || "");
  const [active, setActive] = useState(item.active !== false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(item.imageUrl || "");
  const inputRef = useRef<HTMLInputElement>(null);
  const [localSaving, setLocalSaving] = useState(false);
  const stateRef = useRef({ link, active, file, item, section });
  stateRef.current = { link, active, file, item, section };

  useEffect(() => {
    setLink(item.link || "");
    setActive(item.active !== false);
    setPreview(item.imageUrl || "");
    setFile(null);
  }, [item]);

  useEffect(() => {
    const id = `slot:${section}:${item.slot}`;
    register(id, {
      isDirty: () => {
        const s = stateRef.current;
        return (
          !!s.file ||
          s.link !== (s.item.link || "") ||
          s.active !== (s.item.active !== false)
        );
      },
      save: async () => {
        const s = stateRef.current;
        const dirty =
          !!s.file ||
          s.link !== (s.item.link || "") ||
          s.active !== (s.item.active !== false);
        if (!dirty) return;
        const fd = new FormData();
        fd.append("link", s.link);
        fd.append("active", String(s.active));
        if (s.file) fd.append("image", s.file);
        await upsertAdminHomepageBanner(s.section, s.item.slot, fd);
      },
    });
    return () => unregister(id);
  }, [section, item.slot, register, unregister]);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleSave() {
    setLocalSaving(true);
    try {
      await saveAllPending();
    } finally {
      setLocalSaving(false);
    }
  }

  const dirty =
    !!file || link !== (item.link || "") || active !== (item.active !== false);

  const isSmallGridSlot = ["left1", "left2", "left3", "left4"].includes(
    item.slot,
  );
  const previewAspect = isSmallGridSlot ? "aspect-[3/2]" : "aspect-video";

  return (
    <div
      className={`rounded-md border p-4 ${dirty ? "border-primary/50 ring-1 ring-primary/20" : ""}`}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium">
          {label}
          {dirty && (
            <span className="ml-2 text-xs font-normal text-primary">Unsaved</span>
          )}
        </h3>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <Checkbox
            checked={active}
            onCheckedChange={(v) => setActive(v === true)}
          />
          Active
        </label>
      </div>
      <div
        className={`mb-3 flex items-center justify-center overflow-hidden rounded-md border bg-muted ${previewAspect}`}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt={label} className="h-full w-full object-cover" />
        ) : (
          <ImageIcon className="size-8 text-muted-foreground" />
        )}
      </div>
      {isSmallGridSlot && (
        <p className="mb-3 text-xs text-muted-foreground">
          Recommended size: 1080×720 (3:2)
        </p>
      )}
      <div className="space-y-3">
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFile}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="mr-2 size-4" />
            {preview ? "Replace Image" : "Upload Image"}
          </Button>
          {file && (
            <button
              type="button"
              className="mt-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => {
                setFile(null);
                setPreview(item.imageUrl || "");
                if (inputRef.current) inputRef.current.value = "";
              }}
            >
              <X className="size-3" /> Clear selection
            </button>
          )}
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Destination URL</Label>
          <Input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="/shop or https://..."
          />
        </div>
        <LoadingButton
          type="button"
          size="sm"
          className="w-full"
          loading={localSaving || saving}
          onClick={handleSave}
        >
          Save
        </LoadingButton>
      </div>
    </div>
  );
}

function HeroSlideRow({
  slide,
  index,
  total,
  saving,
  onMove,
  onDelete,
}: {
  slide: HomepageBannerSlot;
  index: number;
  total: number;
  saving: boolean;
  onMove: (index: number, direction: -1 | 1) => void;
  onDelete: () => void;
}) {
  const { register, unregister, saveAllPending } = usePendingSave();
  const [link, setLink] = useState(slide.link || "");
  const [active, setActive] = useState(slide.active !== false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(slide.imageUrl || "");
  const inputRef = useRef<HTMLInputElement>(null);
  const [localSaving, setLocalSaving] = useState(false);
  const stateRef = useRef({ link, active, file, slide });
  stateRef.current = { link, active, file, slide };

  useEffect(() => {
    setLink(slide.link || "");
    setActive(slide.active !== false);
    setPreview(slide.imageUrl || "");
    setFile(null);
  }, [slide]);

  useEffect(() => {
    if (!slide.id) return;
    const id = `hero:${slide.id}`;
    register(id, {
      isDirty: () => {
        const s = stateRef.current;
        return (
          !!s.file ||
          s.link !== (s.slide.link || "") ||
          s.active !== (s.slide.active !== false)
        );
      },
      save: async () => {
        const s = stateRef.current;
        if (!s.slide.id) return;
        const dirty =
          !!s.file ||
          s.link !== (s.slide.link || "") ||
          s.active !== (s.slide.active !== false);
        if (!dirty) return;
        const fd = new FormData();
        fd.append("link", s.link);
        fd.append("active", String(s.active));
        if (s.file) fd.append("image", s.file);
        await updateAdminHeroSlide(s.slide.id, fd);
      },
    });
    return () => unregister(id);
  }, [slide.id, register, unregister]);

  async function handleSave() {
    setLocalSaving(true);
    try {
      await saveAllPending();
    } finally {
      setLocalSaving(false);
    }
  }

  const dirty =
    !!file ||
    link !== (slide.link || "") ||
    active !== (slide.active !== false);

  return (
    <div
      className={`flex flex-col gap-4 rounded-md border p-4 md:flex-row ${
        dirty ? "border-primary/50 ring-1 ring-primary/20" : ""
      }`}
    >
      <div className="flex aspect-video w-full shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted md:w-56">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt={`Slide ${index + 1}`} className="h-full w-full object-cover" />
        ) : (
          <ImageIcon className="size-8 text-muted-foreground" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">
            Slide {index + 1}
            {dirty && (
              <span className="ml-2 text-xs font-normal text-primary">Unsaved</span>
            )}
          </span>
          <label className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
            <Checkbox
              checked={active}
              onCheckedChange={(v) => setActive(v === true)}
            />
            Active
          </label>
        </div>
        <Input
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="Destination URL"
        />
        <div className="flex flex-wrap gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              setFile(f);
              setPreview(URL.createObjectURL(f));
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="mr-2 size-4" />
            Image
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={index === 0 || saving}
            onClick={() => onMove(index, -1)}
          >
            <ArrowUp className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={index >= total - 1 || saving}
            onClick={() => onMove(index, 1)}
          >
            <ArrowDown className="size-4" />
          </Button>
          <Button type="button" variant="destructive" size="sm" onClick={onDelete}>
            <Trash2 className="size-4" />
          </Button>
          <LoadingButton
            type="button"
            size="sm"
            loading={localSaving || saving}
            onClick={handleSave}
          >
            Save
          </LoadingButton>
        </div>
      </div>
    </div>
  );
}

export default function AdminHomepagePage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [heroSlides, setHeroSlides] = useState<HomepageBannerSlot[]>([]);
  const [promoCards, setPromoCards] = useState<HomepageBannerSlot[]>([]);
  const [mobileBanners, setMobileBanners] = useState<HomepageBannerSlot[]>([]);
  const [laptopBanners, setLaptopBanners] = useState<HomepageBannerSlot[]>([]);
  const [smartBanners, setSmartBanners] = useState<HomepageBannerSlot[]>([]);
  const [desktopBanners, setDesktopBanners] = useState<HomepageBannerSlot[]>([]);
  const [featuredSections, setFeaturedSections] = useState<FeaturedSectionConfig[]>([]);
  const [featuredBaseline, setFeaturedBaseline] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [deleteHeroId, setDeleteHeroId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const heroFileRef = useRef<HTMLInputElement>(null);
  const pendingSaversRef = useRef(new Map<string, PendingSaver>());
  const featuredRef = useRef(featuredSections);
  featuredRef.current = featuredSections;
  const featuredBaselineRef = useRef(featuredBaseline);
  featuredBaselineRef.current = featuredBaseline;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data }, cats] = await Promise.all([
        getAdminHomepage(),
        getAllCategoriesForSelect(),
      ]);
      setHeroSlides(data.heroSlides);
      setPromoCards(data.promoCards);
      setMobileBanners(data.mobileBanners);
      setLaptopBanners(data.laptopBanners);
      setSmartBanners(data.smartBanners);
      setDesktopBanners(data.desktopBanners);
      setFeaturedSections(data.featuredSections);
      setFeaturedBaseline(JSON.stringify(data.featuredSections));
      setCategories(cats.data);
    } catch (error) {
      toast({
        title: "Failed to load homepage data",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const register = useCallback((id: string, saver: PendingSaver) => {
    pendingSaversRef.current.set(id, saver);
  }, []);

  const unregister = useCallback((id: string) => {
    pendingSaversRef.current.delete(id);
  }, []);

  const saveAllPending = useCallback(async () => {
    setSaving(true);
    try {
      const dirtySavers = [...pendingSaversRef.current.entries()].filter(([, s]) =>
        s.isDirty(),
      );
      const featuredDirty =
        JSON.stringify(featuredRef.current) !== featuredBaselineRef.current;

      if (dirtySavers.length === 0 && !featuredDirty) {
        toast({ title: "No changes to save" });
        return;
      }

      await Promise.all(dirtySavers.map(([, s]) => s.save()));

      if (featuredDirty) {
        const { data } = await updateAdminFeaturedSections(featuredRef.current);
        setFeaturedSections(data);
        setFeaturedBaseline(JSON.stringify(data));
      }

      const total = dirtySavers.length + (featuredDirty ? 1 : 0);
      toast({
        title: total === 1 ? "Saved" : `Saved ${total} items`,
        description:
          total > 1
            ? "All unsaved banner, slide, and settings changes were saved together."
            : undefined,
      });
      await load();
    } catch (error) {
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, [load, toast]);

  const pendingApi: PendingSaveApi = {
    register,
    unregister,
    saveAllPending,
  };

  async function handleAddHero(file?: File) {
    setSaving(true);
    try {
      // Persist other dirty edits first so a reload does not wipe them
      const dirtySavers = [...pendingSaversRef.current.entries()].filter(([, s]) =>
        s.isDirty(),
      );
      if (dirtySavers.length) {
        await Promise.all(dirtySavers.map(([, s]) => s.save()));
      }

      const fd = new FormData();
      fd.append("link", "");
      fd.append("active", "true");
      if (file) fd.append("image", file);
      await createAdminHeroSlide(fd);
      toast({
        title: "Slide added",
        description: dirtySavers.length
          ? `Also saved ${dirtySavers.length} pending change${dirtySavers.length > 1 ? "s" : ""}.`
          : undefined,
      });
      await load();
    } catch (error) {
      toast({
        title: "Failed to add slide",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
      if (heroFileRef.current) heroFileRef.current.value = "";
    }
  }

  async function handleDeleteHero() {
    if (!deleteHeroId) return;
    setDeleting(true);
    try {
      const dirtySavers = [...pendingSaversRef.current.entries()].filter(
        ([id, s]) => id !== `hero:${deleteHeroId}` && s.isDirty(),
      );
      if (dirtySavers.length) {
        await Promise.all(dirtySavers.map(([, s]) => s.save()));
      }

      await deleteAdminHeroSlide(deleteHeroId);
      toast({ title: "Slide deleted" });
      setDeleteHeroId(null);
      await load();
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

  async function moveHero(index: number, direction: -1 | 1) {
    const next = index + direction;
    if (next < 0 || next >= heroSlides.length) return;

    setSaving(true);
    try {
      const dirtySavers = [...pendingSaversRef.current.entries()].filter(([, s]) =>
        s.isDirty(),
      );
      if (dirtySavers.length) {
        await Promise.all(dirtySavers.map(([, s]) => s.save()));
      }

      const ids = heroSlides.map((s) => s.id!).filter(Boolean);
      const tmp = ids[index];
      ids[index] = ids[next];
      ids[next] = tmp;
      const { data } = await reorderAdminHeroSlides(ids);
      setHeroSlides(data);
      toast({ title: "Order updated" });
      if (dirtySavers.length) await load();
    } catch (error) {
      toast({
        title: "Reorder failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  function updateFeatured(index: number, patch: Partial<FeaturedSectionConfig>) {
    setFeaturedSections((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  }

  function renderSlotGrid(
    section: string,
    items: HomepageBannerSlot[],
    columns = "sm:grid-cols-2 lg:grid-cols-3",
    className = "",
  ) {
    return (
      <div className={`grid grid-cols-1 gap-4 ${columns} ${className}`}>
        {items.map((item) => (
          <SlotEditor
            key={`${section}-${item.slot}`}
            item={item}
            section={section}
            label={SLOT_LABELS[item.slot] || item.slot}
            saving={saving}
          />
        ))}
      </div>
    );
  }

  /** Mirrors storefront BannerGrid: 2×2 grid of 4 banners on all devices. */
  function renderHomepageBannerLayout(
    section: string,
    items: HomepageBannerSlot[],
  ) {
    const bySlot = Object.fromEntries(items.map((item) => [item.slot, item]));
    const smallSlots = ["left1", "left2", "left3", "left4"] as const;

    return (
      <div className="mx-auto w-full max-w-5xl grid grid-cols-1 gap-4 sm:grid-cols-2">
        {smallSlots.map((slot) => {
          const item = bySlot[slot];
          if (!item) return null;
          return (
            <SlotEditor
              key={`${section}-${slot}`}
              item={item}
              section={section}
              label={SLOT_LABELS[slot] || slot}
              saving={saving}
            />
          );
        })}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const featuredDirty = JSON.stringify(featuredSections) !== featuredBaseline;

  return (
    <PendingSaveContext.Provider value={pendingApi}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <PageHeader
            title="Homepage Management"
            description="Manage homepage images and links only. Layout and section order are fixed. Clicking Save on any item also saves all other unsaved changes."
          />
          <LoadingButton
            className="shrink-0"
            loading={saving}
            onClick={saveAllPending}
          >
            Save all changes
          </LoadingButton>
        </div>

        <SectionCard
          title="Hero Slider"
          description="Multiple slides. Upload image, set destination URL, toggle active, and reorder."
        >
          <div className="mb-4 flex flex-wrap gap-2">
            <input
              ref={heroFileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleAddHero(f);
              }}
            />
            <Button
              type="button"
              onClick={() => heroFileRef.current?.click()}
              disabled={saving}
            >
              <Plus className="mr-2 size-4" />
              Add Slide
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleAddHero()}
              disabled={saving}
            >
              Add Empty Slide
            </Button>
          </div>

          {heroSlides.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hero slides yet.</p>
          ) : (
            <div className="space-y-4">
              {heroSlides.map((slide, index) => (
                <HeroSlideRow
                  key={slide.id}
                  slide={slide}
                  index={index}
                  total={heroSlides.length}
                  saving={saving}
                  onMove={moveHero}
                  onDelete={() => setDeleteHeroId(slide.id)}
                />
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Promotional Cards"
          description="Exactly three cards under the hero. Only images and destination URLs change."
        >
          {renderSlotGrid(
            "promo",
            promoCards,
            "sm:grid-cols-3",
            "mx-auto w-full max-w-5xl",
          )}
        </SectionCard>

        <SectionCard
          title="Mobiles Banner"
          description="Exactly 4 banners (3:2) shown on all devices — mobile and desktop."
        >
          {renderHomepageBannerLayout("mobiles", mobileBanners)}
        </SectionCard>

        <SectionCard
          title="Laptop Banner"
          description="Exactly 4 banners (3:2) shown on all devices — mobile and desktop."
        >
          {renderHomepageBannerLayout("laptops", laptopBanners)}
        </SectionCard>

        <SectionCard
          title="Smart Gadgets Banner"
          description="Exactly 4 banners (3:2) shown on all devices — mobile and desktop."
        >
          {renderHomepageBannerLayout("smart", smartBanners)}
        </SectionCard>

        <SectionCard
          title="Desktop Banner"
          description="Exactly 4 banners (3:2) shown on all devices — mobile and desktop."
        >
          {renderHomepageBannerLayout("desktop", desktopBanners)}
        </SectionCard>

        <SectionCard
          title="Featured Products"
          description="Products are loaded automatically from the Products module. Choose category, limit, and sort."
        >
          <div className="space-y-4">
            {featuredSections.map((section, index) => (
              <div
                key={section.id}
                className={`grid gap-3 rounded-md border p-4 sm:grid-cols-2 lg:grid-cols-4 ${
                  featuredDirty ? "border-primary/40" : ""
                }`}
              >
                <div className="space-y-1 sm:col-span-2 lg:col-span-4">
                  <Label className="text-xs">Section Title</Label>
                  <Input
                    value={section.title}
                    onChange={(e) => updateFeatured(index, { title: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Category</Label>
                  <Select
                    value={section.categorySlug || "__all__"}
                    onValueChange={(v) =>
                      updateFeatured(index, {
                        categorySlug: v === "__all__" ? null : v,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">All / Featured</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat._id} value={cat.slug}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Maximum Products</Label>
                  <Input
                    type="number"
                    min={1}
                    max={50}
                    value={section.limit}
                    onChange={(e) =>
                      updateFeatured(index, {
                        limit: Math.max(1, Number(e.target.value) || 1),
                      })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Sort</Label>
                  <Select
                    value={section.sort}
                    onValueChange={(v) =>
                      updateFeatured(index, {
                        sort: v as FeaturedSectionConfig["sort"],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="featured">Featured</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="price_asc">Price: Low to High</SelectItem>
                      <SelectItem value="price_desc">Price: High to Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
            <LoadingButton loading={saving} onClick={saveAllPending}>
              Save Featured Sections
            </LoadingButton>
          </div>
        </SectionCard>

        <DeleteConfirmDialog
          open={!!deleteHeroId}
          onOpenChange={(open) => !open && setDeleteHeroId(null)}
          onConfirm={handleDeleteHero}
          loading={deleting}
          title="Delete hero slide?"
          description="This will remove the slide and its Cloudinary image. Other unsaved banner changes will be saved first."
        />
      </div>
    </PendingSaveContext.Provider>
  );
}
