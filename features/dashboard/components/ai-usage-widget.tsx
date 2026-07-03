import { WidgetCard } from "./widget-card";

export function AiUsageWidget({
  usage,
}: {
  usage: { requests: number; tokens: number; cost: number };
}) {
  return (
    <WidgetCard title="AI usage this month" viewAllHref="/usage">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-2xl font-semibold tabular-nums">
            {usage.requests}
          </p>
          <p className="text-xs text-muted-foreground">Requests</p>
        </div>
        <div>
          <p className="text-2xl font-semibold tabular-nums">
            {usage.tokens.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">Tokens</p>
        </div>
        <div>
          <p className="text-2xl font-semibold tabular-nums">
            ${usage.cost.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground">Est. cost</p>
        </div>
      </div>
    </WidgetCard>
  );
}
