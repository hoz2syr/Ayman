import { forwardRef } from "react";
import { cn } from "../../lib/utils";

const Input = forwardRef(({ className, type, label, error, icon, ...props }, ref) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-slate-300">{label}</label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-lg border border-slate-600 bg-slate-800/50 px-3 py-2 text-sm text-white placeholder:text-slate-500",
            "focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500",
            "transition-all duration-300",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500 focus:ring-red-500/50 focus:border-red-500",
            icon && "pr-10",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  );
});

Input.displayName = "Input";

export { Input };
