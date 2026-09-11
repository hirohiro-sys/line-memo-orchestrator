import type { CreateMemoRequest, MemoTag } from "@repo/shared";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { TAG_META, TAG_ORDER } from "@/lib/tag-meta";
import { TagIcon } from "./tag-icon";

export function MemoComposer({
  busy,
  onSubmit,
  onCancel,
}: {
  busy: boolean;
  onSubmit: (input: CreateMemoRequest) => Promise<void>;
  onCancel: () => void;
}) {
  const [tag, setTag] = useState<MemoTag | null>(null);
  const [content, setContent] = useState("");
  const canSubmit = tag !== null && content.trim().length > 0 && !busy;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!tag || content.trim().length === 0) return;
    await onSubmit({ tag, content });
  }

  const chipBase =
    "rounded-md px-2.5 py-1.5 text-[12px] transition-colors duration-150";

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-5 rounded-lg border border-border bg-card p-4"
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {TAG_ORDER.map((option) => {
          const meta = TAG_META[option];
          const active = tag === option;
          return (
            <button
              key={option}
              type="button"
              disabled={busy}
              onClick={() => setTag(option)}
              className={`${chipBase} flex items-center gap-1.5 ${
                active
                  ? "bg-foreground text-background"
                  : "border border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              <TagIcon name={meta.icon} className="size-3.5" />
              {meta.label}
            </button>
          );
        })}
      </div>

      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="メモを入力..."
        rows={3}
        className="mb-3 w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-body-sm text-foreground outline-none transition-colors duration-150 placeholder:text-muted-foreground focus:border-foreground"
      />

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          キャンセル
        </Button>
        <Button type="submit" size="sm" disabled={!canSubmit}>
          追加
        </Button>
      </div>
    </form>
  );
}
