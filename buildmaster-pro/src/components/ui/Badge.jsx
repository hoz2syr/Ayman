import { forwardRef } from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
        secondary: "bg-slate-500/10 text-slate-400 border border-slate-500/20",
        success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
        warning: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
        destructive: "bg-red-500/10 text-red-400 border border-red-500/20",
        info: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
        purple: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
        outline: "border border-slate-600 text-slate-400",
        glass: "bg-white/5 text-white/80 border border-white/10 backdrop-blur-sm",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px]",
        default: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Badge = forwardRef(({ className, variant, size, children, ...props }, ref) => {
  return (
    <span
      className={cn(badgeVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    >
      {children}
    </span>
  );
});

Badge.displayName = "Badge";

export { Badge, badgeVariants };
