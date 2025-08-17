"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "@/lib/utils";

/** one-time cast to relax Radix's overly strict prop types */
const RootAny = LabelPrimitive.Root as unknown as React.ComponentType<any>;

type LabelProps = React.ComponentPropsWithoutRef<"label"> & {
  asChild?: boolean;
};

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, ...props }, ref) => (
    <RootAny asChild>
      <label
        ref={ref}
        data-slot="label"
        className={cn(
          "text-sm font-medium leading-none text-black dark:text-white peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          className
        )}
        {...props} // includes htmlFor, id, etc.
      >
        {children}
      </label>
    </RootAny>
  )
);
Label.displayName = "Label";
