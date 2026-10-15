import { Navigate, useLocation } from "react-router-dom";
import { LuLoaderCircle as Loader } from "react-icons/lu";
import { useAuth } from "../context/AuthContext";

/** Renders children for signed-in users, otherwise sends them to log in. */
export function RequireAuth({ children }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader
          className="h-6 w-6 animate-spin text-muted-foreground"
          aria-label="Loading"
        />
      </div>
    );
  }
  if (status === "unavailable") {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Accounts are not available</h1>
        <p className="mt-2 text-muted-foreground">
          The server has no database configured, so profiles and history are
          turned off. Everything else works as usual.
        </p>
      </div>
    );
  }
  if (status !== "signed-in") {
    const next = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/login?next=${next}`} replace />;
  }
  return children;
}
