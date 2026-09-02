import Badge from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  inactive: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  draft: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  archived: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  paid: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  refunded: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  processing: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  shipped: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge className={cn("capitalize", statusStyles[status] || "", className)}>
      {status}
    </Badge>
  );
}
