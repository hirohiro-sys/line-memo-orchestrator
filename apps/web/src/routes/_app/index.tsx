import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/")({
  component: MemoBoardPlaceholder,
});

function MemoBoardPlaceholder() {
  return (
    <div className="p-6 text-body-sm text-ink-black/60">
      メモボードは次のステップで実装します。
    </div>
  );
}
