import {
  Clock,
  Edit3,
  ExternalLink,
  Image as ImageIcon,
  Send,
  Trash2,
} from "lucide-react";
import type { Memo } from "@repo/shared";
import { formatDate } from "@/lib/format";
import { TagBadge } from "./tag-badge";

export function MemoCard({
  memo,
  onDelete,
}: {
  memo: Memo;
  onDelete: (id: string) => void;
}) {
  return (
    <article className="rounded-xl border border-border bg-pure-white p-6">
      <div className="mb-2.5 flex items-start justify-between gap-3">
        <TagBadge tag={memo.tag} />
        <span className="flex shrink-0 items-center gap-1 text-[10px] font-medium text-ink-black/40">
          <Clock className="size-3" />
          {formatDate(memo.createdAt)}
        </span>
      </div>

      <p className="mb-3 break-words text-[13px] leading-relaxed text-ink-black/60">
        {memo.content}
      </p>

      {memo.url && (
        <a
          href={memo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-2.5 flex items-center gap-1.5 text-caption font-medium text-notion-blue transition-opacity duration-200 hover:opacity-80"
        >
          <ExternalLink className="size-3.5 shrink-0" />
          <span className="max-w-[240px] truncate">{memo.url}</span>
        </a>
      )}

      {memo.mediaType === "image" && (
        <div className="mb-2.5 flex h-32 items-center justify-center rounded-xl border border-border bg-paper-warmth">
          <ImageIcon className="size-8 text-ink-black/20" />
        </div>
      )}

      <div className="flex items-center justify-between border-t border-border pt-2.5">
        <span
          className={`inline-flex items-center gap-1 text-[10px] font-medium ${
            memo.source === "line" ? "text-notion-blue" : "text-ink-black/40"
          }`}
        >
          {memo.source === "line" ? (
            <Send className="size-3" />
          ) : (
            <Edit3 className="size-3" />
          )}
          {memo.source === "line" ? "LINEから" : "Webから"}
        </span>
        <button
          type="button"
          onClick={() => onDelete(memo.id)}
          className="rounded-lg p-1.5 text-ink-black/40 transition-colors duration-200 hover:bg-coral/10 hover:text-coral"
          aria-label="削除"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </article>
  );
}
