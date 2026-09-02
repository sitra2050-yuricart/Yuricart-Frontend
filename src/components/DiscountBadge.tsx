import Badge from "./ui/badge";

interface DiscountBadgeProps {
  data: { type?: string; value?: number };
}

export default function DiscountBadge({ data }: DiscountBadgeProps) {
  if (data.type !== "PERCENT" || !data.value) {
    return null;
  }

  return <Badge>-{data.value}%</Badge>;
}
