import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Bell, LogOut, Moon, Sun, User } from "lucide-react";
import type { User as AppUser } from "@repo/shared";
import { ToggleSwitch } from "@/components/toggle-switch";
import { TagIcon } from "@/components/memo/tag-icon";
import {
  fetchMemos,
  fetchNotifications,
  logout,
  updateNotifications,
} from "@/lib/api";
import { applyTheme, getStoredTheme } from "@/lib/theme";
import { TAG_META, TAG_ORDER, WEEKDAYS } from "@/lib/tag-meta";

export function SettingsView({ user }: { user: AppUser }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const memosQuery = useQuery({ queryKey: ["memos"], queryFn: fetchMemos });
  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
  });
  const [theme, setTheme] = useState<"light" | "dark">(getStoredTheme);

  const memos = memosQuery.data?.items ?? [];
  const notifications = notificationsQuery.data;
  const techCount = memos.filter((memo) => memo.tag === "tech").length;

  const notifyMutation = useMutation({
    mutationFn: updateNotifications,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  function handleTheme(next: boolean) {
    const value = next ? "dark" : "light";
    setTheme(value);
    applyTheme(value);
  }

  async function handleLogout() {
    await logout();
    await queryClient.clear();
    await navigate({ to: "/login" });
  }

  return (
    <div className="max-w-3xl space-y-5 p-4 md:p-7">
      <section className="rounded-xl border border-border bg-pure-white p-6">
        <h3 className="mb-1 flex items-center gap-2 text-base font-semibold text-ink-black">
          <div className="flex size-7 items-center justify-center rounded-xl bg-sky-tint">
            <Bell className="size-4 text-notion-blue" />
          </div>
          通知設定
        </h3>
        <p className="mb-5 text-body-sm leading-relaxed text-ink-black/60">
          その週に保存したTechタグのリソースをLINEでまとめて通知します。
        </p>

        {notifications && (
          <div className="rounded-xl border border-border bg-paper-warmth p-4">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sky-tint">
                  <TagIcon name={TAG_META.tech.icon} className="size-4 text-notion-blue" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-ink-black">
                    Tech週次通知
                  </p>
                  <p className="mt-0.5 text-[11px] text-ink-black/40">
                    今週保存した{techCount}件のTechメモをまとめて通知
                  </p>
                </div>
              </div>
              <ToggleSwitch
                checked={notifications.techWeeklyEnabled}
                onChange={(enabled) =>
                  notifyMutation.mutate({ techWeeklyEnabled: enabled })
                }
              />
            </div>

            {notifications.techWeeklyEnabled && (
              <div className="flex items-center gap-3 border-t border-border pt-3">
                <div className="flex-1">
                  <p className="mb-1.5 block text-[11px] font-semibold text-ink-black/60">
                    通知曜日
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {WEEKDAYS.map((day, index) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() =>
                          notifyMutation.mutate({ techWeeklyDay: index })
                        }
                        className={`size-8 rounded-lg text-[11px] font-semibold transition-colors duration-200 ${
                          notifications.techWeeklyDay === index
                            ? "bg-notion-blue text-pure-white"
                            : "border border-border bg-pure-white text-ink-black/60 hover:border-notion-blue"
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="w-28">
                  <label
                    htmlFor="notify-time"
                    className="mb-1.5 block text-[11px] font-semibold text-ink-black/60"
                  >
                    時刻
                  </label>
                  <input
                    id="notify-time"
                    type="time"
                    value={notifications.techWeeklyTime}
                    onChange={(event) =>
                      notifyMutation.mutate({
                        techWeeklyTime: event.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-border bg-pure-white px-2.5 py-2 text-center font-mono text-body-sm outline-none focus:border-notion-blue"
                  />
                </div>
              </div>
            )}

            {notifications.techWeeklyEnabled && (
              <div className="mt-3 rounded-lg border border-border bg-sky-tint px-3 py-2.5">
                <p className="text-[11px] font-medium text-notion-blue">
                  毎週{WEEKDAYS[notifications.techWeeklyDay]}曜日{" "}
                  {notifications.techWeeklyTime} にLINEへ通知されます
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-border bg-pure-white p-6">
        <h3 className="mb-1 flex items-center gap-2 text-base font-semibold text-ink-black">
          <div className="flex size-7 items-center justify-center rounded-xl bg-paper-warmth">
            {theme === "light" ? (
              <Moon className="size-4 text-ink-black/60" />
            ) : (
              <Sun className="size-4 text-marigold" />
            )}
          </div>
          外観
        </h3>
        <p className="mb-5 text-body-sm leading-relaxed text-ink-black/60">
          ダークモードの切り替えができます。
        </p>
        <div className="flex items-center justify-between rounded-xl border border-border bg-paper-warmth p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-pure-white">
              {theme === "light" ? (
                <Sun className="size-4 text-marigold" />
              ) : (
                <Moon className="size-4 text-notion-blue" />
              )}
            </div>
            <div>
              <p className="text-[13px] font-semibold text-ink-black">
                ダークモード
              </p>
              <p className="text-[11px] text-ink-black/40">
                現在: {theme === "dark" ? "オン" : "オフ"}
              </p>
            </div>
          </div>
          <ToggleSwitch checked={theme === "dark"} onChange={handleTheme} />
        </div>
      </section>

      <section className="rounded-xl border border-border bg-pure-white p-6">
        <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-ink-black">
          <div className="flex size-7 items-center justify-center rounded-xl bg-paper-warmth">
            <User className="size-4 text-ink-black/60" />
          </div>
          アカウント
        </h3>
        <div>
          <div className="flex items-center justify-between border-b border-border py-3">
            <span className="text-body-sm font-medium text-ink-black/60">
              メールアドレス
            </span>
            <span className="text-body-sm font-semibold text-ink-black">
              {user.email}
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-border py-3">
            <span className="text-body-sm font-medium text-ink-black/60">
              ユーザー名
            </span>
            <span className="text-body-sm font-semibold text-ink-black">
              {user.name}
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-border py-3">
            <span className="text-body-sm font-medium text-ink-black/60">
              LINE連携
            </span>
            <span className="flex items-center gap-1.5 text-body-sm font-semibold text-notion-blue">
              <span className="size-2 rounded-full bg-notion-blue" />
              {user.lineConnected ? "連携済み" : "未連携"}
            </span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-body-sm font-medium text-ink-black/60">
              メモ総数
            </span>
            <span className="text-body-sm font-semibold text-ink-black">
              {memos.length}件
            </span>
          </div>
        </div>
        <div className="mt-2 flex justify-end border-t border-border pt-4">
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-body-sm font-semibold text-coral transition-colors duration-200 hover:bg-coral/10"
          >
            <LogOut className="size-4" /> ログアウト
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-pure-white p-6">
        <h3 className="mb-1 text-base font-semibold text-ink-black">タグ一覧</h3>
        <p className="mb-4 text-body-sm leading-relaxed text-ink-black/60">
          LINE Botで使用する3つのタグです。
        </p>
        <div className="space-y-2.5">
          {TAG_ORDER.map((tag) => {
            const meta = TAG_META[tag];
            const count = memos.filter((memo) => memo.tag === tag).length;
            return (
              <div
                key={tag}
                className="flex items-center gap-3 rounded-xl border border-border bg-pure-white p-3.5"
              >
                <div
                  className={`flex size-9 items-center justify-center rounded-xl ${meta.className}`}
                >
                  <TagIcon name={meta.icon} className="size-4" />
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-semibold text-ink-black">
                    {meta.label}{" "}
                    <span className="font-mono text-[11px] font-medium text-ink-black/40">
                      {meta.hashtag}
                    </span>
                  </p>
                  <p className="text-[10px] text-ink-black/40">{meta.description}</p>
                </div>
                <span className="rounded-lg bg-paper-warmth px-2.5 py-1 text-caption font-semibold text-ink-black/40">
                  {count}件
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
