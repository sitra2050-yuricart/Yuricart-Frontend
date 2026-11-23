"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Pencil, Plus, Trash2 } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import EmptyState from "@/components/admin/EmptyState";
import StatusBadge from "@/components/admin/StatusBadge";
import DeleteConfirmDialog from "@/components/admin/DeleteConfirmDialog";
import LoadingButton from "@/components/LoadingButton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  createAdminShippingRule,
  deleteAdminShippingRule,
  getAdminShippingRules,
  updateAdminShippingRule,
} from "@/lib/admin/services";
import {
  analyzeRules,
  buildRulePayload,
  isCatchAll,
  type DeliveryRule,
  type RuleFormValues,
} from "@/lib/delivery-rules";
import { quoteShipping, type ShippingQuote } from "@/lib/api/shipping";
import { formatKes } from "@/lib/product-specs";

const EMPTY_FORM: RuleFormValues = { name: "", rate: "", freeAbove: "", areas: "", active: true };

function toForm(rule: DeliveryRule): RuleFormValues {
  return {
    name: rule.name,
    rate: String(rule.rate),
    freeAbove: rule.freeAbove ? String(rule.freeAbove) : "",
    areas: rule.regions.join("\n"),
    active: rule.status === "active",
  };
}

export default function AdminDeliveryPage() {
  const { toast } = useToast();
  const [rules, setRules] = useState<DeliveryRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [editing, setEditing] = useState<DeliveryRule | "new" | null>(null);
  const [form, setForm] = useState<RuleFormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState<DeliveryRule | null>(null);
  const [deletePending, setDeletePending] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await getAdminShippingRules({ page: 1, limit: 100 });
      setRules(data);
      setLoadError("");
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Could not load the delivery rules.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const health = useMemo(() => analyzeRules(rules), [rules]);

  function openForm(rule: DeliveryRule | "new") {
    setEditing(rule);
    setForm(rule === "new" ? EMPTY_FORM : toForm(rule));
    setErrors({});
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const result = buildRulePayload(form);
    setErrors(result.errors);
    if (!result.payload) return;

    setSaving(true);
    try {
      if (editing === "new") {
        await createAdminShippingRule(result.payload);
        toast({ title: "Delivery rule added" });
      } else if (editing) {
        await updateAdminShippingRule(editing._id, result.payload);
        toast({ title: "Delivery rule saved" });
      }
      setEditing(null);
      await load();
    } catch (error) {
      toast({
        title: "Could not save the rule",
        description: error instanceof Error ? error.message : "Try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    setDeletePending(true);
    try {
      await deleteAdminShippingRule(deleting._id);
      toast({ title: "Delivery rule deleted" });
      setDeleting(null);
      await load();
    } catch (error) {
      toast({
        title: "Could not delete the rule",
        description: error instanceof Error ? error.message : "Try again.",
        variant: "destructive",
      });
    } finally {
      setDeletePending(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Delivery"
        description="What customers pay for delivery. Checkout shows the fee as soon as they enter their city."
        actionLabel="Add delivery rule"
        onAction={() => openForm("new")}
      />

      <HowItWorks />

      {loadError ? (
        <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          {loadError}
        </p>
      ) : null}

      {!loading && !loadError ? (
        <div className="space-y-3">
          {health.noRules ? (
            <Warning tone="red" title="No delivery rules yet">
              Orders are being charged no delivery fee, and checkout tells customers the fee is
              confirmed later. Add a rule below. Start with an &ldquo;everywhere else&rdquo; rule
              (leave the areas empty), then add cheaper rules for places like Nairobi CBD.
            </Warning>
          ) : null}
          {health.noCatchAll ? (
            <Warning tone="amber" title="No “everywhere else” rule">
              A customer whose city is not listed in any rule is charged the cheapest rule&apos;s fee.
              Add a rule with no areas to price every other place correctly.
            </Warning>
          ) : null}
          {health.multipleCatchAll ? (
            <Warning tone="amber" title="More than one “everywhere else” rule">
              Only the cheapest one is ever used. Keep one active, or mark the others inactive.
            </Warning>
          ) : null}
          {health.duplicateAreas.length ? (
            <Warning tone="amber" title="An area is in more than one rule">
              {health.duplicateAreas.join(", ")}: the first matching rule is used, which may not be
              the one you expect.
            </Warning>
          ) : null}
        </div>
      ) : null}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading delivery rules…</p>
      ) : rules.length === 0 && !loadError ? (
        <EmptyState
          title="No delivery rules"
          description="Add your first rule to start charging for delivery."
        />
      ) : (
        <ul className="space-y-3" aria-label="Delivery rules">
          {rules.map((rule) => (
            <li
              key={rule._id}
              className="flex flex-col gap-3 rounded-lg border bg-background p-4 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-semibold">{rule.name}</h2>
                  <StatusBadge status={rule.status} />
                </div>
                <p className="text-sm">
                  <span className="font-semibold">{rule.rate === 0 ? "Free" : formatKes(rule.rate)}</span>
                  {rule.freeAbove ? (
                    <span className="text-muted-foreground"> · free over {formatKes(rule.freeAbove)}</span>
                  ) : null}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isCatchAll(rule) ? (
                    <span className="font-medium text-foreground">Everywhere else</span>
                  ) : (
                    <>Applies to: {rule.regions.join(", ")}</>
                  )}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openForm(rule)}>
                  <Pencil className="mr-1.5 size-4" aria-hidden /> Edit
                  <span className="sr-only"> {rule.name}</span>
                </Button>
                <Button variant="outline" size="sm" onClick={() => setDeleting(rule)}>
                  <Trash2 className="mr-1.5 size-4" aria-hidden /> Delete
                  <span className="sr-only"> {rule.name}</span>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <FeeChecker />

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <form onSubmit={handleSave} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{editing === "new" ? "Add delivery rule" : "Edit delivery rule"}</DialogTitle>
              <DialogDescription>
                Customers type their city at checkout; the rule that lists it sets the fee.
              </DialogDescription>
            </DialogHeader>

            <FormField label="Name" error={errors.name} htmlFor="rule-name">
              <Input
                id="rule-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nairobi CBD"
                aria-invalid={!!errors.name}
              />
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Delivery fee (KES)" error={errors.rate} htmlFor="rule-rate">
                <Input
                  id="rule-rate"
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={form.rate}
                  onChange={(e) => setForm({ ...form, rate: e.target.value })}
                  placeholder="300"
                  aria-invalid={!!errors.rate}
                />
              </FormField>
              <FormField
                label="Free delivery from (KES)"
                hint="Optional. Orders at or above this are free."
                error={errors.freeAbove}
                htmlFor="rule-free"
              >
                <Input
                  id="rule-free"
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={form.freeAbove}
                  onChange={(e) => setForm({ ...form, freeAbove: e.target.value })}
                  placeholder="50000"
                  aria-invalid={!!errors.freeAbove}
                />
              </FormField>
            </div>

            <FormField
              label="Areas"
              hint="One per line. Leave empty for “everywhere else”. Use the names customers type, like Nairobi or Westlands; capital letters do not matter."
              htmlFor="rule-areas"
            >
              <Textarea
                id="rule-areas"
                rows={5}
                value={form.areas}
                onChange={(e) => setForm({ ...form, areas: e.target.value })}
                placeholder={"Nairobi\nNairobi CBD\nWestlands"}
              />
            </FormField>

            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="size-4 accent-primary"
              />
              Active (customers are charged with this rule)
            </label>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditing(null)} disabled={saving}>
                Cancel
              </Button>
              <LoadingButton type="submit" loading={saving}>
                Save rule
              </LoadingButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this delivery rule?"
        description={`"${deleting?.name ?? ""}" will stop applying to orders. This cannot be undone.`}
        loading={deletePending}
        onConfirm={handleDelete}
      />
    </div>
  );
}

function HowItWorks() {
  return (
    <details className="rounded-lg border bg-background p-4 text-sm">
      <summary className="cursor-pointer font-medium">How delivery rules work</summary>
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-muted-foreground">
        <li>The customer types their city at checkout. If a rule lists it under Areas, that rule sets the fee.</li>
        <li>A rule with <strong className="text-foreground">no areas</strong> is &ldquo;everywhere else&rdquo;, used for any city no rule names. Keep exactly one.</li>
        <li>&ldquo;Free delivery from&rdquo; makes the fee 0 once the order reaches that amount.</li>
        <li>The fee shown at checkout is the fee charged, because both use the same rules.</li>
      </ul>
    </details>
  );
}

function Warning({
  tone,
  title,
  children,
}: {
  tone: "red" | "amber";
  title: string;
  children: React.ReactNode;
}) {
  const style =
    tone === "red"
      ? "border-red-300 bg-red-50 text-red-900"
      : "border-amber-300 bg-amber-50 text-amber-900";
  return (
    <div role="alert" className={`flex gap-3 rounded-lg border p-4 text-sm ${style}`}>
      <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden />
      <div className="space-y-1">
        <p className="font-semibold">{title}</p>
        <p>{children}</p>
      </div>
    </div>
  );
}

function FormField({
  label,
  hint,
  error,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

/** Try a city and an order total, and see what checkout would charge. */
function FeeChecker() {
  const [city, setCity] = useState("");
  const [subtotal, setSubtotal] = useState("20000");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<ShippingQuote | null>(null);
  const [error, setError] = useState("");

  async function check(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");
    try {
      setResult(await quoteShipping(Number(subtotal) || 0, city.trim()));
    } catch {
      setResult(null);
      setError("Could not check the fee. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section aria-labelledby="fee-checker" className="space-y-3 rounded-lg border bg-background p-4">
      <h2 id="fee-checker" className="text-base font-semibold">
        Check a fee
      </h2>
      <p className="text-sm text-muted-foreground">
        See what a customer would be charged. Uses the rules that are saved and active.
      </p>
      <form onSubmit={check} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="space-y-1.5">
          <Label htmlFor="check-city">City</Label>
          <Input id="check-city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Westlands" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="check-subtotal">Order total (KES)</Label>
          <Input
            id="check-subtotal"
            type="number"
            min={0}
            inputMode="numeric"
            value={subtotal}
            onChange={(e) => setSubtotal(e.target.value)}
          />
        </div>
        <LoadingButton type="submit" loading={pending} variant="outline">
          Check fee
        </LoadingButton>
      </form>
      <div aria-live="polite" className="text-sm">
        {error ? <p className="text-destructive">{error}</p> : null}
        {result ? (
          result.zone === null && result.shipping === 0 ? (
            <p>
              <strong>No rule applies.</strong> Checkout will say the fee is confirmed later.
            </p>
          ) : (
            <p>
              <strong>{result.shipping === 0 ? "Free delivery" : formatKes(result.shipping)}</strong>
              {result.zone ? ` (${result.zone})` : ""}
            </p>
          )
        ) : null}
      </div>
    </section>
  );
}
