const LINE_SEPARATOR = String.fromCharCode(0x2028);
const PARAGRAPH_SEPARATOR = String.fromCharCode(0x2029);

/** Serialises JSON-LD so it is safe to embed in a script tag. */
export function serializeJsonLd(
  data: Record<string, unknown> | Array<Record<string, unknown>>,
): string {
  return JSON.stringify(data, (_key, value) =>
    value === undefined ? undefined : value,
  )
    .replace(/</g, "\\u003c")
    .split(LINE_SEPARATOR)
    .join("\\u2028")
    .split(PARAGRAPH_SEPARATOR)
    .join("\\u2029");
}

export default function JsonLd({
  data,
}: {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
