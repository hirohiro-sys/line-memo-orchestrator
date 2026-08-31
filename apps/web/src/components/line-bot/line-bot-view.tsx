import { useState } from "react";
import {
  Bot,
  Image as ImageIcon,
  Lightbulb,
  Link2,
  MessageCircle,
  Send,
} from "lucide-react";
import type { MemoTag } from "@repo/shared";
import { classifyMessage } from "@/lib/classify";
import { formatTime } from "@/lib/format";
import { TAG_META, TAG_ORDER } from "@/lib/tag-meta";
import { TagIcon } from "@/components/memo/tag-icon";

interface SimMessage {
  id: number;
  text: string;
  hasImage: boolean;
  result: ReturnType<typeof classifyMessage>;
  time: string;
  needsReply: boolean;
}

const SAMPLE_MESSAGES: { text: string; hasImage: boolean }[] = [
  { text: "今日のランチ美味しかった #tweet", hasImage: false },
  { text: "https://supabase.com/docs/guides/realtime", hasImage: false },
  { text: "面白い記事見つけた #news", hasImage: false },
  { text: "白板の写真", hasImage: true },
  { text: "APIのエラーハンドリング大事だよね", hasImage: false },
];

function toMessage(
  id: number,
  text: string,
  hasImage: boolean,
  time: string,
): SimMessage {
  const result = classifyMessage(hasImage ? "" : text, hasImage);
  return { id, text, hasImage, result, time, needsReply: result.needsConfirmation };
}

export function LineBotView() {
  const [messages, setMessages] = useState<SimMessage[]>(() =>
    SAMPLE_MESSAGES.slice(0, 3).map((sample, index) =>
      toMessage(
        index,
        sample.text,
        sample.hasImage,
        `${String(9 + index).padStart(2, "0")}:${String(index * 15).padStart(2, "0")}`,
      ),
    ),
  );
  const [input, setInput] = useState("");
  const [pendingConfirm, setPendingConfirm] = useState<SimMessage | null>(null);
  const [nextId, setNextId] = useState(3);

  function sendText(text: string) {
    if (!text || pendingConfirm) return;
    const result = classifyMessage(text, false);
    const msg: SimMessage = {
      id: nextId,
      text,
      hasImage: false,
      result,
      time: formatTime(new Date().toISOString()),
      needsReply: result.needsConfirmation,
    };
    setMessages((prev) => [...prev, msg]);
    setNextId((id) => id + 1);
    setInput("");
    if (result.needsConfirmation) setPendingConfirm(msg);
  }

  function sendImage() {
    if (pendingConfirm) return;
    const result = classifyMessage("", true);
    const msg: SimMessage = {
      id: nextId,
      text: "[画像]",
      hasImage: true,
      result,
      time: formatTime(new Date().toISOString()),
      needsReply: result.needsConfirmation,
    };
    setMessages((prev) => [...prev, msg]);
    setNextId((id) => id + 1);
  }

  function handleSelectTag(tag: MemoTag) {
    if (!pendingConfirm) return;
    setMessages((prev) =>
      prev.map((message) =>
        message.id === pendingConfirm.id
          ? { ...message, result: { tag, needsConfirmation: false }, needsReply: false }
          : message,
      ),
    );
    setPendingConfirm(null);
  }

  return (
    <div className="p-4 md:p-7">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-3 flex items-center gap-2 text-body-sm font-semibold text-ink-black">
            <div className="flex size-6 items-center justify-center rounded-lg bg-sky-tint">
              <Bot className="size-3.5 text-notion-blue" />
            </div>
            LINE Botチャット（プレビュー）
          </h3>
          <div className="mx-auto max-w-sm rounded-xl bg-midnight-ink p-3.5">
            <div className="mb-2.5 flex items-center gap-3 rounded-xl bg-notion-blue px-3 py-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-pure-white/15">
                <Lightbulb className="size-5 text-pure-white" />
              </div>
              <div className="flex-1">
                <p className="text-body-sm font-semibold text-pure-white">
                  MemoHub Bot
                </p>
                <p className="text-[10px] text-pure-white/70">
                  メモを送るだけで自動分類
                </p>
              </div>
              <span className="text-[10px] font-medium text-pure-white/70">
                オンライン
              </span>
            </div>

            <div className="max-h-[440px] space-y-2.5 overflow-y-auto rounded-xl bg-charcoal p-3">
              <div className="text-center">
                <span className="rounded-full bg-ink-black/20 px-3 py-1 text-[10px] font-medium text-pure-white/60">
                  チャットを開始
                </span>
              </div>
              {messages.map((message) => {
                const meta = TAG_META[message.result.tag];
                return (
                  <div key={message.id}>
                    <div className="flex items-start gap-2">
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-notion-blue">
                        <Lightbulb className="size-3.5 text-pure-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="rounded-xl rounded-tl-md bg-ink-black/30 p-2.5">
                          {message.hasImage ? (
                            <div className="flex h-20 items-center justify-center rounded-lg bg-ink-black/20">
                              <ImageIcon className="size-6 text-pure-white/40" />
                            </div>
                          ) : (
                            <p className="text-caption leading-relaxed break-words text-pure-white">
                              {message.text}
                            </p>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${meta.className}`}
                          >
                            <TagIcon name={meta.icon} className="size-2.5" />
                            {meta.label}
                          </span>
                          <span className="text-[9px] font-medium text-pure-white/40">
                            {message.needsReply ? "確認中" : "保存済み"} ·{" "}
                            {message.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {pendingConfirm && (
                <div className="rounded-xl border border-notion-blue/30 bg-notion-blue/20 p-3">
                  <p className="mb-2 text-[10px] font-medium text-pure-white/80">
                    タグ「{pendingConfirm.text.match(/#(\S+)/)?.[0]}」は未定義です。どのタグに保存しますか？
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {TAG_ORDER.map((tag) => {
                      const meta = TAG_META[tag];
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleSelectTag(tag)}
                          className="flex items-center gap-1.5 rounded-xl border border-pure-white/20 bg-ink-black/30 px-3 py-2 text-[11px] font-medium text-pure-white transition-colors duration-200 hover:bg-notion-blue"
                        >
                          <TagIcon name={meta.icon} className="size-3" />
                          {meta.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-2.5 flex items-center gap-2 rounded-xl bg-charcoal px-2.5 py-2.5">
              <button
                type="button"
                onClick={sendImage}
                disabled={!!pendingConfirm}
                className="flex size-9 items-center justify-center rounded-full bg-ink-black/30 text-pure-white/60 transition-colors duration-200 hover:text-pure-white disabled:opacity-50"
                aria-label="画像を送信"
              >
                <ImageIcon className="size-4" />
              </button>
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") sendText(input.trim());
                }}
                placeholder={
                  pendingConfirm ? "タグを選択してください..." : "メモを送信..."
                }
                disabled={!!pendingConfirm}
                className="flex-1 rounded-full bg-ink-black/30 px-3.5 py-2.5 text-caption text-pure-white outline-none placeholder:text-pure-white/40 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => sendText(input.trim())}
                disabled={!input.trim() || !!pendingConfirm}
                className="flex size-9 items-center justify-center rounded-full bg-notion-blue disabled:opacity-50"
                aria-label="送信"
              >
                <Send className="size-4 text-pure-white" />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-pure-white p-5">
            <h3 className="mb-4 flex items-center gap-2 text-body-sm font-semibold text-ink-black">
              <div className="flex size-6 items-center justify-center rounded-lg bg-sky-tint">
                <MessageCircle className="size-3.5 text-notion-blue" />
              </div>
              タグ分類ルール
            </h3>
            <div className="space-y-3">
              <div className="rounded-xl border border-border bg-paper-warmth p-3.5">
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="rounded-full bg-sky-tint px-2 py-0.5 text-[10px] font-semibold text-notion-blue">
                    ルール 1
                  </span>
                  <p className="text-[13px] font-semibold text-ink-black">
                    ハッシュタグ付き
                  </p>
                </div>
                <p className="text-[11px] leading-relaxed text-ink-black/60">
                  <code className="font-semibold text-notion-blue">#tweet</code>{" "}
                  <code className="font-semibold text-notion-blue">#tech</code>{" "}
                  <code className="font-semibold text-notion-blue">#other</code>{" "}
                  のいずれかがついていれば、そのタグでそのまま保存。クイックリプライなし。
                </p>
              </div>

              <div className="rounded-xl border border-marigold/40 bg-marigold/10 p-3.5">
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="rounded-full bg-marigold/20 px-2 py-0.5 text-[10px] font-semibold text-charcoal">
                    ルール 2
                  </span>
                  <p className="text-[13px] font-semibold text-ink-black">
                    未知のハッシュタグ
                  </p>
                </div>
                <p className="text-[11px] leading-relaxed text-ink-black/60">
                  3つのタグにないハッシュタグ（例:{" "}
                  <code className="font-semibold">#news</code>
                  ）がついている場合、クイックリプライで3つのタグから選ばせる。
                </p>
              </div>

              <div className="rounded-xl border border-border bg-paper-warmth p-3.5">
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="rounded-full bg-sky-tint px-2 py-0.5 text-[10px] font-semibold text-signal-blue">
                    ルール 3
                  </span>
                  <p className="text-[13px] font-semibold text-ink-black">
                    タグなし — 自動判定
                  </p>
                </div>
                <div className="mt-2 space-y-1.5 text-[11px] text-ink-black/60">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="size-3 text-signal-blue" />
                    テキスト →{" "}
                    <span className="font-semibold text-signal-blue">#tweet</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link2 className="size-3 text-notion-blue" />
                    URL →{" "}
                    <span className="font-semibold text-notion-blue">#tech</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ImageIcon className="size-3 text-stone" />
                    画像 → <span className="font-semibold text-stone">#other</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-coral/30 bg-coral/10 p-3.5">
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="rounded-full bg-coral/15 px-2 py-0.5 text-[10px] font-semibold text-coral">
                    ルール 4
                  </span>
                  <p className="text-[13px] font-semibold text-ink-black">
                    複数種類の混在
                  </p>
                </div>
                <p className="text-[11px] leading-relaxed text-ink-black/60">
                  テキスト+画像、テキスト+URLなど複数種類が混在する場合は、クイックリプライでどのタグにするか確認。
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-pure-white p-5">
            <h3 className="mb-3 flex items-center gap-2 text-body-sm font-semibold text-ink-black">
              <div className="flex size-6 items-center justify-center rounded-lg bg-paper-warmth">
                <Send className="size-3.5 text-ink-black/40" />
              </div>
              試してみる
            </h3>
            <p className="mb-3 text-[11px] leading-relaxed text-ink-black/40">
              チャット画面からメッセージを送信すると、分類ロジックを体験できます。
            </p>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_MESSAGES.filter((sample) => !sample.hasImage)
                .slice(2)
                .map((sample) => (
                  <button
                    key={sample.text}
                    type="button"
                    onClick={() => setInput(sample.text)}
                    className="rounded-lg bg-paper-warmth px-2.5 py-1.5 text-[10px] font-medium text-ink-black/60 transition-colors duration-200 hover:bg-sky-tint hover:text-notion-blue"
                  >
                    {sample.text.length > 30
                      ? `${sample.text.slice(0, 30)}...`
                      : sample.text}
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
