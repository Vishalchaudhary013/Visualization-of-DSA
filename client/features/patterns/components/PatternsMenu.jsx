import { Link, useLocation } from "react-router-dom";
import {
  LuPuzzle as Puzzle,
  LuChevronDown as ChevronDown,
  LuRoute as Route,
} from "react-icons/lu";
import { buttonVariants } from "@/features/common/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/features/common/components/ui/dropdown-menu";
import { PATTERN_GROUPS, PATTERN_LIST } from "@shared/patterns";

const GROUPS = PATTERN_GROUPS.map((group) => ({
  ...group,
  patterns: PATTERN_LIST.filter((pattern) => pattern.group === group.id),
}));

/** "Patterns" dropdown in the header: every pattern, grouped like the roadmap. */
export function PatternsMenu() {
  const { pathname } = useLocation();
  const active = pathname.startsWith("/patterns");

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        aria-label="Patterns"
        className={buttonVariants({
          variant: active ? "secondary" : "ghost",
          size: "sm",
        })}
      >
        <Puzzle />
        <span className="hidden md:inline">Patterns</span>
        <ChevronDown className="size-3.5! opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="max-h-[75vh] w-[min(92vw,680px)] p-2"
      >
        <DropdownMenuItem asChild>
          <Link to="/patterns" className="font-semibold text-primary">
            <Route className="h-4 w-4" />
            Patterns roadmap: learn them in order
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="grid gap-x-2 sm:grid-cols-2">
          {GROUPS.map((group, index) => (
            <DropdownMenuGroup key={group.id} className="py-1">
              <DropdownMenuLabel>
                {index + 1}. {group.name}
              </DropdownMenuLabel>
              {group.patterns.map((pattern) => (
                <DropdownMenuItem key={pattern.id} asChild>
                  <Link to={`/patterns/${pattern.id}`}>
                    <span className="flex-1">{pattern.name}</span>
                    {pattern.problems.length > 0 && (
                      <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                        Try it
                      </span>
                    )}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
