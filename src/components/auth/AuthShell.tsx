import type { ReactNode } from "react";

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

/** Shared card for login, register and password reset. */
export default function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md items-start px-5 py-10 sm:py-14">
      <div className="w-full space-y-6 rounded-2xl bg-white p-6 ring-1 ring-gray-900/5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_12px_32px_-14px_rgba(16,24,40,0.16)] sm:p-8">
        <header className="space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h1>
          {subtitle ? <p className="text-sm text-gray-600">{subtitle}</p> : null}
        </header>
        {children}
        {footer ? <div className="border-t border-gray-100 pt-4 text-sm text-gray-600">{footer}</div> : null}
      </div>
    </main>
  );
}
