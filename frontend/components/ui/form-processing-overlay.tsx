"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormProcessingOverlayProps {
  show: boolean;
  message?: string;
  className?: string;
}

export function FormProcessingOverlay({
  show,
  message = "Đang xử lý...",
  className,
}: FormProcessingOverlayProps) {
  if (!show) return null;

  return (
    <div
      className={cn(
        "absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-white/90 backdrop-blur-[2px]",
        className
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" aria-hidden />
      <p className="mt-3 px-4 text-center text-sm font-medium text-slate-700">{message}</p>
    </div>
  );
}
