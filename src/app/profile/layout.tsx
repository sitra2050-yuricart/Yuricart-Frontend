import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "My profile",
  description: "Manage your Yuricart account.",
  path: "/profile",
  noIndex: true,
});

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
