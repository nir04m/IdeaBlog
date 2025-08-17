"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

/* Cast once to relax the overly strict typings on children/className */
const RootAny = TabsPrimitive.Root as unknown as React.ComponentType<any>;
const ListAny = TabsPrimitive.List as unknown as React.ComponentType<any>;
const TriggerAny = TabsPrimitive.Trigger as unknown as React.ComponentType<any>;
const ContentAny = TabsPrimitive.Content as unknown as React.ComponentType<any>;

/** Root */
type TabsProps = React.ComponentProps<typeof TabsPrimitive.Root> & {
  className?: string;
  children?: React.ReactNode;
};
export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <RootAny {...props} asChild>
        <div
          ref={ref}
          data-slot="tabs"
          className={cn("flex flex-col gap-2", className)}
        >
          {children}
        </div>
      </RootAny>
    );
  }
);
Tabs.displayName = "Tabs";

/** List */
type TabsListProps = React.ComponentProps<typeof TabsPrimitive.List> & {
  className?: string;
  children?: React.ReactNode;
};
export const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <ListAny {...props} asChild>
        <div
          ref={ref}
          data-slot="tabs-list"
          className={cn(
            "inline-flex h-9 w-fit items-center justify-center rounded-lg bg-muted p-[3px] text-muted-foreground",
            className
          )}
        >
          {children}
        </div>
      </ListAny>
    );
  }
);
TabsList.displayName = "TabsList";

/** Trigger */
type TabsTriggerProps = React.ComponentProps<typeof TabsPrimitive.Trigger> & {
  className?: string;
  children?: React.ReactNode;
};
export const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <TriggerAny {...props} asChild>
        <button
          ref={ref}
          data-slot="tabs-trigger"
          className={cn(
            "inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium text-foreground whitespace-nowrap transition-[color,box-shadow] focus-visible:outline-1 focus-visible:outline-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:shadow-sm dark:text-muted-foreground dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-4",
            className
          )}
        >
          {children}
        </button>
      </TriggerAny>
    );
  }
);
TabsTrigger.displayName = "TabsTrigger";

/** Content */
type TabsContentProps = React.ComponentProps<typeof TabsPrimitive.Content> & {
  className?: string;
  children?: React.ReactNode;
};
export const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <ContentAny {...props} asChild>
        <div
          ref={ref}
          data-slot="tabs-content"
          className={cn("flex-1 outline-none", className)}
        >
          {children}
        </div>
      </ContentAny>
    );
  }
);
TabsContent.displayName = "TabsContent";
