import { forwardRef } from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40",
        secondary: "bg-slate-700 text-slate-200 hover:bg-slate-600 hover:scale-105",
        outline: "border border-slate-600 bg-transparent hover:bg-slate-800 hover:border-slate-500 text-slate-300",
        ghost: "hover:bg-slate-800 hover:text-white text-slate-400",
        destructive: "bg-red-600 text-white hover:bg-red-700 hover:scale-105 shadow-lg shadow-red-500/25",
        success: "bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-105 shadow-lg shadow-emerald-500/25",
        warning: "bg-amber-600 text-white hover:bg-amber-700 hover:scale-105 shadow-lg shadow-amber-500/25",
        gradient: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:scale-105 shadow-lg",
        glass: "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 hover:scale-105",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = forwardRef(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
