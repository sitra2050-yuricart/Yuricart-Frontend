import type { Metadata } from "next";
import { Libre_Baskerville, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ReactQueryProvider from "./ReactQueryProvider";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import AppChrome from "@/components/AppChrome";
import MetaPixel from "@/components/MetaPixel";
import Script from "next/script";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-serif",
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: {
    template: "%s | Yuricart Kenya",
    absolute: "Yuricart Kenya | Electronics Store — Phones, Laptops & More",
  },
  description:
    "Shop electronics in Kenya — phones, laptops, printers, and accessories with fast delivery from Yuricart.",
  icons: {
    icon: "/logonew.svg",
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://www.yuricart.com/",
  ),
  openGraph: {
    title: "Yuricart Kenya | Electronics Store",
    description:
      "Shop electronics in Kenya — phones, laptops, printers, and accessories with fast delivery from Yuricart.",
    url: "https://www.yuricart.com/",
    siteName: "Yuricart",
    images: [
      {
        url: "/newlogoog.jpg",
        width: 1200,
        height: 630,
        alt: "Yuricart Kenya electronics store",
      },
    ],
    locale: "en_KE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Yuricart Kenya | Electronics Store",
    description:
      "Shop electronics in Kenya — phones, laptops, printers, and accessories with fast delivery from Yuricart.",
    images: ["/newlogoog.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-CCEKQ4Y5C6"
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-CCEKQ4Y5C6');
          `}
        </Script>
        {metaPixelId ? (
          <Script id="meta-pixel" strategy="lazyOnload">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${metaPixelId}');
              fbq('track', 'PageView');
            `}
          </Script>
        ) : null}
      </head>
      <body
        className={`${sourceSans.variable} ${libreBaskerville.variable} font-sans antialiased`}
      >
        {metaPixelId ? (
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        ) : null}
        <MetaPixel />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ReactQueryProvider>
            <AppChrome
              navbar={<Navbar />}
              footer={<Footer />}
              whatsapp={<WhatsAppButton />}
            >
              {children}
            </AppChrome>
          </ReactQueryProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
