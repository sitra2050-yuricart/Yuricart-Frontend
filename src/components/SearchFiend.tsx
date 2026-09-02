// "use client";

// import { cn } from "@/lib/utils";
// import { SearchIcon } from "lucide-react";
// import { useRouter } from "next/navigation";
// import { Input } from "./ui/input";

// interface SearchFieldProps {
//   className?: string;
// }

// export default function SearchField({ className }: SearchFieldProps) {
//   const router = useRouter();

//   function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
//     e.preventDefault();
//     const form = e.currentTarget;
//     const q = (form.q as HTMLInputElement).value.trim();
//     if (!q) return;
//     router.push(`/shop?q=${encodeURIComponent(q)}`);
//   }

//   return (
//     <form
//       onSubmit={handleSubmit}
//       method="GET"
//       action="/shop"
//       className={cn("grow", className)}
//     >
//       <div className="relative">
//         <Input name="q" placeholder="Search" className="pe-10" />
//         <SearchIcon className="absolute right-3 top-1/2 size-5 -translate-y-1/2 transform text-muted-foreground" />
//       </div>
//     </form>
//   );
// }




"use client";

import { cn } from "@/lib/utils";
import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "./ui/input";
import { trackSearch } from "@/lib/metaPixel";

interface SearchFieldProps {
  className?: string;
}

export default function SearchField({ className }: SearchFieldProps) {
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const qInput = form.q as HTMLInputElement;
    const q = qInput.value.trim();
    if (!q) return;

    trackSearch({ search_string: q });
    router.push(`/shop?q=${encodeURIComponent(q)}`);

    // ✅ Clear input and remove focus
    qInput.value = "";
    qInput.blur();
  }

  return (
    <form
      onSubmit={handleSubmit}
      method="GET"
      action="/shop"
      className={cn("grow", className)}
    >
      <div className="relative">
        <Input name="q" placeholder="Search products..." className="pe-10" />
        <SearchIcon className="absolute right-3 top-1/2 size-5 -translate-y-1/2 transform text-muted-foreground" />
      </div>
    </form>
  );
}


