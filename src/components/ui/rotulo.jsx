import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const variantesRotulo = cva("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70");

const Rotulo = React.forwardRef(
  ({ className, ...props }, ref) => (
    <LabelPrimitive.Root ref={ref} className={cn(variantesRotulo(), className)} {...props} />
  ),
);
Rotulo.displayName = LabelPrimitive.Root.displayName;

export { Rotulo };

