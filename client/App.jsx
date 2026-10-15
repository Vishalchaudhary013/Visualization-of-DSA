import { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/features/common/components/ui/tooltip";
import { Toaster } from "@/features/common/components/ui/sonner";
import { Header } from "@/features/common/components/layout/Header";
import { ScrollToTop } from "@/features/common/components/layout/ScrollToTop";
import NotFound from "@/features/common/pages/NotFound";
import Index from "@/features/home/pages/Index";
import { AssistantChat } from "@/features/assistant/components/AssistantChat";
import "./features/global.css";

// The visualizer is the heaviest page; load it only when visited
const Visualizer = lazy(() => import("@/features/visualizer/pages/Visualizer"));

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider delayDuration={200}>
        <BrowserRouter>
          <ScrollToTop />
          <Header />
          <Suspense fallback={<div className="min-h-[calc(100vh-4rem)]" />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/visualizer" element={<Visualizer />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <AssistantChat />
          <Toaster />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  );
}

createRoot(document.getElementById("root")).render(<App />);
