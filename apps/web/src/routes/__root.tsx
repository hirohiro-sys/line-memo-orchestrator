import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ToastProvider } from "@/components/ui/toast";

const queryClient = new QueryClient();

function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <Outlet />
        <TanStackRouterDevtools />
      </ToastProvider>
    </QueryClientProvider>
  );
}

export const Route = createRootRoute({
  component: RootLayout,
});
