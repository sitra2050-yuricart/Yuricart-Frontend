import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

/** Legacy Wix product ID URLs — redirect to shop search. */
export default async function Page({ params }: PageProps) {
  const { id } = await params;
  redirect(`/shop?q=${encodeURIComponent(id)}`);
}
