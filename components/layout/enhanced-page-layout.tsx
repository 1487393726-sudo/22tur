import * as React from "react";
import { cn } from "@/lib/utils";

interface EnhancedPageLayoutProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  padding?: "none" | "sm" | "md" | "lg";
  background?: "default" | "gradient" | "muted";
}

const EnhancedPageLayout = React.forwardRef<HTMLDivElement, EnhancedPageLayoutProps>(
  ({ children, className, maxWidth = "2xl", padding = "md", background = "gradient", ...props }, ref) => {
    const maxWidthClasses = {
      sm: "max-w-2xl",
      md: "max-w-4xl", 
      lg: "max-w-6xl",
      xl: "max-w-7xl",
      "2xl": "max-w-screen-2xl",
      full: "max-w-full",
    };

    const paddingClasses = {
      none: "",
      sm: "px-4 py-6",
      md: "px-4 sm:px-6 lg:px-8 py-8",
      lg: "px-4 sm:px-6 lg:px-8 py-12",
    };

    const backgroundClasses = {
      default: "bg-background",
      gradient: "purple-gradient-page purple-gradient-content",
      muted: "bg-muted/30",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "min-h-screen",
          backgroundClasses[background],
          className
        )}
        {...props}
      >
        <div className={cn(
          "mx-auto",
          maxWidthClasses[maxWidth],
          paddingClasses[padding]
        )}>
          {children}
        </div>
      </div>
    );
  }
);

EnhancedPageLayout.displayName = "EnhancedPageLayout";

interface EnhancedPageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
  align?: "left" | "center";
}

const EnhancedPageHeader = React.forwardRef<HTMLDivElement, EnhancedPageHeaderProps>(
  ({ title, description, children, className, size = "md", align = "left", ...props }, ref) => {
    const sizeClasses = {
      sm: {
        title: "text-2xl md:text-3xl",
        description: "text-base",
        spacing: "space-y-4 mb-6",
      },
      md: {
        title: "text-3xl md:text-4xl",
        description: "text-lg",
        spacing: "space-y-6 mb-8",
      },
      lg: {
        title: "text-4xl md:text-5xl",
        description: "text-xl",
        spacing: "space-y-8 mb-12",
      },
    };

    const alignClasses = {
      left: "text-left",
      center: "text-center",
    };

    return (
      <div
        ref={ref}
        className={cn(
          sizeClasses[size].spacing,
          alignClasses[align],
          className
        )}
        {...props}
      >
        <div className="space-y-4">
          <h1 className={cn(
            "purple-gradient-title font-bold tracking-tight",
            sizeClasses[size].title
          )}>
            {title}
          </h1>
          {description && (
            <p className={cn(
              "purple-gradient-text text-muted-foreground max-w-3xl",
              sizeClasses[size].description,
              align === "center" && "mx-auto"
            )}>
              {description}
            </p>
          )}
        </div>
        {children && (
          <div className="flex items-center gap-4 mt-6">
            {children}
          </div>
        )}
      </div>
    );
  }
);

EnhancedPageHeader.displayName = "EnhancedPageHeader";

interface EnhancedSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  spacing?: "sm" | "md" | "lg";
  headerAlign?: "left" | "center";
}

const EnhancedSection = React.forwardRef<HTMLElement, EnhancedSectionProps>(
  ({ title, description, children, className, spacing = "md", headerAlign = "left", ...props }, ref) => {
    const spacingClasses = {
      sm: "space-y-4 mb-8",
      md: "space-y-6 mb-12",
      lg: "space-y-8 mb-16",
    };

    const alignClasses = {
      left: "text-left",
      center: "text-center",
    };

    return (
      <section
        ref={ref}
        className={cn(spacingClasses[spacing], className)}
        {...props}
      >
        {(title || description) && (
          <div className={cn("space-y-2 mb-6", alignClasses[headerAlign])}>
            {title && (
              <h2 className="purple-gradient-title text-2xl font-semibold tracking-tight">
                {title}
              </h2>
            )}
            {description && (
              <p className="purple-gradient-text text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        )}
        {children}
      </section>
    );
  }
);

EnhancedSection.displayName = "EnhancedSection";

export {
  EnhancedPageLayout,
  EnhancedPageHeader,
  EnhancedSection,
};