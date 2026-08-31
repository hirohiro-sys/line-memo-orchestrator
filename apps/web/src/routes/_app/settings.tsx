import { createFileRoute } from "@tanstack/react-router";
import { SettingsView } from "@/components/settings/settings-view";
import { Route as AppRoute } from "../_app";

export const Route = createFileRoute("/_app/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = AppRoute.useRouteContext();
  return <SettingsView user={user} />;
}
