"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Smile } from "lucide-react";
import { cn } from "@/lib/utils";
import { reactionApi, type CommentReactionSummary } from "../api/reaction.api";
import {
  REACTION_EMOJI,
  REACTION_OPTIONS,
  type ReactionTypeKey,
} from "../lib/reaction-display";

interface CommentReactionsProps {
  commentId: number;
}

export function CommentReactions({ commentId }: CommentReactionsProps) {
  const [reactions, setReactions] = useState<CommentReactionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<ReactionTypeKey | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await reactionApi.getForComment(commentId);
      setReactions(res.data.data ?? []);
    } catch {
      setReactions([]);
    } finally {
      setLoading(false);
    }
  }, [commentId]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  useEffect(() => {
    if (!pickerOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [pickerOpen]);

  const handleToggle = async (type: ReactionTypeKey) => {
    setToggling(type);
    try {
      await reactionApi.toggle(commentId, type);
      await load();
      setPickerOpen(false);
    } catch {
      /* ignore */
    } finally {
      setToggling(null);
    }
  };

  const activeReactions = reactions.filter((r) => r.count > 0);

  if (loading && activeReactions.length === 0) {
    return null;
  }

  return (
    <section className="mt-2 flex flex-wrap items-center gap-1.5">
      {activeReactions.map((r) => {
        const type = r.reactionType as ReactionTypeKey;
        const emoji = REACTION_EMOJI[type] ?? "👍";
        const busy = toggling === type;

        return (
          <button
            key={type}
            type="button"
            disabled={busy}
            onClick={() => handleToggle(type)}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
              r.userReacted
                ? "border-blue-200 bg-blue-50 text-blue-800"
                : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50/50"
            )}
          >
            {busy ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <span className="text-sm leading-none">{emoji}</span>
            )}
            <span>{r.count}</span>
          </button>
        );
      })}

      <section ref={pickerRef} className="relative">
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50",
            pickerOpen && "border-blue-200 bg-blue-50 text-blue-700"
          )}
          onClick={() => setPickerOpen((o) => !o)}
        >
          <Smile size={14} />
          React
        </button>

        {pickerOpen ? (
          <section className="absolute left-0 top-full z-50 mt-1 flex flex-nowrap gap-1 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
            {REACTION_OPTIONS.map(({ type, label }) => (
              <button
                key={type}
                type="button"
                title={label}
                disabled={toggling != null}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleToggle(type)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg transition-colors hover:bg-slate-100"
              >
                {toggling === type ? (
                  <Loader2 size={14} className="animate-spin text-slate-400" />
                ) : (
                  REACTION_EMOJI[type]
                )}
              </button>
            ))}
          </section>
        ) : null}
      </section>
    </section>
  );
}
