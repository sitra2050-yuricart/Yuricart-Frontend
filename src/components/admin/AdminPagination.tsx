"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

interface AdminPaginationProps {
  page: number;
  totalPages: number;
}

export default function AdminPagination({ page, totalPages }: AdminPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function goToPage(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    router.push(`?${params.toString()}`);
  }

  return (
    <Pagination className="mt-6">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (page > 1) goToPage(page - 1);
            }}
            className={cn(page === 1 && "pointer-events-none opacity-50")}
          />
        </PaginationItem>
        {Array.from({ length: totalPages }).slice(0, 5).map((_, i) => {
          const pageNum = i + 1;
          return (
            <PaginationItem key={pageNum}>
              <PaginationLink
                href="#"
                isActive={pageNum === page}
                onClick={(e) => {
                  e.preventDefault();
                  goToPage(pageNum);
                }}
              >
                {pageNum}
              </PaginationLink>
            </PaginationItem>
          );
        })}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (page < totalPages) goToPage(page + 1);
            }}
            className={cn(page >= totalPages && "pointer-events-none opacity-50")}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
