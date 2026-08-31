import { createFileRoute } from "@tanstack/react-router";
import { LineBotView } from "@/components/line-bot/line-bot-view";

export const Route = createFileRoute("/_app/line-bot")({
  component: LineBotPage,
});

function LineBotPage() {
  return <LineBotView />;
}
