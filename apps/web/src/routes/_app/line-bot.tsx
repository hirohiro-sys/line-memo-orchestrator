import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/line-bot")({
  component: LineBotPlaceholder,
});

function LineBotPlaceholder() {
  return (
    <div className="p-6 text-body-sm text-ink-black/60">
      LINE Bot 画面は後のステップで実装します。
    </div>
  );
}
