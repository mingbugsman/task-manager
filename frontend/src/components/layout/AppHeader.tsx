"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  /** Chỉ hiện ô tìm khi bật và có onSearchChange */
  showSearch?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  showFilter?: boolean;
}

export function AppHeader({
  title,
  subtitle,
  showSearch = false,
  searchPlaceholder = "Tìm kiếm...",
  searchValue = "",
  onSearchChange,
  showFilter = false,
}: AppHeaderProps) {
  const showSearchBar = showSearch && Boolean(onSearchChange);

  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <section>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
      </section>

      {showSearchBar || showFilter ? (
        <section className="flex items-center gap-3">
          {showSearchBar ? (
            <section className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                className="w-full min-w-[220px] rounded-xl border-slate-200 bg-white pl-9 sm:w-64"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                aria-label={searchPlaceholder}
              />
            </section>
          ) : null}
          {showFilter ? (
            <Button variant="outline" className="gap-2 rounded-xl border-slate-200">
              <SlidersHorizontal size={16} />
              Lọc
            </Button>
          ) : null}
        </section>
      ) : null}
    </header>
  );
}
