import type { Memo, MemoTag } from "@repo/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Inbox, Plus, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { createMemo, deleteMemo, fetchMemos } from "@/lib/api";
import { classifyMessage, detectMediaType } from "@/lib/classify";
import { TAG_META, TAG_ORDER } from "@/lib/tag-meta";
import { MemoCard } from "./memo-card";
import { TagIcon } from "./tag-icon";

type FilterTag = MemoTag | "all";
const EMPTY_MEMOS: Memo[] = [];

export function MemoList() {
  const queryClient = useQueryClient();
  const memosQuery = useQuery({ queryKey: ["memos"], queryFn: fetchMemos });
  const memos = memosQuery.data?.items ?? EMPTY_MEMOS;

  const [filter, setFilter] = useState<FilterTag>("all");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newTag, setNewTag] = useState<MemoTag | "auto">("auto");

  const createMutation = useMutation({
    mutationFn: createMemo,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["memos"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMemo,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["memos"] });
    },
  });

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

  function handleAdd() {
    const content = newContent.trim();
    if (!content) return;
    const mediaType = detectMediaType(content);
    const tag =
      newTag === "auto" ? classifyMessage(content, false).tag : newTag;
    createMutation.mutate(
      {
        content,
        tag,
        url: mediaType === "url" ? content : undefined,
        mediaType,
        source: "web",
      },
      {
        onSuccess: () => {
          setNewContent("");
          setNewTag("auto");
          setShowAdd(false);
        },
      },
    );
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
          <button
            type="button"
            onClick={() => setShowAdd((open) => !open)}
            className={
              showAdd
                ? "flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-body-sm text-foreground transition-colors duration-150 hover:bg-muted"
                : "flex shrink-0 items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-body-sm text-primary-foreground transition-opacity duration-150 hover:opacity-90"
            }
          >
            <Plus className="size-4" /> 追加
          </button>
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

      {showAdd && (
        <div className="mb-5 rounded-lg border border-border bg-card p-5">
          <h3 className="mb-3 text-body-sm font-medium text-foreground">
            新規メモ
          </h3>
          <textarea
            value={newContent}
            onChange={(event) => setNewContent(event.target.value)}
            placeholder="メモ内容を入力... URLは自動的にTechタグになります"
            className="mb-3 min-h-20 w-full resize-y rounded-md border border-border bg-card px-3 py-2 text-body-sm text-foreground outline-none transition-colors duration-150 placeholder:text-muted-foreground focus:border-foreground"
            // biome-ignore lint/a11y/noAutofocus: the form is opened by an explicit user action
            autoFocus
          />
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-caption text-muted-foreground">タグ</span>
            <button
              type="button"
              onClick={() => setNewTag("auto")}
              className={`rounded-md px-2.5 py-1 text-caption transition-colors duration-150 ${
                newTag === "auto"
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              自動判定
            </button>
            {TAG_ORDER.map((tag) => {
              const meta = TAG_META[tag];
              const active = newTag === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setNewTag(tag)}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-caption transition-colors duration-150 ${
                    active
                      ? "bg-foreground text-background"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <TagIcon name={meta.icon} className="size-3" /> {meta.label}
                </button>
              );
            })}
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowAdd(false);
                  setNewContent("");
                }}
                className="rounded-md px-3 py-1.5 text-body-sm text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleAdd}
                disabled={!newContent.trim() || createMutation.isPending}
                className="rounded-md bg-primary px-3 py-1.5 text-body-sm text-primary-foreground transition-opacity duration-150 hover:opacity-90 disabled:opacity-50"
              >
                保存
              </button>
            </div>
          </div>
        </div>
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
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
