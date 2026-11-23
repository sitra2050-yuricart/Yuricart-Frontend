export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-[88rem] px-5 py-6 sm:py-8">{children}</main>
  );
}
