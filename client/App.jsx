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
import { AuthProvider } from "@/features/auth/context/AuthContext";
import { RequireAuth } from "@/features/auth/components/RequireAuth";
import "./features/global.css";

// Pages other than home load on demand
const Visualizer = lazy(() => import("@/features/visualizer/pages/Visualizer"));
const DataStructuresIndex = lazy(
  () => import("@/features/data-structures/pages/DataStructuresIndex"),
);
const DataStructurePage = lazy(
  () => import("@/features/data-structures/pages/DataStructurePage"),
);
const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/features/auth/pages/RegisterPage"));
const ProfilePage = lazy(() => import("@/features/auth/pages/ProfilePage"));

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider delayDuration={200}>
        <AuthProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Header />
            <Suspense fallback={<div className="min-h-[calc(100vh-4rem)]" />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/visualizer" element={<Visualizer />} />
                <Route
                  path="/data-structures"
                  element={<DataStructuresIndex />}
                />
                <Route
                  path="/data-structures/:id"
                  element={<DataStructurePage />}
                />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route
                  path="/profile"
                  element={
                    <RequireAuth>
                      <ProfilePage />
                    </RequireAuth>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <AssistantChat />
            <Toaster />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}

createRoot(document.getElementById("root")).render(<App />);
