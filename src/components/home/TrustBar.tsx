import { MessageCircle, ShieldCheck, Truck } from "lucide-react";

const TRUST = [
  { icon: Truck, title: "Delivery across Kenya", text: "Fee shown before you pay" },
  { icon: ShieldCheck, title: "Warranty confirmed up front", text: "Ask us before you buy" },
  { icon: MessageCircle, title: "Order on WhatsApp", text: "Pay on delivery or M-Pesa" },
];

/** Three reasons to buy, shown near the top of the homepage. */
export default function TrustBar() {
  return (
    <ul className="grid gap-3 sm:grid-cols-3">
      {TRUST.map(({ icon: Icon, title, text }) => (
        <li
          key={title}
          className="flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-gray-900/5"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-primary">
            <Icon className="size-5" aria-hidden />
          </span>
          <span>
            <span className="block text-sm font-semibold text-gray-900">{title}</span>
            <span className="block text-xs text-gray-600">{text}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
