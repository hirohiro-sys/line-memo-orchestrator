import { Menu } from "lucide-react";

const PAGE_TITLES: Record<string, string> = {
  "/": "メモ一覧",
  "/settings": "設定",
};

export function TopBar({
  pathname,
  onMenuClick,
}: {
  pathname: string;
  onMenuClick: () => void;
}) {
  const title = PAGE_TITLES[pathname] ?? PAGE_TITLES["/"];

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
      <h2 className="min-w-0 flex-1 truncate text-lg font-semibold text-ink-black">
        {title}
      </h2>
    </header>
  );
}
