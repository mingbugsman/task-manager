import { cn } from "@/lib/utils";
import { getAvatarUrl, getInitials } from "@/src/lib/format";

interface AvatarProps {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  isPreview?: boolean;
}

const sizes = {
  sm: "h-7 w-7 text-[10px]",
  md: "h-9 w-9 text-xs",
  lg: "h-11 w-11 text-sm",
};

export function Avatar({ name, src, size = "md", className, isPreview }: AvatarProps) {
  const url = getAvatarUrl(name, src);

  return (
    <img
      key={url}
      src={url}
      alt={name}
      className={cn("rounded-full object-cover bg-slate-100 ring-2 ring-white", sizes[size], className)}
      onError={(e) => {
        if (isPreview) return;
        const target = e.currentTarget;
        target.style.display = "none";
        const parent = target.parentElement;
        if (parent && !parent.querySelector("[data-fallback]")) {
          const el = document.createElement("div");
          el.dataset.fallback = "true";
          el.className = cn(
            "rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold",
            sizes[size],
            className
          );
          el.textContent = getInitials(name);
          parent.appendChild(el);
        }
      }}
    />
  );
}
