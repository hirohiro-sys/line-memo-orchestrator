import type { MemoTag } from "@repo/shared";
import { TAG_META } from "@/lib/tag-meta";
import { TagIcon } from "./tag-icon";

export function TagBadge({
  tag,
  size = "sm",
}: {
  tag: MemoTag;
  size?: "sm" | "xs";
}) {
  const meta = TAG_META[tag];
  const compact = size === "xs";

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${meta.className} ${
        compact ? "gap-1 px-1.5 py-0.5 text-[10px]" : "gap-1.5 px-3 py-1 text-caption"
      }`}
    >
      <TagIcon name={meta.icon} className={compact ? "size-2.5" : "size-3"} />
      {meta.label}
    </span>
  );
}
