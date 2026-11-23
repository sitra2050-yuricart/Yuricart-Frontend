import ContentPage, { contentMetadata } from "@/components/content/ContentPage";

export const metadata = contentMetadata("about");

export default function Page() {
  return <ContentPage slug="about" />;
}
