export interface SitemapEntry {
  url: string;
  lastModified?: Date;
  changeFrequency?: "daily" | "weekly" | "monthly" | "yearly";
  priority?: number;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Serialises entries to sitemap.xml. */
export function buildSitemapXml(entries: SitemapEntry[]): string {
  const urls = entries
    .map((entry) => {
      const parts = [`<loc>${escapeXml(entry.url)}</loc>`];
      if (entry.lastModified) {
        parts.push(`<lastmod>${entry.lastModified.toISOString()}</lastmod>`);
      }
      if (entry.changeFrequency) {
        parts.push(`<changefreq>${entry.changeFrequency}</changefreq>`);
      }
      if (entry.priority !== undefined) {
        parts.push(`<priority>${entry.priority.toFixed(1)}</priority>`);
      }
      return `<url>${parts.join("")}</url>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
}
