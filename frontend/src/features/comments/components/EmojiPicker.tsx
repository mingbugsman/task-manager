"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const EMOJIS = [
  "😀", "😃", "😄", "😁", "😅", "😂", "🤣", "😊",
  "😇", "🙂", "😉", "😌", "😍", "🥰", "😘", "😗",
  "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭",
  "🤔", "🤐", "🤨", "😐", "😑", "😶", "😏", "😒",
  "🙄", "😬", "🤥", "😔", "😪", "🤤", "😴", "😷",
  "🤒", "🤕", "🤢", "🤮", "🥵", "🥶", "🥴", "👍",
  "👎", "👏", "🙌", "🤝", "🙏", "💪", "✨", "🔥",
  "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "💯",
  "✅", "❌", "⭐", "🎉", "🎊", "🎈", "🎁",
];

interface EmojiPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
  className?: string;
}

export function EmojiPicker({ open, onClose, onSelect, className }: EmojiPickerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <section
      ref={ref}
      className={cn(
        "absolute bottom-full left-0 z-50 mb-2 w-[min(280px,calc(100vw-2rem))] rounded-xl border border-slate-200 bg-white p-2 shadow-lg",
        className
      )}
    >
      <p className="mb-2 px-1 text-xs font-medium text-slate-500">Biểu tượng cảm xúc</p>
      <section className="grid max-h-40 grid-cols-8 gap-0.5 overflow-y-auto">
        {EMOJIS.map((emoji, index) => (
          <button
            key={`${index}-${emoji}`}
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-lg hover:bg-slate-100"
            onClick={() => {
              onSelect(emoji);
              onClose();
            }}
          >
            {emoji}
          </button>
        ))}
      </section>
    </section>
  );
}
