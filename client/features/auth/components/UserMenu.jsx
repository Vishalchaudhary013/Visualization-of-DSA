import { Link } from "react-router-dom";
import { buttonVariants } from "@/features/common/components/ui/button";
import { useAuth } from "../context/AuthContext";

/** Header area: "Log in / Sign up" for guests, avatar link to the profile for users. */
export function UserMenu() {
  const { user, status } = useAuth();

  if (status === "loading" || status === "unavailable") return null;
  return (
    <>
      <span className="mx-1 h-6 w-px bg-border" aria-hidden="true" />
      <Account user={user} />
    </>
  );
}

function Account({ user }) {
  if (!user) {
    return (
      <div className="flex items-center gap-1">
        <Link
          to="/login"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          Log in
        </Link>
        <Link
          to="/register"
          className={`${buttonVariants({ size: "sm" })} hidden sm:inline-flex`}
        >
          Sign up
        </Link>
      </div>
    );
  }
  return (
    <Link
      to="/profile"
      className="flex items-center gap-2 rounded-full py-1 pl-1 pr-1 text-sm font-medium hover:bg-muted sm:pr-3"
      title="Your profile"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-primary to-blue-600 text-sm font-bold text-white">
        {user.name.charAt(0).toUpperCase()}
      </span>
      <span className="hidden max-w-28 truncate sm:inline">{user.name}</span>
    </Link>
  );
}
