"use client";

import { useRef } from "react";
import Link from "next/link";
import ProductImage from "@/components/ProductImage";
import { LegacyProductCard, toLegacyProductCard } from "@/lib/api/adapters";
import {
  getProductDiscountPercent,
  hasProductDiscount,
} from "@/lib/api/product-utils";
import { Product } from "@/lib/api/types";

interface HomeProductCardProps {
  product: Product | LegacyProductCard;
}

function isLegacy(p: Product | LegacyProductCard): p is LegacyProductCard {
  return "name" in p && "media" in p;
}

const DRAG_THRESHOLD = 8;

export default function HomeProductCard({ product }: HomeProductCardProps) {
  const card = isLegacy(product) ? product : toLegacyProductCard(product);
  const raw = isLegacy(product) ? null : product;
  const image = card.media?.mainMedia?.image;
  const price =
    card.priceData?.formatted?.discountedPrice ||
    card.priceData?.formatted?.price ||
    card.price?.formatted?.price ||
    "n/a";
  const original =
    card.priceData?.formatted?.discountedPrice && card.priceData?.formatted?.price
      ? card.priceData.formatted.price
      : null;

  const onSale = raw ? hasProductDiscount(raw) : Boolean(card.discount);
  const discountLabel = raw
    ? getProductDiscountPercent(raw)
    : card.discount?.value;
  const shortDesc =
    raw?.shortDescription ||
    (typeof card.description === "string"
      ? card.description.replace(/<[^>]+>/g, "").slice(0, 80)
      : "");

  const pointerStart = useRef({ x: 0, y: 0 });
  const didDrag = useRef(false);

  return (
    <Link
      href={`/products/${card.slug}`}
      draggable={false}
      className="group flex h-full w-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white"
      onPointerDown={(e) => {
        pointerStart.current = { x: e.clientX, y: e.clientY };
        didDrag.current = false;
      }}
      onPointerMove={(e) => {
        if (e.buttons === 0) return;
        const dx = Math.abs(e.clientX - pointerStart.current.x);
        const dy = Math.abs(e.clientY - pointerStart.current.y);
        if (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD) {
          didDrag.current = true;
        }
      }}
      onClick={(e) => {
        // After a drag/swipe, block navigation so the carousel can finish the gesture
        if (didDrag.current) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-white">
        <ProductImage
          src={image?.url}
          alt={image?.altText || card.name}
          fill
          sizes="(max-width: 768px) 45vw, 220px"
          className="transition-transform duration-300 group-hover:scale-105"
        />
        {onSale && (
          <span className="absolute bottom-2 right-2 rounded bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            Sale
          </span>
        )}
        {discountLabel ? (
          <span className="absolute left-2 top-2 rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
            -{discountLabel}%
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <div className="inline-flex w-fit rounded border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-semibold text-gray-800">
          {price}
        </div>
        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-gray-900">
          {card.name}
        </h3>
        {shortDesc ? (
          <p className="line-clamp-2 text-xs text-gray-500">{shortDesc}</p>
        ) : null}
        <div className="mt-auto pt-1">
          <p className="text-base font-bold text-gray-900">{price}</p>
          {original && (
            <p className="text-xs text-gray-600 line-through">{original}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
