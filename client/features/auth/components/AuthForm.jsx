import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  LuLoaderCircle as Loader,
  LuCircleAlert as CircleAlert,
  LuEye as Eye,
  LuEyeOff as EyeOff,
} from "react-icons/lu";
import { Button } from "@/features/common/components/ui/button";
import { Input } from "@/features/common/components/ui/input";
import { Label } from "@/features/common/components/ui/label";
import { useAuth } from "../context/AuthContext";

/** Only follow in-app redirects (?next=/profile), never external URLs. */
export function safeNext(next) {
  return typeof next === "string" &&
    next.startsWith("/") &&
    !next.startsWith("//")
    ? next
    : "/profile";
}

const MODES = {
  login: {
    title: "Welcome back",
    subtitle: "Log in to see your saved runs and history.",
    submit: "Log in",
    switchText: "New here?",
    switchLink: "Create an account",
    switchTo: "/register",
  },
  register: {
    title: "Create your account",
    subtitle:
      "Save every algorithm you run, with your inputs, and pick up where you left off.",
    submit: "Create account",
    switchText: "Already have an account?",
    switchLink: "Log in",
    switchTo: "/login",
  },
};

export function AuthForm({ mode }) {
  const copy = MODES[mode];
  const { login, register, status } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = safeNext(searchParams.get("next"));
  const [values, setValues] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const setField = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      if (mode === "register") await register(values);
      else await login({ email: values.email, password: values.password });
      navigate(next, { replace: true });
    } catch (error) {
      setErrors(error.fields ?? {});
      setFormError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const field = (id, label, props) => (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {props.children ?? (
        <Input
          id={id}
          value={values[id]}
          onChange={setField(id)}
          aria-invalid={Boolean(errors[id])}
          aria-describedby={errors[id] ? `${id}-error` : undefined}
          className={errors[id] ? "border-destructive!" : ""}
          {...props}
        />
      )}
      {errors[id] && (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {errors[id]}
        </p>
      )}
    </div>
  );

  return (
    <div className="gradient-bg flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl sm:p-8">
        <div className="mb-6 space-y-1.5 text-center">
          <h1 className="text-2xl font-bold">{copy.title}</h1>
          <p className="text-sm text-muted-foreground">{copy.subtitle}</p>
        </div>

        {status === "unavailable" && (
          <p className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
            Accounts are not available right now: the server has no database
            configured.
          </p>
        )}

        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          {mode === "register" &&
            field("name", "Name", {
              autoComplete: "name",
              placeholder: "Ada Lovelace",
              required: true,
            })}
          {field("email", "Email", {
            type: "email",
            autoComplete: "email",
            placeholder: "you@example.com",
            required: true,
          })}
          {field("password", "Password", {
            children: (
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={
                    mode === "register" ? "new-password" : "current-password"
                  }
                  value={values.password}
                  onChange={setField("password")}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={
                    errors.password ? "password-error" : undefined
                  }
                  required
                  minLength={mode === "register" ? 8 : undefined}
                  className={`pr-10! ${errors.password ? "border-destructive!" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((shown) => !shown)}
                  className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            ),
          })}
          {mode === "register" && !errors.password && (
            <p className="-mt-2 text-xs text-muted-foreground">
              At least 8 characters.
            </p>
          )}

          {formError && (
            <p
              role="alert"
              className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
            >
              <CircleAlert className="h-4 w-4 shrink-0" />
              {formError}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting && <Loader className="animate-spin" />}
            {copy.submit}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {copy.switchText}{" "}
          <Link
            to={`${copy.switchTo}${searchParams.get("next") ? `?next=${encodeURIComponent(next)}` : ""}`}
            className="font-medium text-primary hover:underline"
          >
            {copy.switchLink}
          </Link>
        </p>
      </div>
    </div>
  );
}
