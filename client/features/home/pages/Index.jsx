import { Link } from "react-router-dom";
import {
  LuArrowRight as ArrowRight,
  LuZap as Zap,
  LuBookOpen as BookOpen,
  LuChartColumn as BarChart3,
  LuSparkles as Sparkles,
  LuCode as Code,
  LuLayers as Layers,
  LuNetwork as Network,
} from "react-icons/lu";
import { Button } from "@/features/common/components/ui/button";
import { Badge } from "@/features/common/components/ui/badge";
import { ALGORITHMS, DIFFICULTIES } from "@shared/algorithms";

const HERO_TAGLINE = "Master Data Structures & Algorithms";

const HERO_DESCRIPTION =
  "Interactive visualizations of sorting, searching, and graph algorithms. Learn with play, pause, step controls, and detailed complexity analysis.";

const HERO_TITLE_HIGHLIGHT = "Really Work";

const FEATURE_LIST = [
  {
    icon: BarChart3,
    title: "Interactive Visualizations",
    description:
      "Watch algorithms come to life with smooth, animated visualizations in real-time.",
  },
  {
    icon: BookOpen,
    title: "Detailed Explanations",
    description:
      "Learn the how and why behind each algorithm with step-by-step breakdowns.",
  },
  {
    icon: Code,
    title: "Real Code Examples",
    description:
      "See actual JavaScript implementations and pseudocode for each algorithm.",
  },
  {
    icon: Zap,
    title: "Complexity Analysis",
    description:
      "Understand time and space complexity with visual proof during execution.",
  },
  {
    icon: Layers,
    title: "Multiple Data Structures",
    description:
      "Learn about arrays, linked lists, trees, heaps, graphs, and more.",
  },
  {
    icon: Network,
    title: "Full Control",
    description:
      "Play, pause, step through, adjust speed, and reset animations as needed.",
  },
];

export default function Index() {
  const algorithmList = Object.values(ALGORITHMS);
  const sortingAlgorithms = algorithmList.filter(
    (algorithm) => algorithm.category === "sorting",
  );
  const searchingAlgorithms = algorithmList.filter(
    (algorithm) => algorithm.category === "searching",
  );
  const graphAlgorithms = algorithmList.filter(
    (algorithm) => algorithm.category === "graph-traversal",
  );

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden gradient-bg pt-20 pb-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                {HERO_TAGLINE}
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold">
              Visualize How Algorithms
              <span className="bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
                {" "}
                {HERO_TITLE_HIGHLIGHT}
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {HERO_DESCRIPTION}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/visualizer">
                <Button size="lg" className="gap-2">
                  Start Visualizing <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-12 text-center">
              All Available Algorithms
            </h2>

            <AlgorithmSection
              title="Sorting Algorithms"
              icon={BarChart3}
              algorithms={sortingAlgorithms}
            />
            <AlgorithmSection
              title="Searching Algorithms"
              icon={Sparkles}
              algorithms={searchingAlgorithms}
            />
            <AlgorithmSection
              title="Graph Traversal"
              icon={Network}
              algorithms={graphAlgorithms}
            />
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-primary/10 to-blue-600/10 border-y border-primary/20">
        <div className="container mx-auto px-4 text-center space-y-6">
          <h2 className="text-4xl font-bold">Ready to Visualize?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start exploring algorithms interactively and boost your
            understanding of data structures.
          </p>
          <Link to="/visualizer">
            <Button size="lg" className="gap-2">
              Launch Visualizer <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border bg-card py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <h3 className="font-semibold mb-2">Algorithm Visualizer</h3>
              <p className="text-muted-foreground text-sm">
                Master data structures and algorithms through interactive
                visualization.
              </p>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              <p>© 2026 Algorithm Visualizer. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function AlgorithmSection({ title, icon: Icon, algorithms }) {
  return (
    <div className="mb-16">
      <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
        <Icon className="w-6 h-6 text-primary" />
        {title}
      </h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {algorithms.map((algorithm) => (
          <div
            key={algorithm.id}
            className="p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-semibold">{algorithm.name}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {algorithm.description}
                </p>
              </div>
              <Badge
                variant={
                  algorithm.difficulty === "beginner"
                    ? "default"
                    : algorithm.difficulty === "intermediate"
                      ? "secondary"
                      : "destructive"
                }
                className="ml-2 whitespace-nowrap"
              >
                {DIFFICULTIES[algorithm.difficulty]}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-1 mt-3">
              {algorithm.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
