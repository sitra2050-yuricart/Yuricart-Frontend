import Breadcrumb from "@/components/listing/Breadcrumb";
import JsonLd from "@/components/JsonLd";
import ContactCard from "./ContactCard";
import { CONTENT_PAGES } from "@/content/pages";
import { buildPageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export function contentMetadata(slug: string): Metadata {
  const page = CONTENT_PAGES[slug];
  return buildPageMetadata({
    title: page.title,
    description: page.description,
    path: `/${page.slug}`,
  });
}

/** Renders one of the information pages from src/content/pages.ts. */
export default function ContentPage({ slug }: { slug: string }) {
  const page = CONTENT_PAGES[slug];

  const faqJsonLd = page.faqs
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: page.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: { "@type": "Answer", text: faq.a },
        })),
      }
    : null;

  return (
    <main className="mx-auto max-w-4xl space-y-5 px-5 py-6 sm:py-8">
      {faqJsonLd ? <JsonLd data={faqJsonLd} /> : null}
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: page.title }]} />

      <article className="space-y-6 rounded-2xl bg-white px-5 py-6 ring-1 ring-gray-900/5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_12px_32px_-18px_rgba(16,24,40,0.16)] sm:px-8 sm:py-8">
        <header className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="h-6 w-1 rounded-full bg-cta" aria-hidden />
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              {page.title}
            </h1>
          </div>
          <p className="max-w-3xl text-base leading-relaxed text-gray-700">{page.intro}</p>
          {page.updated ? (
            <p className="text-xs text-gray-600">Last updated {page.updated}</p>
          ) : null}
        </header>

        {page.contact ? <ContactCard /> : null}

        {page.sections.map((section) => (
          <section key={section.heading} className="space-y-2">
            <h2 className="text-lg font-bold text-gray-900">{section.heading}</h2>
            {section.paragraphs?.map((text) => (
              <p key={text} className="max-w-3xl leading-relaxed text-gray-700">
                {text}
              </p>
            ))}
            {section.list ? (
              <ul className="max-w-3xl list-disc space-y-1.5 pl-5 leading-relaxed text-gray-700">
                {section.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}

        {page.faqs ? (
          <div className="divide-y divide-gray-100 rounded-xl ring-1 ring-gray-900/10">
            {page.faqs.map((faq) => (
              <details key={faq.q} className="group px-4 py-3 open:bg-brand-soft/60">
                <summary className="cursor-pointer list-none rounded font-semibold text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  {faq.q}
                </summary>
                <p className="mt-2 max-w-3xl leading-relaxed text-gray-700">{faq.a}</p>
              </details>
            ))}
          </div>
        ) : null}
      </article>
    </main>
  );
}
