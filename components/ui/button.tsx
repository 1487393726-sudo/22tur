import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        glass: "glass-light will-change-[backdrop-filter,background] hover:bg-white/[0.18] dark:hover:bg-white/[0.15] active:scale-95 active:shadow-[0_1px_4px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.15)] dark:active:shadow-[0_1px_4px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.08)]",
        "glass-primary": "bg-gradient-to-r from-blue-500/20 to-purple-500/20 dark:from-blue-500/15 dark:to-purple-500/15 backdrop-blur-[10px] border border-white/20 dark:border-white/15 hover:from-blue-500/28 hover:to-purple-500/28 dark:hover:from-blue-500/22 dark:hover:to-purple-500/22 text-white shadow-[0_4px_16px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.1)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3),0_2px_4px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)] will-change-[backdrop-filter,background] active:scale-95 active:shadow-[0_2px_8px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.15)] dark:active:shadow-[0_2px_8px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.08)]",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3 md:h-9 min-h-[44px] md:min-h-0",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 md:h-8 min-h-[44px] md:min-h-0",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4 md:h-10 min-h-[44px] md:min-h-0",
        icon: "size-9 md:size-9 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0",
        "icon-sm": "size-8 md:size-8 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0",
        "icon-lg": "size-10 md:size-10 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
      data-oid="mf8vg_r"
    />
  );
}

export { Button, buttonVariants };
