"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto max-w-xl px-5 py-20 text-center">
      <h1 className="text-2xl font-bold text-gray-900">
        This page didn&apos;t load
      </h1>
      <p className="mt-2 text-gray-600">
        Something went wrong on our side. Try again, or keep shopping.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-11 items-center rounded-full bg-[#003B73] px-6 text-sm font-semibold text-white transition hover:bg-[#002f5d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003B73] focus-visible:ring-offset-2"
        >
          Try again
        </button>
        <Link
          href="/shop"
          className="inline-flex h-11 items-center rounded-full bg-white px-6 text-sm font-semibold text-gray-800 ring-1 ring-gray-900/10 transition hover:text-[#003B73]"
        >
          Go to the shop
        </Link>
      </div>
    </main>
  );
}
