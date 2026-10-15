import { Link, useLocation } from "react-router-dom";
import {
  LuCircleCheck as CircleCheck,
  LuLoaderCircle as Loader,
  LuCloudOff as CloudOff,
  LuLogIn as LogIn,
} from "react-icons/lu";

/** Small indicator next to a run: saved to history, saving, or "log in to save". */
export function SaveStatus({ status }) {
  const location = useLocation();
  const next = encodeURIComponent(`${location.pathname}${location.search}`);

  if (status === "signed-out") {
    return (
      <Link
        to={`/login?next=${next}`}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <LogIn className="h-3.5 w-3.5" />
        Log in to save your runs
      </Link>
    );
  }
  const content = {
    idle: null,
    saving: {
      icon: Loader,
      text: "Saving…",
      className: "text-muted-foreground",
      spin: true,
    },
    saved: {
      icon: CircleCheck,
      text: "Saved to your history",
      className: "text-emerald-600 dark:text-emerald-400",
    },
    error: {
      icon: CloudOff,
      text: "Couldn't save to history",
      className: "text-destructive",
    },
  }[status];
  if (!content) return null;
  const Icon = content.icon;
  return (
    <span
      className={`flex items-center gap-1.5 text-xs ${content.className}`}
      role="status"
    >
      <Icon className={`h-3.5 w-3.5 ${content.spin ? "animate-spin" : ""}`} />
      {content.text}
    </span>
  );
}
