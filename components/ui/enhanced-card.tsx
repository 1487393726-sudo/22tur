import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const enhancedCardVariants = cva(
  "bg-card/80 backdrop-blur-sm text-card-foreground flex flex-col border shadow-sm hover:shadow-md transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border-border/40 hover:border-border/60",
        elevated: "border-border/40 hover:border-border/60 shadow-md hover:shadow-lg",
        outlined: "border-border hover:border-border/80",
        ghost: "border-transparent bg-transparent hover:bg-accent/5",
        // 渐变风格卡片
        gradient: "purple-gradient-card",
      },
      size: {
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
      },
      rounded: {
        default: "rounded-xl",
        sm: "rounded-lg",
        lg: "rounded-2xl",
        none: "rounded-none",
      },
      spacing: {
        none: "gap-0",
        sm: "gap-4",
        default: "gap-6",
        lg: "gap-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "default",
      spacing: "default",
    },
  },
);

const enhancedCardHeaderVariants = cva(
  "flex flex-col space-y-2",
  {
    variants: {
      size: {
        sm: "pb-2",
        default: "pb-4",
        lg: "pb-6",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

const enhancedCardContentVariants = cva(
  "flex-1",
  {
    variants: {
      size: {
        sm: "space-y-2",
        default: "space-y-4",
        lg: "space-y-6",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

const enhancedCardFooterVariants = cva(
  "flex items-center border-t border-border/30 bg-muted/20",
  {
    variants: {
      size: {
        sm: "pt-2 gap-2",
        default: "pt-4 gap-4",
        lg: "pt-6 gap-6",
      },
      justify: {
        start: "justify-start",
        center: "justify-center",
        end: "justify-end",
        between: "justify-between",
        around: "justify-around",
      },
    },
    defaultVariants: {
      size: "default",
      justify: "between",
    },
  },
);

export interface EnhancedCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof enhancedCardVariants> {
  hover?: boolean;
  interactive?: boolean;
}

const EnhancedCard = React.forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ className, variant, size, rounded, spacing, hover = true, interactive = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        enhancedCardVariants({ variant, size, rounded, spacing }),
        hover && "hover:-translate-y-1",
        interactive && "cursor-pointer hover:scale-[1.02]",
        className
      )}
      {...props}
    />
  )
);
EnhancedCard.displayName = "EnhancedCard";

const EnhancedCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof enhancedCardHeaderVariants>
>(({ className, size, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(enhancedCardHeaderVariants({ size }), className)}
    {...props}
  />
));
EnhancedCardHeader.displayName = "EnhancedCardHeader";

const EnhancedCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  }
>(({ className, as: Comp = "h3", ...props }, ref) => (
  <Comp
    ref={ref}
    className={cn("text-lg font-semibold leading-tight tracking-tight", className)}
    {...props}
  />
));
EnhancedCardTitle.displayName = "EnhancedCardTitle";

const EnhancedCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground leading-relaxed", className)}
    {...props}
  />
));
EnhancedCardDescription.displayName = "EnhancedCardDescription";

const EnhancedCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof enhancedCardContentVariants>
>(({ className, size, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(enhancedCardContentVariants({ size }), className)}
    {...props}
  />
));
EnhancedCardContent.displayName = "EnhancedCardContent";

const EnhancedCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof enhancedCardFooterVariants>
>(({ className, size, justify, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(enhancedCardFooterVariants({ size, justify }), className)}
    {...props}
  />
));
EnhancedCardFooter.displayName = "EnhancedCardFooter";

export {
  EnhancedCard,
  EnhancedCardHeader,
  EnhancedCardFooter,
  EnhancedCardTitle,
  EnhancedCardDescription,
  EnhancedCardContent,
};