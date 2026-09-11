import type { CreateMemoRequest, Memo, MemoTag } from "@repo/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Inbox, Plus, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { createMemo, deleteMemo, fetchMemos } from "@/lib/api";
import { TAG_META, TAG_ORDER } from "@/lib/tag-meta";
import { MemoCard } from "./memo-card";
import { MemoComposer } from "./memo-composer";
import { TagIcon } from "./tag-icon";

type FilterTag = MemoTag | "all";
const EMPTY_MEMOS: Memo[] = [];

export function MemoList() {
  const queryClient = useQueryClient();
  const showToast = useToast();
  const memosQuery = useQuery({ queryKey: ["memos"], queryFn: fetchMemos });
  const memos = memosQuery.data?.items ?? EMPTY_MEMOS;

  const [filter, setFilter] = useState<FilterTag>("all");
  const [search, setSearch] = useState("");
  const [composing, setComposing] = useState(false);

  const createMutation = useMutation({
    mutationFn: createMemo,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["memos"] });
    },
    onError: () => {
      showToast("保存できませんでした。");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMemo,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["memos"] });
    },
    onError: () => {
      showToast("削除できませんでした。");
    },
  });

  const busy = createMutation.isPending || deleteMutation.isPending;

  const tagCounts = useMemo(() => {
    const acc: Record<MemoTag, number> = { tweet: 0, tech: 0, other: 0 };
    for (const memo of memos) acc[memo.tag] += 1;
    return acc;
  }, [memos]);

  const filtered = useMemo(() => {
    let result = memos;
    if (filter !== "all") result = result.filter((memo) => memo.tag === filter);
    const query = search.trim().toLowerCase();
    if (query) {
      result = result.filter(
        (memo) =>
          memo.content.toLowerCase().includes(query) ||
          (memo.url ?? "").toLowerCase().includes(query),
      );
    }
    return result;
  }, [memos, filter, search]);

  async function handleCreate(input: CreateMemoRequest) {
    await createMutation.mutateAsync(input);
    setComposing(false);
  }

  const chipBase =
    "rounded-md px-2.5 py-1.5 text-[12px] transition-colors duration-150";

  return (
    <div className="p-4 md:p-7">
      <div className="mb-5 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="relative max-w-md flex-1">
            <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="メモを検索..."
              className="w-full rounded-md border border-border bg-card py-2 pr-8 pl-9 text-body-sm text-foreground outline-none transition-colors duration-150 placeholder:text-muted-foreground focus:border-foreground"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground transition-colors duration-150 hover:text-foreground"
                aria-label="検索をクリア"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
          <Button
            type="button"
            size="sm"
            disabled={busy || composing}
            onClick={() => setComposing(true)}
          >
            <Plus className="size-3.5" />
            追加
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`${chipBase} ${
              filter === "all"
                ? "bg-foreground text-background"
                : "border border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            すべて{" "}
            <span className="ml-0.5 text-[11px] tabular-nums opacity-60">
              {memos.length}
            </span>
          </button>
          {TAG_ORDER.map((tag) => {
            const meta = TAG_META[tag];
            const active = filter === tag;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => setFilter(tag)}
                className={`${chipBase} flex items-center gap-1.5 ${
                  active
                    ? "bg-foreground text-background"
                    : "border border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                <TagIcon name={meta.icon} className="size-3.5" />
                {meta.label}
                <span className="text-[11px] tabular-nums opacity-60">
                  {tagCounts[tag]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {composing && (
        <MemoComposer
          busy={busy}
          onSubmit={handleCreate}
          onCancel={() => setComposing(false)}
        />
      )}

      {memosQuery.isPending && (
        <p className="py-16 text-center text-body-sm text-muted-foreground">
          読み込み中...
        </p>
      )}

      {memosQuery.isError && (
        <p className="py-16 text-center text-body-sm text-destructive">
          メモの取得に失敗しました
        </p>
      )}

      {memosQuery.isSuccess && filtered.length === 0 && (
        <div className="py-16 text-center">
          <Inbox className="mx-auto mb-3 size-5 text-muted-foreground" />
          <p className="text-body-sm text-muted-foreground">
            {search ? "検索結果が見つかりません" : "まだメモがありません"}
          </p>
        </div>
      )}

      {memosQuery.isSuccess && filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((memo) => (
            <MemoCard
              key={memo.id}
              memo={memo}
              busy={busy}
              onDelete={deleteMutation.mutateAsync}
            />
          ))}
        </div>
      )}
    </div>
  );
}
