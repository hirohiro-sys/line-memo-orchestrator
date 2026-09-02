import { createFileRoute } from "@tanstack/react-router";
import { MemoList } from "@/components/memo/memo-list";

export const Route = createFileRoute("/_app/")({
  component: MemoListPage,
});

function MemoListPage() {
  return <MemoList />;
}
