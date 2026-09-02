"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface FilterField {
  name: string;
  label: string;
  type: "text" | "select";
  placeholder?: string;
  options?: { value: string; label: string }[];
}

interface AdminFiltersProps {
  fields: FilterField[];
}

export default function AdminFilters({ fields }: AdminFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(name: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(name, value);
    else params.delete(name);
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  }

  function clearFilters() {
    router.push("?");
  }

  return (
    <div className="mb-4 grid gap-3 rounded-lg border bg-background p-4 md:grid-cols-2 lg:grid-cols-4">
      {fields.map((field) =>
        field.type === "select" ? (
          <div key={field.name} className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">{field.label}</label>
            <Select
              value={searchParams.get(field.name) || "all"}
              onValueChange={(value) =>
                updateParam(field.name, value === "all" ? "" : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder || field.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {field.options?.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div key={field.name} className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">{field.label}</label>
            <Input
              defaultValue={searchParams.get(field.name) || ""}
              placeholder={field.placeholder}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  updateParam(field.name, (e.target as HTMLInputElement).value);
                }
              }}
              onBlur={(e) => updateParam(field.name, e.target.value)}
            />
          </div>
        ),
      )}
      <div className="flex items-end">
        <Button variant="outline" onClick={clearFilters}>
          Clear filters
        </Button>
      </div>
    </div>
  );
}
