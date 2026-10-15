import { Link } from "react-router-dom";
import { LuHouse as Home, LuArrowLeft as ArrowLeft } from "react-icons/lu";
import { Button, buttonVariants } from "../components/ui/button";

export default function NotFound() {
  return (
    <div className="gradient-bg flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="max-w-md space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-primary">404</h1>
          <h2 className="text-3xl font-bold">Page not found</h2>
          <p className="text-lg text-muted-foreground">
            We couldn't find the page you're looking for. It might have been
            moved or doesn't exist.
          </p>
        </div>
        <div className="flex flex-col justify-center gap-3 pt-4 sm:flex-row">
          <Link to="/" className={buttonVariants()}>
            <Home />
            Go to home
          </Link>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft />
            Go back
          </Button>
        </div>
      </div>
    </div>
  );
}
