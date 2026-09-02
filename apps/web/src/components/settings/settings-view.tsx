import type { User as AppUser } from "@repo/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { useState } from "react";
import { TagIcon } from "@/components/memo/tag-icon";
import { ToggleSwitch } from "@/components/toggle-switch";
import {
  fetchMemos,
  fetchNotifications,
  logout,
  updateNotifications,
} from "@/lib/api";
import { TAG_META, TAG_ORDER, WEEKDAYS } from "@/lib/tag-meta";
import { applyTheme, getStoredTheme } from "@/lib/theme";

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
    <div className="max-w-2xl space-y-8 p-4 md:p-8">
      <section>
        <h3 className="mb-1 text-[13px] font-medium text-foreground">通知</h3>
        <p className="mb-4 text-body-sm text-muted-foreground">
          その週に保存したTechタグのリソースをLINEでまとめて通知します。
        </p>

        {notifications && (
          <div className="border-t border-border">
            <div className="flex items-start justify-between gap-3 py-4">
              <div>
                <p className="text-[13px] text-foreground">Tech週次通知</p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  今週保存した{techCount}件のTechメモをまとめて通知
                </p>
              </div>
              <ToggleSwitch
                checked={notifications.techWeeklyEnabled}
                onChange={(enabled) =>
                  notifyMutation.mutate({ techWeeklyEnabled: enabled })
                }
              />
            </div>

            {notifications.techWeeklyEnabled && (
              <div className="flex items-center gap-3 border-t border-border py-4">
                <div className="flex-1">
                  <p className="mb-1.5 text-[12px] text-muted-foreground">
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
                        className={`size-8 rounded-md text-[11px] transition-colors duration-150 ${
                          notifications.techWeeklyDay === index
                            ? "bg-foreground text-background"
                            : "border border-border text-muted-foreground hover:text-foreground"
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
                    className="mb-1.5 block text-[12px] text-muted-foreground"
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
                    className="w-full rounded-md border border-border bg-card px-2.5 py-1.5 text-center font-mono text-body-sm outline-none focus:border-foreground"
                  />
                </div>
              </div>
            )}

            {notifications.techWeeklyEnabled && (
              <p className="border-t border-border py-3 text-[12px] text-muted-foreground">
                毎週{WEEKDAYS[notifications.techWeeklyDay]}曜日{" "}
                {notifications.techWeeklyTime} にLINEへ通知されます
              </p>
            )}
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-1 text-[13px] font-medium text-foreground">外観</h3>
        <p className="mb-4 text-body-sm text-muted-foreground">
          ダークモードの切り替えができます。
        </p>
        <div className="flex items-center justify-between border-t border-border py-4">
          <div>
            <p className="text-[13px] text-foreground">ダークモード</p>
            <p className="text-[12px] text-muted-foreground">
              現在: {theme === "dark" ? "オン" : "オフ"}
            </p>
          </div>
          <ToggleSwitch checked={theme === "dark"} onChange={handleTheme} />
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-[13px] font-medium text-foreground">
          アカウント
        </h3>
        <div className="border-t border-border">
          <div className="flex items-center justify-between border-b border-border py-3">
            <span className="text-body-sm text-muted-foreground">
              メールアドレス
            </span>
            <span className="text-body-sm text-foreground">{user.email}</span>
          </div>
          <div className="flex items-center justify-between border-b border-border py-3">
            <span className="text-body-sm text-muted-foreground">
              ユーザー名
            </span>
            <span className="text-body-sm text-foreground">{user.name}</span>
          </div>
          <div className="flex items-center justify-between border-b border-border py-3">
            <span className="text-body-sm text-muted-foreground">LINE連携</span>
            <span className="text-body-sm text-foreground">
              {user.lineConnected ? "連携済み" : "未連携"}
            </span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-body-sm text-muted-foreground">メモ総数</span>
            <span className="text-body-sm tabular-nums text-foreground">
              {memos.length}件
            </span>
          </div>
        </div>
        <div className="mt-2 flex justify-end pt-2">
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-body-sm text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-destructive"
          >
            <LogOut className="size-3.5" /> ログアウト
          </button>
        </div>
      </section>

      <section>
        <h3 className="mb-1 text-[13px] font-medium text-foreground">タグ</h3>
        <p className="mb-4 text-body-sm text-muted-foreground">
          LINE Botで使用する3つのタグです。
        </p>
        <div className="divide-y divide-border border-t border-border">
          {TAG_ORDER.map((tag) => {
            const meta = TAG_META[tag];
            const count = memos.filter((memo) => memo.tag === tag).length;
            return (
              <div key={tag} className="flex items-center gap-3 py-3">
                <TagIcon
                  name={meta.icon}
                  className="size-4 text-muted-foreground"
                />
                <div className="flex-1">
                  <p className="text-[13px] text-foreground">
                    {meta.label}{" "}
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {meta.hashtag}
                    </span>
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {meta.description}
                  </p>
                </div>
                <span className="text-[12px] tabular-nums text-muted-foreground">
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
