import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/features/common/components/ui/tabs";
import { Badge } from "@/features/common/components/ui/badge";
export function AlgorithmInfoPanel({ algorithm }) {
  const [copiedTab, setCopiedTab] = useState(null);
  if (!algorithm) {
    return (
      <div className="flex items-center justify-center h-96 bg-muted/20 rounded-lg">
        <p className="text-muted-foreground">
          Select an algorithm to view details
        </p>
      </div>
    );
  }
  const copyToClipboard = (text, tab) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(tab);
    setTimeout(() => setCopiedTab(null), 2000);
  };
  return (
    <div className="w-full space-y-4">
      <div className="space-y-3">
        <div>
          <h2 className="text-2xl font-bold">{algorithm.name}</h2>
          <p className="text-muted-foreground">{algorithm.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{algorithm.category}</Badge>
          <Badge
            variant={
              algorithm.difficulty === "beginner"
                ? "default"
                : algorithm.difficulty === "intermediate"
                  ? "secondary"
                  : "destructive"
            }
          >
            {algorithm.difficulty}
          </Badge>
          {algorithm.tags.map((tag) => (
            <Badge variant="outline" key={tag}>
              {tag}
            </Badge>
          ))}
        </div>
      </div>
      <Tabs defaultValue="complexity" className="w-full">
        <TabsList className="grid! w-full grid-cols-4">
          <TabsTrigger value="complexity">Complexity</TabsTrigger>
          <TabsTrigger value="pseudocode">Pseudocode</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
          <TabsTrigger value="steps">Steps</TabsTrigger>
        </TabsList>
        <TabsContent value="complexity" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg space-y-2">
              <h4 className="font-semibold text-sm">Time Complexity</h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-muted-foreground">Best:</span>{" "}
                  <code className="bg-muted px-2 py-1 rounded font-mono">
                    {algorithm.complexity.time.best}
                  </code>
                </p>
                <p>
                  <span className="text-muted-foreground">Average:</span>{" "}
                  <code className="bg-muted px-2 py-1 rounded font-mono">
                    {algorithm.complexity.time.average}
                  </code>
                </p>
                <p>
                  <span className="text-muted-foreground">Worst:</span>{" "}
                  <code className="bg-muted px-2 py-1 rounded font-mono">
                    {algorithm.complexity.time.worst}
                  </code>
                </p>
              </div>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg space-y-2">
              <h4 className="font-semibold text-sm">Space Complexity</h4>
              <p className="text-sm">
                <code className="bg-muted px-2 py-1 rounded font-mono">
                  {algorithm.complexity.space}
                </code>
              </p>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="pseudocode" className="space-y-4">
          <div className="relative">
            <button
              onClick={() =>
                copyToClipboard(algorithm.pseudoCode, "pseudocode")
              }
              className="absolute top-2 right-2 px-2 py-1 text-xs bg-muted rounded hover:bg-muted/80 transition-colors"
            >
              {copiedTab === "pseudocode" ? "Copied!" : "Copy"}
            </button>
            <pre className="bg-muted/30 p-4 rounded-lg overflow-auto max-h-96 text-sm font-mono">
              <code>{algorithm.pseudoCode}</code>
            </pre>
          </div>
        </TabsContent>
        <TabsContent value="code" className="space-y-4">
          <div className="relative">
            <button
              onClick={() => copyToClipboard(algorithm.jsCode, "code")}
              className="absolute top-2 right-2 px-2 py-1 text-xs bg-muted rounded hover:bg-muted/80 transition-colors"
            >
              {copiedTab === "code" ? "Copied!" : "Copy"}
            </button>
            <pre className="bg-muted/30 p-4 rounded-lg overflow-auto max-h-96 text-sm font-mono">
              <code>{algorithm.jsCode}</code>
            </pre>
          </div>
        </TabsContent>
        <TabsContent value="steps" className="space-y-4">
          {algorithm.id === "bubble-sort" ? (
            <div className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                Bubble Sort in five quick steps:
              </p>
              <ol className="list-decimal list-inside space-y-1.5">
                <li>Look at the current pair of neighbors.</li>
                <li>If the left number is bigger, swap them.</li>
                <li>
                  Slide to the next pair and repeat until you reach the end.
                </li>
                <li>
                  The largest value from this pass ends up at the far right
                  (sorted).
                </li>
                <li>
                  Ignore the sorted tail and repeat passes until nothing swaps.
                </li>
              </ol>
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                This algorithm works through the following general steps:
              </p>
              <ol className="list-decimal list-inside space-y-2">
                <li>Initialize data structure and variables</li>
                <li>Process elements according to algorithm logic</li>
                <li>Perform comparisons, swaps, or other operations</li>
                <li>Update data structure state</li>
                <li>Repeat until completion condition is met</li>
              </ol>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
