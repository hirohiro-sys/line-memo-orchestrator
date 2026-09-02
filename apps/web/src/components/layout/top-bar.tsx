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
    <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-border bg-background px-4 md:px-8">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-md p-1.5 text-muted-foreground transition-colors duration-150 hover:bg-card hover:text-foreground md:hidden"
        aria-label="メニューを開く"
      >
        <Menu className="size-4" />
      </button>
      <h1 className="min-w-0 flex-1 truncate text-[15px] font-medium text-foreground">
        {title}
      </h1>
    </header>
  );
}
