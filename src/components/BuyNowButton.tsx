import { useQuickBuy } from "@/hooks/checkout";
import { cn } from "@/lib/utils";
import { Product } from "@/lib/api/types";
import { CreditCardIcon } from "lucide-react";
import LoadingButton from "./LoadingButton";
import { ButtonProps } from "./ui/button";

interface BuyNowButtonProps extends ButtonProps {
  product: Product;
  quantity: number;
  selectedOptions: Record<string, string>;
  /** Phones: show only the icon (label stays for screen readers and larger screens). */
  iconOnlyOnMobile?: boolean;
}

export default function BuyNowButton({
  product,
  quantity,
  selectedOptions,
  className,
  iconOnlyOnMobile = false,
  ...props
}: BuyNowButtonProps) {
  const { startCheckoutFlow, pending } = useQuickBuy();

  return (
    <LoadingButton
      onClick={() => startCheckoutFlow({ product, quantity, selectedOptions })}
      loading={pending}
      variant="secondary"
      className={cn("flex gap-3", className)}
      {...props}
    >
      <CreditCardIcon className="shrink-0" />
      <span className={cn(iconOnlyOnMobile && "sr-only md:not-sr-only")}>
        Buy now
      </span>
    </LoadingButton>
  );
}
