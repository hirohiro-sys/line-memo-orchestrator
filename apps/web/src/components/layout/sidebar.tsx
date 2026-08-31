import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Bot, FileText, Lightbulb, LogOut, Settings, X } from "lucide-react";
import { fetchMemos, fetchNotifications, logout } from "@/lib/api";
import type { User } from "@repo/shared";

const NAV_ITEMS = [
  { to: "/", label: "メモボード", icon: FileText, exact: true },
  { to: "/line-bot", label: "LINE Bot", icon: Bot, exact: false },
  { to: "/settings", label: "設定", icon: Settings, exact: false },
] as const;

export function Sidebar({
  user,
  mobileOpen,
  onCloseMobile,
}: {
  user: User;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const memos = useQuery({ queryKey: ["memos"], queryFn: fetchMemos });
  const notifications = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
  });

  const memoCount = memos.data?.items.length ?? 0;
  const techCount =
    memos.data?.items.filter((memo) => memo.tag === "tech").length ?? 0;
  const notifyOn = notifications.data?.techWeeklyEnabled ?? false;

  async function handleLogout() {
    await logout();
    await queryClient.clear();
    onCloseMobile();
    await navigate({ to: "/login" });
  }

  const nav = (
    <>
      <div className="border-b border-border px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-notion-blue">
            <Lightbulb className="size-5 text-pure-white" />
          </div>
          <div>
            <p className="text-[15px] font-semibold leading-tight text-ink-black">
              MemoHub
            </p>
            <p className="text-[10px] font-medium text-ink-black/40">
              LINE連動メモ
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-3 text-[10px] font-semibold tracking-wider text-ink-black/40 uppercase">
          メニュー
        </p>
        <div className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const badge = item.to === "/" ? memoCount : 0;
            return (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.exact }}
                onClick={onCloseMobile}
                className="relative flex w-full items-center gap-3 rounded-xl px-3 py-[9px] text-[13px] font-medium text-ink-black/54 no-underline transition-colors duration-200 hover:bg-paper-warmth hover:text-ink-black"
                activeProps={{
                  className:
                    "bg-sky-tint text-notion-blue hover:bg-sky-tint hover:text-notion-blue",
                }}
              >
                <Icon className="size-[18px]" />
                <span className="flex-1 text-left">{item.label}</span>
                {badge > 0 && (
                  <span className="rounded-full bg-pure-white px-2 py-0.5 text-[10px] font-semibold text-ink-black/40">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <div className="mt-5">
          <p className="mb-2 px-3 text-[10px] font-semibold tracking-wider text-ink-black/40 uppercase">
            今週のTech
          </p>
          <div className="rounded-xl border border-border bg-sky-tint px-3 py-3">
            <div className="mb-1.5 flex items-center gap-2">
              <Bell className="size-3.5 text-notion-blue" />
              <p className="text-[11px] font-semibold text-notion-blue">
                {notifyOn ? "通知オン" : "通知オフ"}
              </p>
            </div>
            <p className="text-[10px] font-medium text-notion-blue/70">
              {techCount}件のTechメモ
            </p>
          </div>
        </div>
      </nav>

      <div className="border-t border-border px-3 py-3">
        <div className="flex items-center gap-2 px-3 py-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-notion-blue text-xs font-semibold text-pure-white">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-ink-black">
              {user.email}
            </p>
            <p className="text-[10px] text-ink-black/40">
              {user.lineConnected ? "LINE連携済み" : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="rounded-lg p-2 text-ink-black/40 transition-colors duration-200 hover:bg-coral/10 hover:text-coral"
            aria-label="ログアウト"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <aside className="sticky top-0 z-20 hidden h-screen w-[260px] shrink-0 flex-col border-r border-border bg-pure-white md:flex">
        {nav}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink-black/40"
            aria-label="メニューを閉じる"
            onClick={onCloseMobile}
          />
          <aside className="absolute top-0 bottom-0 left-0 flex w-[260px] flex-col bg-pure-white">
            <button
              type="button"
              onClick={onCloseMobile}
              className="absolute top-4 right-3 rounded-lg p-2 text-ink-black/40 transition-colors duration-200 hover:bg-paper-warmth hover:text-ink-black"
              aria-label="閉じる"
            >
              <X className="size-5" />
            </button>
            {nav}
          </aside>
        </div>
      )}
    </>
  );
}
