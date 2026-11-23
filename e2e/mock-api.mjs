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

    // Old paths that should redirect (renamed category, renamed product).
    if (p === "/redirects/resolve") {
      const map = {
        "/collections/modio": "/collections/laptops",
        "/products/old-elitebook-name": "/products/hp-elitebook-830-g5",
        "/legacy-page": "/shop",
      };
      const to = map[url.searchParams.get("path")];
      if (to) return res.end(JSON.stringify(ok({ to, statusCode: 301 })));
      res.statusCode = 404;
      return res.end(JSON.stringify({ success: false, message: "No redirect for that path" }));
    }

    // Auth endpoints (POST): deterministic answers for the form tests.
    if (req.method === "POST" && p.startsWith("/auth/")) {
      let raw = "";
      req.on("data", (chunk) => (raw += chunk));
      req.on("end", () => {
        const input = raw ? JSON.parse(raw) : {};
        const fail = (status, message) => {
          res.statusCode = status;
          res.end(JSON.stringify({ success: false, message }));
        };
        if (p === "/auth/forgot-password") {
          return res.end(JSON.stringify(ok({ message: "If an account exists, we sent a link." })));
        }
        if (p === "/auth/reset-password") {
          if (String(input.token).startsWith("expired")) {
            return fail(400, "This reset link is invalid or has expired. Request a new one.");
          }
          return res.end(JSON.stringify(ok({ message: "Your password has been changed." })));
        }
        if (p === "/auth/login") {
          if (input.password === "wrong-password") return fail(401, "Invalid email or password");
          return res.end(JSON.stringify(ok({ token: "t", user: { id: "u1", name: "Amina", email: input.email, role: "customer" } })));
        }
        if (p === "/auth/register") {
          if (input.email === "taken@example.com") return fail(400, "Email already registered");
          return res.end(JSON.stringify(ok({ token: "t", user: { id: "u2", name: input.name, email: input.email, role: "customer" } })));
        }
        return fail(404, "not found");
      });
      return;
    }

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
