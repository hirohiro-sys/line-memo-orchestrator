import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Plus, Search, X } from "lucide-react";
import type { Memo, MemoTag } from "@repo/shared";
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
    "rounded-xl px-3.5 py-2 text-[13px] font-medium transition-colors duration-200";

  return (
    <div className="p-4 md:p-7">
      <div className="mb-5 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="relative max-w-md flex-1">
            <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-black/40" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="メモを検索..."
              className="w-full rounded-lg border border-border bg-pure-white py-2.5 pr-9 pl-10 text-body-sm text-ink-black outline-none transition-colors duration-200 placeholder:text-ink-black/40 focus:border-notion-blue"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-ink-black/40 transition-colors duration-200 hover:text-ink-black"
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
                ? "flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-pure-white px-[15px] py-1.5 text-body-sm font-medium text-ink-black/90 transition-colors duration-200 hover:bg-paper-warmth"
                : "flex shrink-0 items-center gap-1.5 rounded-lg bg-notion-blue px-[15px] py-1.5 text-body-sm font-medium text-pure-white transition-opacity duration-200 hover:opacity-90"
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
                ? "bg-sky-tint text-notion-blue"
                : "border border-border bg-pure-white text-ink-black/60 hover:text-ink-black"
            }`}
          >
            すべて{" "}
            <span className="ml-0.5 text-[10px] text-ink-black/40">
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
                    ? meta.className
                    : "border border-border bg-pure-white text-ink-black/60 hover:text-ink-black"
                }`}
              >
                <TagIcon name={meta.icon} className="size-3.5" />
                {meta.label}
                <span className="rounded-full bg-pure-white/70 px-1.5 text-[10px] font-semibold text-ink-black/40">
                  {tagCounts[tag]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {showAdd && (
        <div className="mb-5 rounded-xl border border-border bg-pure-white p-6">
          <h3 className="mb-3 flex items-center gap-2 text-body-sm font-semibold text-ink-black">
            <Plus className="size-4 text-notion-blue" /> 新規メモ
          </h3>
          <textarea
            value={newContent}
            onChange={(event) => setNewContent(event.target.value)}
            placeholder="メモ内容を入力... URLは自動的にTechタグになります"
            className="mb-3 min-h-20 w-full resize-y rounded-lg border border-border bg-pure-white px-3.5 py-2.5 text-body-sm text-ink-black outline-none transition-colors duration-200 placeholder:text-ink-black/40 focus:border-notion-blue"
            autoFocus
          />
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-caption font-medium text-ink-black/60">
              タグ:
            </span>
            <button
              type="button"
              onClick={() => setNewTag("auto")}
              className={`rounded-lg px-3 py-1.5 text-caption font-medium transition-colors duration-200 ${
                newTag === "auto"
                  ? "bg-sky-tint text-notion-blue"
                  : "bg-paper-warmth text-ink-black/60"
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
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-caption font-medium transition-colors duration-200 ${
                    active ? meta.className : "bg-paper-warmth text-ink-black/60"
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
                className="rounded-lg px-[15px] py-1.5 text-body-sm font-medium text-ink-black/95 transition-colors duration-200 hover:bg-paper-warmth"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleAdd}
                disabled={!newContent.trim() || createMutation.isPending}
                className="rounded-lg bg-notion-blue px-[15px] py-1.5 text-body-sm font-medium text-pure-white transition-opacity duration-200 hover:opacity-90 disabled:opacity-50"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {memosQuery.isPending && (
        <p className="py-20 text-center text-body-sm text-ink-black/40">
          読み込み中...
        </p>
      )}

      {memosQuery.isError && (
        <p className="py-20 text-center text-body-sm text-coral">
          メモの取得に失敗しました
        </p>
      )}

      {memosQuery.isSuccess && filtered.length === 0 && (
        <div className="py-20 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-xl bg-paper-warmth">
            <FileText className="size-8 text-ink-black/20" />
          </div>
          <p className="text-body-sm font-medium text-ink-black/40">
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
