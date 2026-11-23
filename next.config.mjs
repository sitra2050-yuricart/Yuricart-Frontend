// Clean redeploy after malware removal (2026-11-18).
/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    // /products has no page of its own; the product list lives at /shop.
    return [{ source: "/products", destination: "/shop", permanent: true }];
  },
  experimental: {
    staleTimes: {
      dynamic: 30,
    },
  },
  images: {
    // Cloudinary does the resizing; see src/lib/image-loader.ts
    loaderFile: "./src/lib/image-loader.ts",
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.zuricart.co.ke",
      },
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "fastly.picsum.photos",
      },
    ],
  },
};

export default nextConfig;
