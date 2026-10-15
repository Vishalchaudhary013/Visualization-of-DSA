import { Link, NavLink } from "react-router-dom";
import {
  LuHouse as Home,
  LuSparkles as Sparkles,
  LuChartColumn as Chart,
} from "react-icons/lu";
import { buttonVariants } from "@/features/common/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";

const NAV_ITEMS = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/visualizer", label: "Visualizer", icon: Chart },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-primary to-blue-600 text-white">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="hidden sm:inline">Algorithm Visualizer</span>
        </Link>
        <nav className="flex items-center gap-1" aria-label="Main">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                buttonVariants({
                  variant: isActive ? "secondary" : "ghost",
                  size: "sm",
                })
              }
            >
              <Icon />
              <span className="hidden sm:inline">{label}</span>
            </NavLink>
          ))}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
