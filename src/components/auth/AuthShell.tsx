import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Full-screen card for login, register and password pages. These screens have no
 * site header or footer, so the logo and a way back to the store live here.
 */
export default function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <main className="flex min-h-screen flex-col items-center bg-surface px-5 py-8 sm:justify-center sm:py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2" aria-label="Yuricart home">
            <Image src="/logonew.svg" alt="Yuricart Electronics" width={52} height={52} priority />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-white hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to store
          </Link>
        </div>

        <div className="w-full space-y-6 rounded-2xl bg-white p-6 ring-1 ring-gray-900/5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_12px_32px_-14px_rgba(16,24,40,0.16)] sm:p-8">
          <header className="space-y-1.5">
            <div className="flex items-center gap-3">
              <span className="h-6 w-1 rounded-full bg-cta" aria-hidden />
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h1>
            </div>
            {subtitle ? <p className="text-sm text-gray-700">{subtitle}</p> : null}
          </header>
          {children}
          {footer ? <div className="border-t border-gray-100 pt-4 text-sm text-gray-700">{footer}</div> : null}
        </div>
      </div>
    </main>
  );
}
