export default function Footer() {
  return (
    <footer className="bg-[#F4F4F4] py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10">
          {/* Brand */}
          <div>
            <h3 className="font-serif text-xl font-bold text-gray-900">
              Yuricart Electronics
            </h3>
            <p className="mt-4 flex items-start gap-2 text-sm leading-relaxed text-gray-600">
              <span aria-hidden>🏢</span>
              Bazaar plaza along Moi Avenue, 1st floor A02
            </p>
            <a
              href="https://wa.me/254768054542"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1ebe57]"
              target="_blank"
              rel="noopener noreferrer"
            >
              Chat on WhatsApp
            </a>
            <ul className="mt-6 flex items-center gap-3">
              <SocialLink
                href="https://www.facebook.com/yuricarts/"
                label="Facebook"
              >
                <path d="M13.397 20.997v-8.196h2.765l.411-3.209h-3.176V7.548c0-.926.258-1.56 1.587-1.56h1.684V3.127A22.336 22.336 0 0 0 14.201 3c-2.444 0-4.122 1.492-4.122 4.231v2.355H7.332v3.209h2.753v8.202h3.312z" />
              </SocialLink>
              <SocialLink
                href="https://www.instagram.com/yuricart_electronics?igsh=MTNheHV6ODUzZXZhYg=="
                label="Instagram"
              >
                <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 6.6A4.4 4.4 0 1 0 16.4 13 4.4 4.4 0 0 0 12 8.6zm6.7-3.3a1.1 1.1 0 1 0 1.1 1.1 1.1 1.1 0 0 0-1.1-1.1z" />
              </SocialLink>
              <SocialLink
                href="https://www.tiktok.com/@yuritechs?_t=ZM-8ziSokY36Xd&_r=1"
                label="TikTok"
              >
                <path d="M220 89.6a54.5 54.5 0 0 1-31.6-10.1A54.7 54.7 0 0 1 174 48h-28v116.5a24.5 24.5 0 1 1-16-23.1V109a52.5 52.5 0 1 0 36 49.5V97.9a86.8 86.8 0 0 0 54 18.7V89.6z" />
              </SocialLink>
            </ul>
          </div>

          {/* Company
          <div>
            <p className="font-serif text-sm font-semibold uppercase tracking-widest text-gray-500">
              Company
            </p>
            <ul className="mt-5 space-y-3">
              <li><a href="#">About</a></li>
              <li><a href="#">Features</a></li>
              <li><a href="#">Works</a></li>
            </ul>
          </div>
          */}

          {/* Newsletter
          <div>
            <p className="font-serif text-sm font-semibold uppercase tracking-widest text-gray-500">
              Subscribe to newsletter
            </p>
            <form action="#" method="POST" className="mt-5 space-y-3">
              <input type="email" name="email" placeholder="Enter your email" />
              <button type="submit">Subscribe</button>
            </form>
          </div>
          */}
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  const isTikTok = label === "TikTok";
  return (
    <li>
      <a
        href={href}
        title={label}
        className="flex size-9 items-center justify-center rounded-full bg-gray-900 text-white transition hover:bg-[#003B73]"
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg
          className="h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox={isTikTok ? "0 0 256 256" : "0 0 24 24"}
          fill="currentColor"
        >
          {children}
        </svg>
      </a>
    </li>
  );
}
