"use client";

// ─── Types ─────────────────────────────────────────────────────

export interface TrendNarrativeProps {
  data: Array<{
    movementDays: number;
    movementDirection: string;
  }>;
  category: string;
  country: string;
  chartMode: string;
}

// ─── Component ──────────────────────────────────────────────────

export function TrendNarrative({
  data,
  category,
  country,
  chartMode,
}: TrendNarrativeProps) {
  if (!data.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No movement data available for the selected filters.
      </p>
    );
  }

  const totalMonths = data.length;
  const forwardMonths = data.filter((d) => d.movementDirection === "forward");
  const backwardMonths = data.filter((d) => d.movementDirection === "backward");
  const flatMonths = data.filter((d) => d.movementDirection === "unchanged");

  const netDays = data.reduce((sum, d) => {
    if (d.movementDirection === "backward") return sum - Math.abs(d.movementDays);
    if (d.movementDirection === "forward") return sum + d.movementDays;
    return sum;
  }, 0);

  const totalForwardDays = forwardMonths.reduce(
    (sum, d) => sum + d.movementDays,
    0,
  );
  const avgForward =
    forwardMonths.length > 0
      ? Math.round(totalForwardDays / forwardMonths.length)
      : 0;

  const direction = netDays >= 0 ? "forward" : "backward";
  const absNet = Math.abs(netDays);

  const chartLabel = chartMode.toLowerCase();

  const parts: string[] = [];

  parts.push(
    `Over the last ${totalMonths} months, ${category} ${country} ${chartLabel} dates moved ${direction} a net ${absNet} day${absNet !== 1 ? "s" : ""}.`,
  );

  const details: string[] = [];
  if (flatMonths.length > 0) {
    details.push(
      `${flatMonths.length} flat month${flatMonths.length !== 1 ? "s" : ""}`,
    );
  }
  if (backwardMonths.length > 0) {
    details.push(
      `${backwardMonths.length} retrogression${backwardMonths.length !== 1 ? "s" : ""}`,
    );
  }
  if (details.length > 0) {
    parts.push(`There ${details.length === 1 && flatMonths.length === 1 ? "was" : "were"} ${details.join(" and ")}.`);
  }

  if (forwardMonths.length > 0) {
    parts.push(
      `Average monthly forward movement was approximately ${avgForward} day${avgForward !== 1 ? "s" : ""}.`,
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm leading-relaxed text-foreground/80">
        {parts.join(" ")}
      </p>
      <p className="text-[11px] leading-relaxed text-muted-foreground/70 italic">
        This summary reflects historical bulletin data and does not predict
        future priority date movement.
      </p>
    </div>
  );
}
