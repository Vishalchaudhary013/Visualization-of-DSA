import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LuLoaderCircle as Loader } from "react-icons/lu";
import { Button } from "@/features/common/components/ui/button";
import { Input } from "@/features/common/components/ui/input";
import { Label } from "@/features/common/components/ui/label";
import { useAuth } from "../context/AuthContext";

/** Small form helper: tracks values, field errors and the submitting state. */
function useForm(initial, submit) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const bind = (field) => ({
    id: field,
    value: values[field],
    onChange: (event) => {
      setValues((current) => ({ ...current, [field]: event.target.value }));
      setErrors((current) => ({ ...current, [field]: undefined }));
    },
    "aria-invalid": Boolean(errors[field]),
    className: errors[field] ? "border-destructive!" : "",
  });
  const onSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      await submit(values, setValues);
    } catch (error) {
      setErrors(error.fields ?? {});
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };
  return { bind, errors, busy, onSubmit };
}

function Field({ label, error, ...input }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={input.id}>{label}</Label>
      <Input {...input} />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function AccountSettings() {
  const { user, updateProfile, changePassword, deleteAccount } = useAuth();
  const navigate = useNavigate();

  const profile = useForm({ name: user.name }, async (values) => {
    await updateProfile({ name: values.name });
    toast.success("Name updated");
  });

  const password = useForm(
    { currentPassword: "", newPassword: "" },
    async (values, setValues) => {
      await changePassword(values);
      setValues({ currentPassword: "", newPassword: "" });
      toast.success("Password changed");
    },
  );

  const removal = useForm({ password: "" }, async (values) => {
    await deleteAccount(values.password);
    toast.success("Your account and history were deleted");
    navigate("/", { replace: true });
  });

  return (
    <div className="space-y-6">
      <form className="space-y-4" onSubmit={profile.onSubmit}>
        <h3 className="font-semibold">Profile</h3>
        <Field
          label="Name"
          error={profile.errors.name}
          autoComplete="name"
          {...profile.bind("name")}
        />
        <Field label="Email" id="email" value={user.email} disabled readOnly />
        <Button type="submit" size="sm" disabled={profile.busy}>
          {profile.busy && <Loader className="animate-spin" />} Save name
        </Button>
      </form>

      <form
        className="space-y-4 border-t border-border pt-6"
        onSubmit={password.onSubmit}
      >
        <h3 className="font-semibold">Change password</h3>
        <Field
          label="Current password"
          type="password"
          autoComplete="current-password"
          error={password.errors.currentPassword}
          {...password.bind("currentPassword")}
        />
        <Field
          label="New password (at least 8 characters)"
          type="password"
          autoComplete="new-password"
          error={password.errors.newPassword}
          {...password.bind("newPassword")}
        />
        <Button type="submit" size="sm" disabled={password.busy}>
          {password.busy && <Loader className="animate-spin" />} Change password
        </Button>
      </form>

      <form
        className="space-y-4 border-t border-border pt-6"
        onSubmit={removal.onSubmit}
      >
        <div>
          <h3 className="font-semibold text-destructive">Delete account</h3>
          <p className="text-sm text-muted-foreground">
            Permanently deletes your account and all of your history. This
            cannot be undone.
          </p>
        </div>
        <Field
          label="Confirm with your password"
          type="password"
          autoComplete="current-password"
          error={removal.errors.password}
          {...removal.bind("password")}
        />
        <Button
          type="submit"
          size="sm"
          variant="destructive"
          disabled={removal.busy}
        >
          {removal.busy && <Loader className="animate-spin" />} Delete my
          account
        </Button>
      </form>
    </div>
  );
}
