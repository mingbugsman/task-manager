"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ListPaginationProps {
  page: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  hasPrevious: boolean;
  hasNext: boolean;
  onPageChange: (page: number) => void;
}

export function ListPagination({
  page,
  totalPages,
  totalElements,
  pageSize,
  hasPrevious,
  hasNext,
  onPageChange,
}: ListPaginationProps) {
  if (totalElements === 0) return null;

  const from = totalElements === 0 ? 0 : page * pageSize + 1;
  const to = Math.min((page + 1) * pageSize, totalElements);

  return (
    <section className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row">
      <p className="text-sm text-slate-500">
        Hiển thị {from}–{to} / {totalElements}
      </p>
      <section className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-xl gap-1"
          disabled={!hasPrevious}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft size={16} />
          Trước
        </Button>
        <span className="min-w-[5rem] text-center text-sm font-medium text-slate-600">
          Trang {page + 1} / {totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-xl gap-1"
          disabled={!hasNext}
          onClick={() => onPageChange(page + 1)}
        >
          Sau
          <ChevronRight size={16} />
        </Button>
      </section>
    </section>
  );
}
