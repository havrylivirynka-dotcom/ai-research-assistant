const LABELS: Record<string, string> = {
  credibility: "Credibility",
  relevance: "Relevance",
  freshness: "Freshness",
  methodologyQuality: "Methodology quality",
};

export function CategoryScores({
  scores,
}: {
  scores: Record<string, number>;
}) {
  return (
    <div className="space-y-3">
      {Object.entries(LABELS).map(([key, label]) => {
        const value = scores[key] ?? 0;
        return (
          <div key={key} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{label}</span>
              <span className="tabular-nums font-medium">
                {value.toFixed(1)}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${(value / 10) * 100}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
