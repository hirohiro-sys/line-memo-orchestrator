import { Menu } from "lucide-react";

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "メモボード", subtitle: "メモの検索・追加・削除" },
  "/line-bot": { title: "LINE Bot", subtitle: "Botの動作とタグ分類ルール" },
  "/settings": { title: "設定", subtitle: "通知・外観・アカウントの管理" },
};

export function TopBar({
  pathname,
  onMenuClick,
}: {
  pathname: string;
  onMenuClick: () => void;
}) {
  const meta = PAGE_META[pathname] ?? PAGE_META["/"];

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b border-border bg-paper-warmth px-4 md:px-8">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-lg p-2 text-ink-black/60 transition-colors duration-200 hover:bg-pure-white hover:text-ink-black md:hidden"
        aria-label="メニューを開く"
      >
        <Menu className="size-5" />
      </button>
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-lg font-semibold text-ink-black">{meta.title}</h2>
        <p className="truncate text-caption text-ink-black/40">{meta.subtitle}</p>
      </div>
    </header>
  );
}
