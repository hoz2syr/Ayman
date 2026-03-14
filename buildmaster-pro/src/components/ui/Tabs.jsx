import { cn } from "../../lib/utils";

const Tabs = ({ children, className }) => {
  return (
    <div className={cn("", className)}>
      {children}
    </div>
  );
};

Tabs.displayName = "Tabs";

const TabsList = ({ children, className }) => {
  return (
    <div
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-lg bg-slate-800/50 p-1 text-slate-400 border border-slate-700/50",
        className
      )}
    >
      {children}
    </div>
  );
};

const TabsTrigger = ({ value, currentValue, onClick, children, className }) => {
  const isActive = value === currentValue;
  
  return (
    <button
      onClick={() => onClick(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-300 focus-visible:outline-none",
        isActive
          ? "bg-slate-700 text-white shadow-sm"
          : "text-slate-400 hover:text-white hover:bg-slate-700/50",
        className
      )}
    >
      {children}
    </button>
  );
};

const TabsContent = ({ value, currentValue, children, className }) => {
  if (value !== currentValue) return null;
  
  return (
    <div
      className={cn(
        "mt-4 animate-fadeIn",
        className
      )}
    >
      {children}
    </div>
  );
};

export { Tabs, TabsList, TabsTrigger, TabsContent };
