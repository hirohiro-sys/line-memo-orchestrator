import type { Memo } from "@repo/shared";
import { Clock, ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/format";
import { TagBadge } from "./tag-badge";

export function MemoCard({ memo }: { memo: Memo }) {
  return (
    <article className="rounded-lg border border-border bg-card p-5">
      <div className="mb-2 flex items-start justify-between gap-3">
        <TagBadge tag={memo.tag} />
        <span className="flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground">
          <Clock className="size-3" />
          {formatDate(memo.createdAt)}
        </span>
      </div>

      <p className="mb-3 break-words text-[13px] leading-relaxed text-foreground">
        {memo.content}
      </p>

      {memo.url && (
        <a
          href={memo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-2.5 flex items-center gap-1.5 text-caption text-muted-foreground underline-offset-2 transition-colors duration-150 hover:text-foreground hover:underline"
        >
          <ExternalLink className="size-3.5 shrink-0" />
          <span className="max-w-[240px] truncate">{memo.url}</span>
        </a>
      )}

      {memo.thumbnailUrl && (
        <img
          src={memo.thumbnailUrl}
          alt=""
          className="mb-2.5 h-28 w-full rounded-md object-cover"
        />
      )}

      <div className="border-t border-border pt-2.5">
        <span className="text-[11px] text-muted-foreground">
          {memo.source === "line" ? "LINE" : "Web"}
        </span>
      </div>
    </article>
  );
}
