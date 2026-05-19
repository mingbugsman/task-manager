"use client";

import { cn } from "@/lib/utils";
import {
  getLabelChipStyle,
  getLabelClass,
  normalizeBoardTaskLabels,
} from "@/src/features/projects/lib/kanban-utils";
import type { BoardTask, LabelSummary } from "@/src/types/api.types";

interface TaskLabelChipsProps {
  labels?: BoardTask["labels"] | string[];
  className?: string;
  size?: "sm" | "md";
}

export function TaskLabelChips({ labels, className, size = "sm" }: TaskLabelChipsProps) {
  const items = normalizeBoardTaskLabels(labels);
  if (items.length === 0) return null;

  const textSize = size === "md" ? "text-xs" : "text-[10px]";
  const pad = size === "md" ? "px-2.5 py-1" : "px-1.5 py-0.5";

  return (
    <section className={cn("flex flex-wrap gap-1", className)}>
      {items.map((label: LabelSummary) => {
        const key = label.labelId ? `label-${label.labelId}` : label.labelName;
        const chipStyle = getLabelChipStyle(label.colorCode);
        return (
          <span
            key={key}
            title={label.labelName}
            className={cn(
              "inline-flex max-w-[8.5rem] items-center gap-1 rounded-md border font-semibold",
              textSize,
              pad,
              !chipStyle && getLabelClass(label.labelName)
            )}
            style={chipStyle}
          >
            {label.colorCode ? (
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: label.colorCode }}
                aria-hidden
              />
            ) : null}
            <span className="truncate">{label.labelName}</span>
          </span>
        );
      })}
    </section>
  );
}
