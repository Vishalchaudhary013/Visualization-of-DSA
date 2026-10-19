import * as React from "react";
const badgeVariants = ({ variant = "default", className } = {}) =>
  [
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
      default:
        "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
      secondary:
        "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
      destructive:
        "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
      outline: "text-foreground",
    }[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");
function Badge({ className, variant, ...props }) {
  return (
    <div
      className={`${badgeVariants({ variant })} ${className ?? ""}`}
      {...props}
    />
  );
}
export { Badge, badgeVariants };
