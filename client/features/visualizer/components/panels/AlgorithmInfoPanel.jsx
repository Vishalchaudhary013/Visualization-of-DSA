import { useState } from "react";
import { LuCopy as Copy, LuCheck as Check } from "react-icons/lu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/features/common/components/ui/tabs";

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-background/80 px-2 py-1 text-xs text-muted-foreground backdrop-blur hover:text-foreground"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

const COMPLEXITY_ROWS = [
  ["Best", "best"],
  ["Average", "average"],
  ["Worst", "worst"],
];

export function AlgorithmInfoPanel({ algorithm }) {
  return (
    <Tabs defaultValue="how" className="w-full">
      <TabsList className="grid! w-full grid-cols-3">
        <TabsTrigger value="how">How it works</TabsTrigger>
        <TabsTrigger value="complexity">Complexity</TabsTrigger>
        <TabsTrigger value="code">Code</TabsTrigger>
      </TabsList>

      <TabsContent value="how" className="space-y-4 pt-2">
        <ol className="space-y-2 text-sm">
          {algorithm.howItWorks.map((item, index) => (
            <li key={item} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {index + 1}
              </span>
              <span className="pt-0.5">{item}</span>
            </li>
          ))}
        </ol>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            When to use it
          </p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {algorithm.useCases.map((useCase) => (
              <li key={useCase}>{useCase}</li>
            ))}
          </ul>
        </div>
      </TabsContent>

      <TabsContent value="complexity" className="pt-2">
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <tbody>
              {COMPLEXITY_ROWS.map(([label, key]) => (
                <tr key={key} className="border-b border-border last:border-0">
                  <td className="px-3 py-2 text-muted-foreground">
                    {label} time
                  </td>
                  <td className="px-3 py-2 text-right font-mono font-semibold">
                    {algorithm.complexity.time[key]}
                  </td>
                </tr>
              ))}
              <tr>
                <td className="px-3 py-2 text-muted-foreground">Extra space</td>
                <td className="px-3 py-2 text-right font-mono font-semibold">
                  {algorithm.complexity.space}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {algorithm.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="code" className="pt-2">
        <div className="relative">
          <CopyButton text={algorithm.jsCode} />
          <pre className="max-h-96 overflow-auto rounded-lg bg-muted/30 p-4 font-mono text-xs leading-5">
            <code>{algorithm.jsCode}</code>
          </pre>
        </div>
      </TabsContent>
    </Tabs>
  );
}
