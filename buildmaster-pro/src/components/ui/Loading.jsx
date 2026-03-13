import { cn } from "../../lib/utils";

const Spinner = ({ size = "default", className }) => {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    default: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
    xl: "w-16 h-16 border-4",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-slate-600 border-t-blue-500",
        sizeClasses[size],
        className
      )}
    />
  );
};

const LoadingScreen = ({ text = "جاري التحميل..." }) => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <Spinner size="xl" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
        </div>
      </div>
      <p className="text-slate-400 text-sm animate-pulse">{text}</p>
    </div>
  );
};

const LoadingOverlay = ({ isLoading, children }) => {
  if (!isLoading) return children;
  
  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center rounded-xl z-50">
        <Spinner size="lg" />
      </div>
    </div>
  );
};

const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-slate-700/50",
        className
      )}
      {...props}
    />
  );
};

const CardSkeleton = () => (
  <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-5 border border-slate-700/50">
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-16" />
      </div>
      <Skeleton className="w-12 h-12 rounded-xl" />
    </div>
  </div>
);

const TableRowSkeleton = ({ columns = 5 }) => (
  <tr className="border-b border-slate-700/50">
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <Skeleton className="h-4 w-full" />
      </td>
    ))}
  </tr>
);

export { Spinner, LoadingScreen, LoadingOverlay, Skeleton, CardSkeleton, TableRowSkeleton };
