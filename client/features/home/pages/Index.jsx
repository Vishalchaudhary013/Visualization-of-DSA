import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import {
  LuArrowRight as ArrowRight,
  LuChartColumn as BarChart,
  LuCode as Code,
  LuColumns2 as Columns,
  LuShare2 as Share,
  LuSparkles as Sparkles,
  LuListOrdered as ListOrdered,
  LuPuzzle as Puzzle,
} from "react-icons/lu";
import { buttonVariants } from "@/features/common/components/ui/button";
import { AlgorithmCatalog } from "../components/AlgorithmCatalog";
// The animated demo pulls in the animation library: load it after the page
const HeroPreview = lazy(() =>
  import("../components/HeroPreview").then((m) => ({ default: m.HeroPreview })),
);
import { Logo } from "@/features/common/components/layout/Logo";

const FEATURES = [
  {
    icon: BarChart,
    title: "Animated step by step",
    description:
      "Watch every comparison, swap and visit, with keyboard controls (Space, arrows) and boxes or bars for big inputs.",
  },
  {
    icon: Code,
    title: "Live pseudocode",
    description:
      "The line that is running lights up as the animation plays, so code and picture stay connected.",
  },
  {
    icon: ListOrdered,
    title: "Plain-language narration",
    description:
      "Each step explains what happened and why, with a clickable log to jump anywhere.",
  },
  {
    icon: Sparkles,
    title: "Your own input",
    description:
      "Type values, pick best/worst-case shapes, or build and drag your own graph.",
  },
  {
    icon: Columns,
    title: "Compare side by side",
    description:
      "Race two algorithms on the same input, or all sorting algorithms at once, and see which does less work.",
  },
  {
    icon: Share,
    title: "Shareable links",
    description:
      "Every setup, including your LeetCode-style inputs, lives in the URL. Copy it to share an exact example.",
  },
];

export default function Index() {
  return (
    <div>
      <section className="gradient-bg relative overflow-hidden border-b border-border">
        <div className="container mx-auto grid items-center gap-12 px-4 py-16 sm:py-24 lg:grid-cols-2">
          <div className="space-y-6 text-center lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              Master data structures & algorithms
            </span>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              See how algorithms{" "}
              <span className="bg-linear-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
                really work
              </span>
            </h1>
            <p className="mx-auto max-w-xl text-lg text-muted-foreground lg:mx-0">
              Interactive, step-by-step visualizations of sorting, searching and
              graph algorithms, plus a roadmap of interview patterns with
              LeetCode-style problems you can run on your own input.
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              <Link to="/visualizer" className={buttonVariants({ size: "lg" })}>
                Start visualizing <ArrowRight />
              </Link>
              <a
                href="#algorithms"
                className={buttonVariants({ size: "lg", variant: "outline" })}
              >
                Browse algorithms
              </a>
              <Link
                to="/patterns"
                className={buttonVariants({ size: "lg", variant: "outline" })}
              >
                <Puzzle /> Practice patterns
              </Link>
            </div>
          </div>
          <Suspense
            fallback={
              // Same size as the demo, so nothing moves when it appears
              <div
                className="h-[302px] rounded-2xl border border-border bg-card/80 shadow-xl"
                aria-hidden="true"
              />
            }
          >
            <HeroPreview />
          </Suspense>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 sm:py-20">
        <h2 className="mb-10 text-center text-3xl font-bold">
          Built for learning
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-xl border border-border bg-card p-5"
            >
              <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mb-1 text-lg font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="algorithms"
        className="scroll-mt-20 border-t border-border bg-muted/30 py-16 sm:py-20"
      >
        <div className="container mx-auto px-4">
          <AlgorithmCatalog />
        </div>
      </section>

      <footer className="border-t border-border bg-card py-8">
        <div className="container mx-auto flex flex-col items-center justify-between gap-2 px-4 text-sm text-muted-foreground md:flex-row">
          <p className="flex items-center gap-2">
            <Logo className="text-base! text-foreground" />
            <span>· learn DSA by watching it run</span>
          </p>
          <p>© {new Date().getFullYear()} Algorithm Visualizer</p>
        </div>
      </footer>
    </div>
  );
}
