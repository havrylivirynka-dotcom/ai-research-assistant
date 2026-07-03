const ENDPOINT_LABELS: Record<string, string> = {
  "/api/articles/evaluate": "Source Evaluation",
  "/api/uploads/pdf": "PDF Analyzer",
  "/api/bibliography/analyze": "Bibliography Checker",
  "/api/bibliography/reanalyze": "Bibliography Checker",
  "/api/chat": "AI Assistant",
  "/api/research/structure": "Structure Generator",
};

export function EndpointBreakdown({
  breakdown,
}: {
  breakdown: { endpoint: string; requests: number; tokens: number; cost: number }[];
}) {
  const maxTokens = Math.max(...breakdown.map((b) => b.tokens), 1);

  if (breakdown.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No AI usage recorded yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {breakdown.map((item) => (
        <div key={item.endpoint} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span>{ENDPOINT_LABELS[item.endpoint] ?? item.endpoint}</span>
            <span className="text-muted-foreground">
              {item.requests} request{item.requests === 1 ? "" : "s"} ·{" "}
              {item.tokens.toLocaleString()} tokens · $
              {item.cost.toFixed(3)}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${(item.tokens / maxTokens) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
