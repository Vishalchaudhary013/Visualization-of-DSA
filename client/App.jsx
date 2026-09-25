import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/features/common/components/ui/tooltip";
import { Toaster as RadixToaster } from "@/features/common/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/features/common/components/ui/sonner";
import { Button } from "@/features/common/components/ui/button";
import { LuHouse as Home, LuSparkles as Sparkles } from "react-icons/lu";

import "./features/global.css";
import Index from "./features/home/pages/Index";
import Visualizer from "./features/visualizer/pages/Visualizer";
import NotFound from "./features/common/pages/NotFound";
import { AssistantChat } from "./features/visualizer/components/AssistantChat";
import { ScrollToTop } from "./features/common/components/ScrollToTop";

const queryClient = new QueryClient();

function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center text-white">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="hidden sm:inline">Algorithm Visualizer</span>
          <span className="sm:hidden">Visualizer</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <Home className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Home</span>
            </Button>
          </Link>
          <Link to="/visualizer">
            <Button size="sm">
              <Sparkles className="w-4 h-4 mr-2" />
              Visualizer
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <RadixToaster />
        <SonnerToaster />
        <BrowserRouter>
          <ScrollToTop />
          <Header />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/visualizer" element={<Visualizer />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <AssistantChat />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

createRoot(document.getElementById("root")).render(<App />);
