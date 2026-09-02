"use client";

import { Button } from "@/components/ui/button";
import { ShoppingCartIcon } from "lucide-react";
import { trackLead } from "@/lib/metaPixel";

interface WhatsAppOrderButtonProps {
  phoneNumber: string;
  productName?: string | null;
  productUrl: string;
  quantity: number;
  salePrice: number; // ab sirf sale price
}

export default function WhatsAppOrderButton({
  phoneNumber,
  productName,
  productUrl,
  quantity,
  salePrice,
}: WhatsAppOrderButtonProps) {
  // ✅ total price calculate karo
  const totalPrice = salePrice * quantity;

  const message = `Hi, I want to order this product:\n\n*${productName}*\nQuantity: ${quantity}\nSale Price: ${totalPrice}\n${productUrl}`;

  const waLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    message,
  )}`;

  return (
    <a
      href={waLink}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() =>
        trackLead({
          content_name: productName ?? undefined,
          value: totalPrice,
          currency: "KES",
        })
      }
    >
      <Button className="flex items-center gap-2 bg-green-500 text-white hover:bg-green-600">
        <ShoppingCartIcon className="h-5 w-5" />
        Order via WhatsApp
      </Button>
    </a>
  );
}
