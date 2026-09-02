import type { User } from "@repo/shared";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { Inbox, LogOut, Settings2, X } from "lucide-react";
import { fetchMemos, fetchNotifications, logout } from "@/lib/api";

const NAV_ITEMS = [
  { to: "/", label: "メモ一覧", icon: Inbox, exact: true },
  { to: "/settings", label: "設定", icon: Settings2, exact: false },
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
        <p className="text-[17px] font-semibold tracking-tight text-foreground">
          MemoHub
        </p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">LINE連動メモ</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3">
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
                className="relative flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] text-muted-foreground no-underline transition-colors duration-150 hover:bg-muted hover:text-foreground"
                activeProps={{
                  className:
                    "bg-muted text-foreground hover:bg-muted hover:text-foreground",
                }}
              >
                <Icon className="size-4" />
                <span className="flex-1 text-left">{item.label}</span>
                {badge > 0 && (
                  <span className="text-[11px] tabular-nums text-muted-foreground">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <div className="mt-6 px-2.5">
          <p className="mb-2 text-[11px] text-muted-foreground">今週の Tech</p>
          <p className="text-[13px] text-foreground">
            {techCount}件
            <span className="ml-1.5 text-muted-foreground">
              {notifyOn ? "通知オン" : "通知オフ"}
            </span>
          </p>
        </div>
      </nav>

      <div className="border-t border-border px-3 py-3">
        <div className="flex items-center gap-2 px-1.5 py-1">
          <div className="flex size-7 items-center justify-center rounded-md bg-muted text-[11px] font-medium text-foreground">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] text-foreground">{user.email}</p>
            <p className="text-[11px] text-muted-foreground">
              {user.lineConnected ? "LINE連携済み" : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="rounded-md p-1.5 text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
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
      <aside className="sticky top-0 z-20 hidden h-screen w-[260px] shrink-0 flex-col border-r border-border bg-card md:flex">
        {nav}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-foreground/30"
            aria-label="メニューを閉じる"
            onClick={onCloseMobile}
          />
          <aside className="absolute top-0 bottom-0 left-0 flex w-[260px] flex-col bg-card">
            <button
              type="button"
              onClick={onCloseMobile}
              className="absolute top-4 right-3 rounded-md p-1.5 text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
              aria-label="閉じる"
            >
              <X className="size-4" />
            </button>
            {nav}
          </aside>
        </div>
      )}
    </>
  );
}
