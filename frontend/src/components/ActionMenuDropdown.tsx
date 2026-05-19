"use client";

import { useEffect, useRef, useState } from "react";
import { MoreHorizontal, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ActionMenuItem {
  id: string;
  label: string;
  destructive?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

interface ActionMenuDropdownProps {
  items: ActionMenuItem[];
  icon?: "horizontal" | "vertical";
  align?: "left" | "right";
  className?: string;
  buttonClassName?: string;
  ariaLabel?: string;
}

export function ActionMenuDropdown({
  items,
  icon = "horizontal",
  align = "right",
  className,
  buttonClassName,
  ariaLabel = "Tùy chọn",
}: ActionMenuDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const Icon = icon === "vertical" ? MoreVertical : MoreHorizontal;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  if (items.length === 0) return null;

  return (
    <section ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        className={cn(
          "rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600",
          buttonClassName
        )}
        aria-label={ariaLabel}
        aria-expanded={open}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        <Icon size={18} />
      </button>

      {open ? (
        <menu
          className={cn(
            "absolute z-50 mt-1 min-w-[10rem] overflow-hidden rounded-xl border border-slate-100 bg-white py-1 shadow-lg",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                disabled={item.disabled}
                className={cn(
                  "w-full px-4 py-2.5 text-left text-sm font-medium transition-colors disabled:opacity-50",
                  item.destructive
                    ? "text-red-600 hover:bg-red-50"
                    : "text-slate-700 hover:bg-slate-50"
                )}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setOpen(false);
                  item.onClick();
                }}
              >
                {item.label}
              </button>
            </li>
          ))}
        </menu>
      ) : null}
    </section>
  );
}
