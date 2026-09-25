const BINARY_SEARCH_EXAMPLE = `Example array: [2, 4, 5, 8, 12, 17, 21]
- Step 1: low = 0, high = 6, mid = 3 → arr[mid] = 8, target 8 found.
- For target 5:
   • low = 0, high = 6 → mid = 3, value = 8. Since 5 < 8, search left half.
   • New range low = 0, high = 2 → mid = 1, value = 4. Since 5 > 4, search right half.
   • New range low = 2, high = 2 → mid = 2, value = 5. Found target.`;
function buildBubblePassSummary(initialArray) {
  const arr = [...initialArray];
  const passes = [];
  const n = arr.length;
  for (let pass = 0; pass < n - 1; pass++) {
    const operations = [];
    let swapped = false;
    for (let j = 0; j < n - pass - 1; j++) {
      const left = arr[j];
      const right = arr[j + 1];
      if (left > right) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;
        operations.push(`${left} > ${right} → swap → [${arr.join(", ")}]`);
      } else {
        const relation = left === right ? "=" : "<";
        operations.push(`${left} ${relation} ${right} → no swap`);
      }
    }
    const lockedValue = arr[n - pass - 1];
    passes.push({
      passNumber: pass + 1,
      operations,
      summary: `After Pass ${pass + 1} → largest number ${lockedValue} fixed at index ${n - pass - 1}`,
    });
    if (!swapped) {
      break;
    }
  }
  return passes;
}
function buildSelectionPassSummary(initialArray) {
  const arr = [...initialArray];
  const passes = [];
  for (let pass = 0; pass < arr.length - 1; pass++) {
    let minIndex = pass;
    for (let j = pass + 1; j < arr.length; j++) {
      if (arr[j] < arr[minIndex]) {
        minIndex = j;
      }
    }
    const examinedSegment = arr.slice(pass).join(", ");
    const smallestValue = arr[minIndex];
    if (minIndex !== pass) {
      [arr[pass], arr[minIndex]] = [arr[minIndex], arr[pass]];
    }
    passes.push({
      passNumber: pass + 1,
      examined: `[${examinedSegment}]`,
      smallest: smallestValue,
      result: `[${arr.join(", ")}]`,
    });
  }
  return passes;
}
function buildInsertionPassSummary(initialArray) {
  const arr = [...initialArray];
  const passes = [];
  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];
    const shifts = [];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      shifts.push(`Shift ${arr[j]} → position ${j + 2} → [${arr.join(", ")}]`);
      j--;
    }
    arr[j + 1] = key;
    shifts.push(`Insert ${key} at position ${j + 1} → [${arr.join(", ")}]`);
    passes.push({
      passNumber: i,
      sortedSegment: `[${arr.slice(0, i).join(", ")}]`,
      shifts,
      result: `[${arr.join(", ")}]`,
    });
  }
  return passes;
}
function buildMergeRecursionTree(initialArray) {
  const nodes = [];
  function helper(segment, depth) {
    if (segment.length <= 1) {
      nodes.push({
        depth,
        title: `Leaf [${segment.join(", ")}]`,
        detail: "Single element – already sorted",
      });
      return;
    }
    const mid = Math.floor(segment.length / 2);
    const left = segment.slice(0, mid);
    const right = segment.slice(mid);
    nodes.push({
      depth,
      title: `Split [${segment.join(", ")}]`,
      detail: `Left = [${left.join(", ")}], Right = [${right.join(", ")}]`,
    });
    helper(left, depth + 1);
    helper(right, depth + 1);
    nodes.push({
      depth,
      title: `Merge [${segment.join(", ")}]`,
      detail: `Combine sorted halves to rebuild segment`,
    });
  }
  helper(initialArray, 0);
  return nodes;
}
function buildQuickRecursionTree(initialArray) {
  const nodes = [];
  function helper(segment, depth) {
    if (segment.length <= 1) {
      nodes.push({
        depth,
        title: `Leaf [${segment.join(", ")}]`,
        detail: "No further partition needed",
      });
      return;
    }
    const pivot = segment[segment.length - 1];
    const less = [];
    const greater = [];
    for (let i = 0; i < segment.length - 1; i++) {
      if (segment[i] < pivot) {
        less.push(segment[i]);
      } else {
        greater.push(segment[i]);
      }
    }
    nodes.push({
      depth,
      title: `Partition [${segment.join(", ")}]`,
      detail: `Pivot ${pivot} → Left [${less.join(", ")}], Right [${greater.join(", ")}]`,
    });
    helper(less, depth + 1);
    helper(greater, depth + 1);
  }
  helper(initialArray, 0);
  return nodes;
}
export function AlgorithmMathSummary({
  steps,
  isSorting,
  isSearching,
  isGraph,
  searchTarget,
  algorithmId,
  initialArray,
}) {
  if (!steps.length) {
    return (
      <div className="p-4 bg-muted/20 rounded-lg border border-dashed border-border text-sm text-muted-foreground">
        Run an algorithm to generate a full mathematical log.
      </div>
    );
  }
  const finalStep = steps[steps.length - 1];
  const totals = finalStep.operations;
  const finalState = finalStep.state || [];
  const foundIndex = finalStep.sorted?.[0];
  const searchFound = typeof foundIndex === "number" && foundIndex >= 0;
  return (
    <div className="space-y-6">
      {!isGraph && (
        <div>
          <p className="text-sm font-semibold mb-2">Final State</p>
          <div className="p-3 rounded-md bg-card border border-border overflow-x-auto text-xs md:text-sm font-mono whitespace-nowrap">
            [{finalState.join(", ")}]
          </div>
        </div>
      )}
      {isSearching && typeof searchTarget !== "undefined" && (
        <div className="p-3 rounded-md bg-muted/30 border border-border/60 text-sm">
          <p className="font-medium mb-1">Search Conclusion</p>
          <p className="text-muted-foreground">
            {"Target "}
            {searchTarget}{" "}
            {searchFound ? `found at index ${foundIndex}` : "not found"}
            {" after "}
            {totals.comparisons}
            {" comparisons."}
          </p>
        </div>
      )}
      <div>
        <p className="text-sm font-semibold mb-2">Step-by-Step Working</p>
        <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
          {steps.map((step, index) => (
            <div
              className="p-3 rounded-lg border border-border/60 bg-muted/10 text-sm space-y-2"
              key={`summary-step-${index}`}
            >
              <div className="flex items-center justify-between text-xs text-muted-foreground uppercase tracking-wide">
                <span>
                  {"Step "}
                  {index + 1}
                </span>
                <span>
                  {"comps "}
                  {step.operations.comparisons}
                  {" \u00B7 reads "}
                  {step.operations.reads}
                  {" \u00B7 writes "}
                  {step.operations.writes}
                </span>
              </div>
              <p className="text-foreground">{step.explanation}</p>
              {(isSorting || isSearching) && step.comparisons.length > 0 && (
                <p className="text-xs font-mono text-muted-foreground whitespace-nowrap overflow-x-auto">
                  Compare indices [{step.comparisons.join(", ")}] → values [
                  {step.comparisons
                    .map((idx) => {
                      const value =
                        typeof idx === "number" ? step.state?.[idx] : undefined;
                      return typeof value === "number" ? value : "Ø";
                    })
                    .join(", ")}
                  ]
                </p>
              )}
              {isSorting && step.swaps.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-mono text-primary whitespace-nowrap">
                    Swap indices [{step.swaps.join(", ")}]
                  </p>
                  <p className="text-[11px] font-mono text-muted-foreground whitespace-nowrap overflow-x-auto">
                    State → [{step.state?.join(", ")}]
                  </p>
                </div>
              )}
              {isGraph && step.sorted.length > 0 && (
                <p className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                  Visited set: [{step.sorted.join(", ")}]
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
      {isSearching && algorithmId === "binary-search" && (
        <div>
          <p className="text-sm font-semibold mb-2">
            Binary Search Walkthrough
          </p>
          <pre className="bg-muted/20 p-3 rounded-lg text-xs font-mono whitespace-pre-wrap leading-relaxed">
            {BINARY_SEARCH_EXAMPLE}
          </pre>
        </div>
      )}
      {isSorting &&
        algorithmId === "bubble-sort" &&
        initialArray &&
        initialArray.length > 1 && (
          <div>
            <p className="text-sm font-semibold mb-2">
              Bubble Sort Walkthrough
            </p>
            <p className="text-xs text-muted-foreground mb-2">
              Example based on the current array input [
              {initialArray.join(", ")}]
            </p>
            <div className="space-y-3">
              {buildBubblePassSummary(initialArray).map((pass) => (
                <div
                  className="p-3 rounded-lg border border-border/50 bg-muted/10 space-y-2"
                  key={`pass-${pass.passNumber}`}
                >
                  <p className="font-medium">
                    {"Pass "}
                    {pass.passNumber}
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs font-mono">
                    {pass.operations.map((op, idx) => (
                      <li
                        className="whitespace-nowrap overflow-x-auto"
                        key={`pass-${pass.passNumber}-op-${idx}`}
                      >
                        {op}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-primary">{pass.summary}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      {isSorting &&
        algorithmId === "selection-sort" &&
        initialArray &&
        initialArray.length > 1 && (
          <div>
            <p className="text-sm font-semibold mb-2">
              Selection Sort Walkthrough
            </p>
            <p className="text-xs text-muted-foreground mb-2">
              Example based on the current array input [
              {initialArray.join(", ")}]
            </p>
            <div className="space-y-3">
              {buildSelectionPassSummary(initialArray).map((pass) => (
                <div
                  className="p-3 rounded-lg border border-border/50 bg-muted/10 space-y-2"
                  key={`sel-pass-${pass.passNumber}`}
                >
                  <p className="font-medium">
                    {"Pass "}
                    {pass.passNumber}
                  </p>
                  <p className="text-xs font-mono text-muted-foreground whitespace-nowrap overflow-x-auto">
                    {"Remaining segment: "}
                    {pass.examined}
                  </p>
                  <p className="text-xs font-mono whitespace-nowrap">
                    {"Smallest = "}
                    {pass.smallest}
                  </p>
                  <p className="text-xs font-mono text-primary whitespace-nowrap overflow-x-auto">
                    {"After swap \u2192 "}
                    {pass.result}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      {isSorting &&
        algorithmId === "insertion-sort" &&
        initialArray &&
        initialArray.length > 1 && (
          <div>
            <p className="text-sm font-semibold mb-2">
              Insertion Sort Walkthrough
            </p>
            <p className="text-xs text-muted-foreground mb-2">
              Example based on the current array input [
              {initialArray.join(", ")}]
            </p>
            <div className="space-y-3">
              {buildInsertionPassSummary(initialArray).map((pass) => (
                <div
                  className="p-3 rounded-lg border border-border/50 bg-muted/10 space-y-2"
                  key={`ins-pass-${pass.passNumber}`}
                >
                  <p className="font-medium">
                    {"Pass "}
                    {pass.passNumber}
                  </p>
                  <p className="text-xs font-mono text-muted-foreground whitespace-nowrap overflow-x-auto">
                    {"Sorted part before insert: "}
                    {pass.sortedSegment}
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs font-mono">
                    {pass.shifts.map((entry, idx) => (
                      <li
                        className="whitespace-nowrap overflow-x-auto"
                        key={`ins-pass-${pass.passNumber}-shift-${idx}`}
                      >
                        {entry}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs font-mono text-primary whitespace-nowrap overflow-x-auto">
                    {"Result \u2192 "}
                    {pass.result}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      {isSorting &&
        algorithmId === "merge-sort" &&
        initialArray &&
        initialArray.length > 1 && (
          <div>
            <p className="text-sm font-semibold mb-2">
              Merge Sort Recursion Tree
            </p>
            <p className="text-xs text-muted-foreground mb-2">
              Splitting and merging path for [{initialArray.join(", ")}]
            </p>
            <div className="space-y-2 text-xs font-mono">
              {buildMergeRecursionTree(initialArray).map((node, idx) => (
                <div
                  className="p-2 rounded border border-border/40 bg-muted/10"
                  style={{ marginLeft: node.depth * 16 }}
                  key={`merge-node-${idx}`}
                >
                  <p className="text-primary">{node.title}</p>
                  <p className="text-muted-foreground">{node.detail}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      {isSorting &&
        algorithmId === "quick-sort" &&
        initialArray &&
        initialArray.length > 1 && (
          <div>
            <p className="text-sm font-semibold mb-2">
              Quick Sort Recursion Tree
            </p>
            <p className="text-xs text-muted-foreground mb-2">
              Partition decisions for [{initialArray.join(", ")}]
            </p>
            <div className="space-y-2 text-xs font-mono">
              {buildQuickRecursionTree(initialArray).map((node, idx) => (
                <div
                  className="p-2 rounded border border-border/40 bg-muted/10"
                  style={{ marginLeft: node.depth * 16 }}
                  key={`quick-node-${idx}`}
                >
                  <p className="text-primary">{node.title}</p>
                  <p className="text-muted-foreground">{node.detail}</p>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  );
}
