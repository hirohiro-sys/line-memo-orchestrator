import { createFileRoute } from "@tanstack/react-router";
import { MemoBoard } from "@/components/memo/memo-board";

export const Route = createFileRoute("/_app/")({
  component: MemoBoardPage,
});

function MemoBoardPage() {
  return <MemoBoard />;
}
