import { forwardRef } from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const cardVariants = cva(
  "rounded-xl transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-slate-800/50 backdrop-blur-sm border border-slate-700/50",
        glass: "bg-white/5 backdrop-blur-md border border-white/10",
        glow: "bg-slate-800/50 border border-slate-700/50 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10",
        gradient: "bg-gradient-to-br from-slate-800/80 to-slate-800/40 border border-slate-700/50",
        border: "bg-transparent border border-slate-700",
        subtle: "bg-slate-800/30 border border-slate-700/30 hover:bg-slate-800/50",
      },
      padding: {
        none: "p-0",
        sm: "p-3",
        default: "p-4",
        lg: "p-6",
        xl: "p-8",
      },
      hover: {
        none: "",
        scale: "hover:scale-[1.02]",
        lift: "hover:-translate-y-1 hover:shadow-lg",
        glow: "hover:shadow-blue-500/20 hover:border-blue-500/30",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
      hover: "lift",
    },
  }
);

const Card = forwardRef(
  ({ className, variant, padding, hover, children, ...props }, ref) => {
    return (
      <div
        className={cn(cardVariants({ variant, padding, hover }))}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

const CardHeader = forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 pb-4", className)}
    {...props}
  >
    {children}
  </div>
));
CardHeader.displayName = "CardHeader";

const CardTitle = forwardRef(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight text-white", className)}
    {...props}
  >
    {children}
  </h3>
));
CardTitle.displayName = "CardTitle";

const CardDescription = forwardRef(({ className, children, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-slate-400", className)}
    {...props}
  >
    {children}
  </p>
));
CardDescription.displayName = "CardDescription";

const CardContent = forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props}>
    {children}
  </div>
));
CardContent.displayName = "CardContent";

const CardFooter = forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-4", className)}
    {...props}
  >
    {children}
  </div>
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants };
