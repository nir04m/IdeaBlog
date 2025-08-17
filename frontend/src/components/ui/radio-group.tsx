"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { CircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** One-time casts to sidestep overly strict Radix typings */
const RootAny = RadioGroupPrimitive.Root as unknown as React.ComponentType<any>;
const ItemAny = RadioGroupPrimitive.Item as unknown as React.ComponentType<any>;
const IndicatorAny =
  RadioGroupPrimitive.Indicator as unknown as React.ComponentType<any>;

/* ---------- RadioGroup (Root) ---------- */
type RadioGroupProps = React.ComponentProps<typeof RadioGroupPrimitive.Root> & {
  className?: string;
  children?: React.ReactNode;
};
export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, children, ...props }, ref) => (
    <RootAny {...props} asChild>
      <div
        ref={ref}
        data-slot="radio-group"
        className={cn("grid gap-3", className)}
      >
        {children}
      </div>
    </RootAny>
  )
);
RadioGroup.displayName = "RadioGroup";

/* ---------- RadioGroupItem (Item) ---------- */
type RadioGroupItemProps = React.ComponentProps<
  typeof RadioGroupPrimitive.Item
> & {
  className?: string;
  children?: React.ReactNode; // optional; usually unused
};
export const RadioGroupItem = React.forwardRef<
  HTMLButtonElement,
  RadioGroupItemProps
>(({ className, children, ...props }, ref) => (
  <ItemAny {...props} asChild>
    <button
      ref={ref}
      type="button"
      data-slot="radio-group-item"
      className={cn(
        "aspect-square size-4 shrink-0 rounded-full border shadow-xs outline-none transition-[color,box-shadow]",
        "border-input text-primary focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-ring focus-visible:border-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        "dark:bg-input/30",
        className
      )}
    >
      <IndicatorAny asChild>
        <span
          data-slot="radio-group-indicator"
          className="relative flex h-full w-full items-center justify-center"
        >
          {/* lucide icons are stroke-only; the tiny circle is a visual cue */}
          <CircleIcon className="absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2" />
        </span>
      </IndicatorAny>
      {children /* in case you really want extra content inside */}
    </button>
  </ItemAny>
));
RadioGroupItem.displayName = "RadioGroupItem";
