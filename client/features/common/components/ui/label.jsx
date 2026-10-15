import * as LabelPrimitive from "@radix-ui/react-label";
const Label = ({ ref, className, ...props }) => (
  <LabelPrimitive.Root
    ref={ref}
    className={`text-sm font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className ?? ""}`}
    {...props}
  />
);
export { Label };
