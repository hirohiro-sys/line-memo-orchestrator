import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/settings")({
  component: SettingsPlaceholder,
});

function SettingsPlaceholder() {
  return (
    <div className="p-6 text-body-sm text-ink-black/60">
      設定画面は後のステップで実装します。
    </div>
  );
}
