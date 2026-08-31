import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { healthResponseSchema } from "@repo/shared";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const health = useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      const res = await fetch("/api/health");
      if (!res.ok) throw new Error("health check failed");
      return healthResponseSchema.parse(await res.json());
    },
  });

  return (
    <main>
      <h1>line-memo-orchestrator</h1>
      <p>
        API health:{" "}
        {health.isPending
          ? "loading..."
          : health.isError
            ? "error"
            : health.data.status}
      </p>
      <button type="button" onClick={() => void health.refetch()}>
        Recheck
      </button>
    </main>
  );
}
