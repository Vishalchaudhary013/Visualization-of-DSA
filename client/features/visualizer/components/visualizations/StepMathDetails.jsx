const computeGraphDegree = (vertex, edges = [], directed) => {
  if (vertex < 0) {
    return { outgoing: 0, incoming: 0, total: 0 };
  }
  let outgoing = 0;
  let incoming = 0;
  for (const [from, to] of edges) {
    if (from === vertex) outgoing++;
    if (directed) {
      if (to === vertex) incoming++;
    } else {
      if (to === vertex) outgoing++;
    }
  }
  const total = directed ? outgoing + incoming : outgoing;
  return { outgoing, incoming: directed ? incoming : outgoing, total };
};
export function StepMathDetails({
  step,
  isSorting,
  isSearching,
  isGraph,
  searchTarget,
  graphInfo,
}) {
  if (!step) {
    return (
      <p className="text-sm text-muted-foreground">
        Run the algorithm to view step-by-step mathematical reasoning.
      </p>
    );
  }
  const array = step.state || [];
  const comparisons = step.comparisons || [];
  const swaps = step.swaps || [];
  const sorted = step.sorted || [];
  const comparisonDescriptions = [];
  if (isSorting && comparisons.length >= 2) {
    for (let i = 0; i < comparisons.length; i += 2) {
      const leftIndex = comparisons[i];
      const rightIndex = comparisons[i + 1];
      if (typeof leftIndex === "undefined" || typeof rightIndex === "undefined")
        continue;
      const leftValue = array[leftIndex];
      const rightValue = array[rightIndex];
      if (typeof leftValue === "undefined" || typeof rightValue === "undefined")
        continue;
      const delta = leftValue - rightValue;
      const relation = delta > 0 ? ">" : delta < 0 ? "<" : "=";
      comparisonDescriptions.push({
        title: `Compare a[${leftIndex}] and a[${rightIndex}]`,
        detail: `${leftValue} ${relation} ${rightValue}`,
        conclusion: `Δ = ${leftValue} - ${rightValue} = ${delta}`,
      });
    }
  } else if (isSearching && comparisons.length === 1) {
    const idx = comparisons[0];
    const currentValue = typeof idx === "number" ? array[idx] : undefined;
    if (
      typeof idx === "number" &&
      typeof currentValue !== "undefined" &&
      typeof searchTarget !== "undefined"
    ) {
      const delta = currentValue - searchTarget;
      const relation = delta === 0 ? "=" : delta > 0 ? ">" : "<";
      const direction =
        delta === 0
          ? "Values match — target found."
          : delta > 0
            ? "Current value is greater, move left."
            : "Current value is smaller, move right.";
      comparisonDescriptions.push({
        title: `Compare a[${idx}] with target`,
        detail: `${currentValue} ${relation} ${searchTarget}`,
        conclusion: `${direction} Δ = ${currentValue} - ${searchTarget} = ${delta}`,
      });
    }
  } else if (isGraph && comparisons.length >= 1) {
    const currentVertex = comparisons[comparisons.length - 1];
    const degree = graphInfo
      ? computeGraphDegree(currentVertex, graphInfo.edges, graphInfo.directed)
      : { outgoing: 0, incoming: 0, total: 0 };
    comparisonDescriptions.push({
      title: `Visit vertex ${currentVertex}`,
      detail: graphInfo
        ? graphInfo.directed
          ? `Out-degree = ${degree.outgoing}, In-degree = ${degree.incoming}`
          : `Degree = ${degree.total}`
        : "Graph metrics unavailable",
      conclusion: graphInfo
        ? `Remaining unvisited vertices ≈ ${Math.max((graphInfo?.vertices ?? 0) - sorted.length, 0)}`
        : undefined,
    });
  }
  const swapDescriptions = [];
  if (isSorting && swaps.length >= 2) {
    const [i, j] = swaps;
    const valueI = typeof i === "number" ? array[i] : undefined;
    const valueJ = typeof j === "number" ? array[j] : undefined;
    const distance =
      typeof i === "number" && typeof j === "number" ? Math.abs(i - j) : null;
    swapDescriptions.push({
      title: `Swap positions ${i} ↔ ${j}`,
      detail: `Values now at indices: ${valueI} and ${valueJ}${distance !== null ? ` (distance ${distance})` : ""}`,
    });
  } else if (isSearching && swaps.length === 1) {
    const idx = swaps[0];
    const value = typeof idx === "number" ? array[idx] : undefined;
    swapDescriptions.push({
      title: "Target located",
      detail: `Index ${idx} holds ${value}; mark as found.`,
    });
  } else if (isGraph && sorted.length) {
    swapDescriptions.push({
      title: "Traversal progress",
      detail: `${sorted.length} / ${graphInfo?.vertices ?? "?"} vertices visited`,
    });
  }
  return (
    <div className="space-y-6 text-sm">
      <div>
        <p className="text-sm font-semibold mb-2">Comparison Math</p>
        {comparisonDescriptions.length ? (
          <div className="space-y-2">
            {comparisonDescriptions.map((item, idx) => (
              <div
                className="p-3 rounded-md bg-muted/40 border border-border/50"
                key={`cmp-${idx}`}
              >
                <p className="font-medium">{item.title}</p>
                <p className="text-muted-foreground">{item.detail}</p>
                {item.conclusion && (
                  <p className="text-xs text-primary mt-1">{item.conclusion}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">
            No numerical comparisons on this step.
          </p>
        )}
      </div>
      <div>
        <p className="text-sm font-semibold mb-2">State Updates</p>
        {swapDescriptions.length ? (
          <div className="space-y-2">
            {swapDescriptions.map((item, idx) => (
              <div
                className="p-3 rounded-md bg-muted/40 border border-border/50"
                key={`swap-${idx}`}
              >
                <p className="font-medium">{item.title}</p>
                <p className="text-muted-foreground">{item.detail}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">
            No swaps or updates performed during this step.
          </p>
        )}
      </div>
      {isGraph && graphInfo && (
        <div>
          <p className="text-sm font-semibold mb-2">Graph Metrics</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="p-3 rounded-md bg-muted/40 border border-border/50">
              <p className="text-muted-foreground text-xs uppercase tracking-wide">
                Visited
              </p>
              <p className="text-lg font-semibold">{sorted.length}</p>
            </div>
            <div className="p-3 rounded-md bg-muted/40 border border-border/50">
              <p className="text-muted-foreground text-xs uppercase tracking-wide">
                Remaining
              </p>
              <p className="text-lg font-semibold">
                {Math.max(graphInfo.vertices - sorted.length, 0)}
              </p>
            </div>
            <div className="p-3 rounded-md bg-muted/40 border border-border/50">
              <p className="text-muted-foreground text-xs uppercase tracking-wide">
                Edges
              </p>
              <p className="text-lg font-semibold">{graphInfo.edges.length}</p>
            </div>
          </div>
        </div>
      )}
      {step.explanation && (
        <div className="p-3 rounded-md bg-primary/5 border border-primary/30 text-sm">
          <p className="font-medium">Narrative</p>
          <p className="text-muted-foreground">{step.explanation}</p>
        </div>
      )}
    </div>
  );
}
