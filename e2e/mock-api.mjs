// Tiny storefront API used by the Playwright suite. Deterministic data only.
import http from "node:http";

const svg = (label) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800"><rect width="800" height="800" fill="#fff"/><rect x="120" y="230" width="560" height="340" rx="16" fill="#3b4a6b"/><text x="400" y="420" font-size="40" text-anchor="middle" fill="#fff" font-family="Arial">${label}</text></svg>`,
  )}`;

const cats = [
  { _id: "c1", name: "Laptops", slug: "laptops", description: "Laptops for work and study." },
  { _id: "c2", name: "Printers", slug: "printers" },
];

const mk = (i, title, price, extra = {}) => ({
  _id: `64f00000000000000000${String(10 + i).padStart(4, "0")}`,
  title,
  slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  price,
  stock: 5,
  currency: "KES",
  status: "active",
  tags: [],
  colors: [],
  sizes: [],
  images: { primary: { url: svg(title.slice(0, 14)), alt: title }, gallery: [] },
  category: cats[i % 2],
  brand: { _id: "b1", name: "HP", slug: "hp" },
  description: "<ul><li>Processor: Intel i5</li><li>RAM: 8GB</li><li>Condition: Ex-UK</li></ul>",
  ...extra,
});

const products = Array.from({ length: 24 }, (_, i) =>
  mk(i, `HP EliteBook 8${30 + i} G5`, 30000 + i * 1000, i % 5 === 0 ? { salePrice: 28000 + i * 900 } : {}),
);

const ok = (data, meta) => ({ success: true, data, ...(meta ? { meta } : {}) });

http
  .createServer((req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    if (req.method === "OPTIONS") return res.writeHead(204).end();

    const url = new URL(req.url, "http://x");
    const p = url.pathname;
    let body;

    if (p === "/settings") body = ok({ whatsappNumber: "254768054542", shippingRate: 500 });
    else if (p === "/categories") body = ok(cats, { page: 1, limit: 100, total: cats.length, totalPages: 1 });
    else if (/^\/categories\/[^/]+\/products$/.test(p) || p === "/products") {
      let list = products;
      if (p !== "/products") list = list.filter((x) => x.category.slug === p.split("/")[2]);
      const q = url.searchParams.get("q");
      if (q) list = list.filter((x) => x.title.toLowerCase().includes(q.toLowerCase()));
      const limit = Number(url.searchParams.get("limit") || 8);
      const page = Number(url.searchParams.get("page") || 1);
      body = ok(list.slice((page - 1) * limit, page * limit), {
        page, limit, total: list.length, totalPages: Math.max(1, Math.ceil(list.length / limit)),
      });
    } else if (/^\/categories\/[^/]+$/.test(p) && cats.find((c) => c.slug === p.split("/")[2])) {
      body = ok(cats.find((c) => c.slug === p.split("/")[2]));
    } else if (/^\/products\/[^/]+\/related$/.test(p)) body = ok(products.slice(1, 6));
    else if (/^\/products\/[^/]+$/.test(p) && products.find((x) => x.slug === p.split("/")[2])) {
      body = ok(products.find((x) => x.slug === p.split("/")[2]));
    } else {
      res.statusCode = p === "/homepage" ? 500 : 404;
      body = { success: false, message: "not found" };
    }
    res.end(JSON.stringify(body));
  })
  .listen(8100, () => console.log("e2e mock api on 8100"));
